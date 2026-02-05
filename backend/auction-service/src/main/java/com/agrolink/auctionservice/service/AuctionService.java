package com.agrolink.auctionservice.service;

import com.agrolink.auctionservice.dto.*;
import com.agrolink.auctionservice.model.Auction;
import com.agrolink.auctionservice.model.AuctionStatus;
import com.agrolink.auctionservice.model.Bid;
import com.agrolink.auctionservice.repository.AuctionRepository;
import com.agrolink.auctionservice.repository.BidRepository;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final OrderIntegrationService orderIntegrationService;

    private static final int MAX_BIDS_PER_AUCTION = 5;

    /**
     * Create a new auction.
     */
    @Transactional
    public Auction createAuction(CreateAuctionRequest request) {
        Auction auction = Auction.builder()
                .farmerId(request.getFarmerId())
                .farmerName(request.getFarmerName())
                .productId(request.getProductId())
                .productName(request.getProductName())
                .productQuantity(request.getProductQuantity())
                .productImageUrl(request.getProductImageUrl())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .startingPrice(request.getStartingPrice())
                .reservePrice(request.getReservePrice())
                .currentHighestBidAmount(null)
                .isDeliveryAvailable(request.getIsDeliveryAvailable())
                .baseDeliveryFee(request.getBaseDeliveryFee())
                .extraFeePer3Km(request.getExtraFeePer3Km())
                .pickupAddress(request.getPickupAddress())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .status(determineInitialStatus(request.getStartTime()))
                .build();

        return auctionRepository.save(auction);
    }

    /**
     * Determine initial status based on start time.
     */
    private AuctionStatus determineInitialStatus(LocalDateTime startTime) {
        return startTime.isAfter(LocalDateTime.now()) ? AuctionStatus.DRAFT : AuctionStatus.ACTIVE;
    }

    /**
     * Get auction by ID with top 5 bids.
     */
    @Transactional(readOnly = true)
    public AuctionResponse getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found with id: " + id));

        List<Bid> topBids = bidRepository.findTopBidsByAuctionId(id);
        int totalBidCount = (int) bidRepository.countByAuctionId(id);

        return mapToAuctionResponse(auction, topBids, totalBidCount);
    }

    /**
     * Get all auctions by farmer ID with optional status filter.
     */
    @Transactional(readOnly = true)
    public List<AuctionListItem> getAuctionsByFarmerId(Long farmerId, String statusFilter) {
        List<Auction> auctions;

        if (statusFilter != null && !statusFilter.isEmpty()) {
            switch (statusFilter.toUpperCase()) {
                case "ONGOING":
                    auctions = auctionRepository.findByFarmerIdAndStatus(farmerId, AuctionStatus.ACTIVE);
                    break;
                case "SOLD":
                    auctions = auctionRepository.findByFarmerIdAndStatus(farmerId, AuctionStatus.COMPLETED);
                    break;
                case "CANCELLED":
                    auctions = auctionRepository.findByFarmerIdAndStatus(farmerId, AuctionStatus.CANCELLED);
                    break;
                default:
                    auctions = auctionRepository.findByFarmerId(farmerId);
            }
        } else {
            auctions = auctionRepository.findByFarmerId(farmerId);
        }

        return auctions.stream()
                .map(this::mapToAuctionListItem)
                .collect(Collectors.toList());
    }

    /**
     * Get all active auctions for listing page.
     */
    @Transactional(readOnly = true)
    public List<AuctionListItem> getActiveAuctions() {
        List<Auction> auctions = auctionRepository.findActiveAuctions(LocalDateTime.now());
        return auctions.stream()
                .map(this::mapToAuctionListItem)
                .collect(Collectors.toList());
    }

    /**
     * Place a bid on an auction with concurrency handling and top 5 retention.
     */
    @Transactional
    public BidResponse placeBid(Long auctionId, PlaceBidRequest request) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found with id: " + auctionId));

        // Validate auction status
        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new RuntimeException("Auction is not active. Current status: " + auction.getStatus());
        }

        // Validate bid time
        if (LocalDateTime.now().isAfter(auction.getEndTime())) {
            throw new RuntimeException("Auction has ended");
        }

        // Validate bid amount
        BigDecimal minimumBid = auction.getCurrentHighestBidAmount() != null 
                ? auction.getCurrentHighestBidAmount() 
                : auction.getStartingPrice();

        if (request.getBidAmount().compareTo(minimumBid) <= 0) {
            throw new RuntimeException("Bid amount must be greater than current highest bid: " + minimumBid);
        }

        // Create and save the bid
        Bid bid = Bid.builder()
                .auction(auction)
                .bidderId(request.getBidderId())
                .bidderName(request.getBidderName())
                .bidderEmail(request.getBidderEmail())
                .bidAmount(request.getBidAmount())
                .bidTime(LocalDateTime.now())
                .deliveryAddress(request.getDeliveryAddress())
                .build();

        bid = bidRepository.save(bid);

        // Update auction's current highest bid amount
        auction.setCurrentHighestBidAmount(request.getBidAmount());
        
        try {
            auctionRepository.save(auction);
        } catch (OptimisticLockException e) {
            log.warn("Optimistic lock exception while placing bid on auction {}", auctionId);
            throw new RuntimeException("Another bid was placed simultaneously. Please try again.");
        }

        // Apply retention policy: keep only top 5 bids
        pruneExcessBids(auctionId);

        log.info("Bid placed successfully on auction {}: amount={}, bidder={}", 
                auctionId, request.getBidAmount(), request.getBidderId());

        return mapToBidResponse(bid, 1);
    }

    /**
     * Prune excess bids, keeping only the top 5.
     */
    @Transactional
    public void pruneExcessBids(Long auctionId) {
        long bidCount = bidRepository.countByAuctionId(auctionId);
        
        if (bidCount > MAX_BIDS_PER_AUCTION) {
            List<Bid> allBids = bidRepository.findBidsToDelete(auctionId);
            int bidsToDelete = (int) (bidCount - MAX_BIDS_PER_AUCTION);
            
            // Delete the lowest bids (they are sorted ascending by amount)
            for (int i = 0; i < bidsToDelete && i < allBids.size(); i++) {
                bidRepository.delete(allBids.get(i));
            }
            
            log.info("Pruned {} excess bids from auction {}", bidsToDelete, auctionId);
        }
    }

    /**
     * Update reserve price (only while auction is active).
     */
    @Transactional
    public Auction updateReservePrice(Long auctionId, UpdateReservePriceRequest request) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found with id: " + auctionId));

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new RuntimeException("Reserve price can only be updated for active auctions");
        }

        auction.setReservePrice(request.getReservePrice());
        return auctionRepository.save(auction);
    }

    /**
     * Cancel an auction.
     */
    @Transactional
    public Auction cancelAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found with id: " + auctionId));

        if (auction.getStatus() == AuctionStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed auction");
        }

        auction.setStatus(AuctionStatus.CANCELLED);
        return auctionRepository.save(auction);
    }

    /**
     * End auction early and select winner (manual win selection by farmer).
     */
    @Transactional
    public Auction endAuctionEarly(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found with id: " + auctionId));

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new RuntimeException("Only active auctions can be ended early");
        }

        // Find the highest bidder
        Bid highestBid = bidRepository.findTopByAuctionIdOrderByBidAmountDesc(auctionId)
                .orElseThrow(() -> new RuntimeException("No bids found on this auction"));

        // Complete the auction
        auction.setWinningBidId(highestBid.getId());
        auction.setStatus(AuctionStatus.COMPLETED);
        auction.setEndTime(LocalDateTime.now());
        auction = auctionRepository.save(auction);

        // Trigger "Auction Won" flow
        triggerAuctionWonFlow(auction, highestBid);

        log.info("Auction {} ended early. Winner: bidder {}", auctionId, highestBid.getBidderId());

        return auction;
    }

    /**
     * Process expired auctions (called by scheduler).
     */
    @Transactional
    public void processExpiredAuctions() {
        List<Auction> expiredAuctions = auctionRepository.findExpiredAuctions(
                AuctionStatus.ACTIVE, LocalDateTime.now());

        for (Auction auction : expiredAuctions) {
            processAuctionEnd(auction);
        }

        if (!expiredAuctions.isEmpty()) {
            log.info("Processed {} expired auctions", expiredAuctions.size());
        }
    }

    /**
     * Process the end of an auction.
     */
    @Transactional
    public void processAuctionEnd(Auction auction) {
        Bid highestBid = bidRepository.findTopByAuctionIdOrderByBidAmountDesc(auction.getId())
                .orElse(null);

        if (highestBid == null) {
            // No bids - mark as expired
            auction.setStatus(AuctionStatus.EXPIRED);
            auctionRepository.save(auction);
            log.info("Auction {} expired with no bids", auction.getId());
            return;
        }

        // Check if reserve price is met
        if (auction.getReservePrice() != null && 
            highestBid.getBidAmount().compareTo(auction.getReservePrice()) < 0) {
            // Reserve price not met - mark as expired
            auction.setStatus(AuctionStatus.EXPIRED);
            auctionRepository.save(auction);
            log.info("Auction {} expired - reserve price not met", auction.getId());
            return;
        }

        // Auction won - complete it
        auction.setWinningBidId(highestBid.getId());
        auction.setStatus(AuctionStatus.COMPLETED);
        auctionRepository.save(auction);

        // Trigger "Auction Won" flow
        triggerAuctionWonFlow(auction, highestBid);

        log.info("Auction {} completed. Winner: bidder {} with bid {}", 
                auction.getId(), highestBid.getBidderId(), highestBid.getBidAmount());
    }

    /**
     * Trigger the "Auction Won" flow - send order to order-service.
     */
    private void triggerAuctionWonFlow(Auction auction, Bid winningBid) {
        try {
            orderIntegrationService.createAuctionOrder(auction, winningBid);
        } catch (Exception e) {
            log.error("Failed to create order for auction {}: {}", auction.getId(), e.getMessage());
            // Note: In production, you might want to implement retry logic or a dead letter queue
        }
    }

    /**
     * Get buyer's auction activity.
     */
    @Transactional(readOnly = true)
    public List<BuyerAuctionActivity> getBuyerAuctionActivity(Long buyerId) {
        List<Bid> buyerBids = bidRepository.findByBidderId(buyerId);
        
        return buyerBids.stream()
                .map(bid -> {
                    Auction auction = bid.getAuction();
                    List<Bid> topBids = bidRepository.findTopBidsByAuctionId(auction.getId());
                    
                    int rank = IntStream.range(0, topBids.size())
                            .filter(i -> topBids.get(i).getBidderId().equals(buyerId))
                            .findFirst()
                            .orElse(-1) + 1;

                    boolean isWinning = !topBids.isEmpty() && 
                            topBids.get(0).getBidderId().equals(buyerId);
                    boolean hasWon = auction.getStatus() == AuctionStatus.COMPLETED && 
                            auction.getWinningBidId() != null &&
                            auction.getWinningBidId().equals(bid.getId());

                    return BuyerAuctionActivity.builder()
                            .auctionId(auction.getId())
                            .productName(auction.getProductName())
                            .productImageUrl(auction.getProductImageUrl())
                            .auctionStatus(auction.getStatus())
                            .auctionEndTime(auction.getEndTime())
                            .myHighestBid(bid.getBidAmount())
                            .currentHighestBid(auction.getCurrentHighestBidAmount())
                            .isWinning(isWinning)
                            .hasWon(hasWon)
                            .myBidRank(rank)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Map Auction entity to AuctionResponse DTO.
     */
    private AuctionResponse mapToAuctionResponse(Auction auction, List<Bid> topBids, int totalBidCount) {
        List<BidResponse> bidResponses = IntStream.range(0, Math.min(topBids.size(), MAX_BIDS_PER_AUCTION))
                .mapToObj(i -> mapToBidResponse(topBids.get(i), i + 1))
                .collect(Collectors.toList());

        return AuctionResponse.builder()
                .id(auction.getId())
                .farmerId(auction.getFarmerId())
                .farmerName(auction.getFarmerName())
                .productId(auction.getProductId())
                .productName(auction.getProductName())
                .productQuantity(auction.getProductQuantity())
                .productImageUrl(auction.getProductImageUrl())
                .description(auction.getDescription())
                .status(auction.getStatus())
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .startingPrice(auction.getStartingPrice())
                .reservePrice(auction.getReservePrice())
                .currentHighestBidAmount(auction.getCurrentHighestBidAmount())
                .winningBidId(auction.getWinningBidId())
                .isDeliveryAvailable(auction.getIsDeliveryAvailable())
                .baseDeliveryFee(auction.getBaseDeliveryFee())
                .extraFeePer3Km(auction.getExtraFeePer3Km())
                .pickupAddress(auction.getPickupAddress())
                .pickupLatitude(auction.getPickupLatitude())
                .pickupLongitude(auction.getPickupLongitude())
                .topBids(bidResponses)
                .totalBidCount(totalBidCount)
                .createdAt(auction.getCreatedAt())
                .updatedAt(auction.getUpdatedAt())
                .build();
    }

    /**
     * Map Auction entity to AuctionListItem DTO.
     */
    private AuctionListItem mapToAuctionListItem(Auction auction) {
        int bidCount = (int) bidRepository.countByAuctionId(auction.getId());

        return AuctionListItem.builder()
                .id(auction.getId())
                .farmerId(auction.getFarmerId())
                .farmerName(auction.getFarmerName())
                .productName(auction.getProductName())
                .productQuantity(auction.getProductQuantity())
                .productImageUrl(auction.getProductImageUrl())
                .description(auction.getDescription())
                .status(auction.getStatus())
                .endTime(auction.getEndTime())
                .startingPrice(auction.getStartingPrice())
                .currentHighestBidAmount(auction.getCurrentHighestBidAmount())
                .bidCount(bidCount)
                .isDeliveryAvailable(auction.getIsDeliveryAvailable())
                .build();
    }

    /**
     * Map Bid entity to BidResponse DTO.
     */
    private BidResponse mapToBidResponse(Bid bid, int rank) {
        return BidResponse.builder()
                .id(bid.getId())
                .auctionId(bid.getAuction().getId())
                .bidderId(bid.getBidderId())
                .bidderName(bid.getBidderName())
                .bidAmount(bid.getBidAmount())
                .bidTime(bid.getBidTime())
                .deliveryAddress(bid.getDeliveryAddress())
                .rank(rank)
                .build();
    }
}
