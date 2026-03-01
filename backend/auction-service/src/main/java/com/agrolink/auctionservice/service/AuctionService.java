package com.agrolink.auctionservice.service;

import com.agrolink.auctionservice.client.UserServiceClient;
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
import java.util.Comparator;
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
    private final UserServiceClient userServiceClient;

    private static final int MAX_BIDS_PER_AUCTION = 5;

    @Transactional
    public void activateScheduledAuctions() {
        List<Auction> readyAuctions = auctionRepository.findByStatusAndStartTimeBefore(
                AuctionStatus.DRAFT, LocalDateTime.now());

        for (Auction auction : readyAuctions) {
            auction.setStatus(AuctionStatus.ACTIVE);
            auctionRepository.save(auction);
            log.info("Activated scheduled auction: ID {}, Product: {}", auction.getId(), auction.getProductName());
        }
    }

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
                .highestBidderId(null) // Initialize as null
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

    private AuctionStatus determineInitialStatus(LocalDateTime startTime) {
        return startTime.isAfter(LocalDateTime.now()) ? AuctionStatus.DRAFT : AuctionStatus.ACTIVE;
    }

    @Transactional(readOnly = true)
    public AuctionResponse getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found with id: " + id));

        List<Bid> topBids = bidRepository.findTopBidsByAuctionId(id);
        int totalBidCount = (int) bidRepository.countByAuctionId(id);

        return mapToAuctionResponse(auction, topBids, totalBidCount);
    }

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
        return auctions.stream().map(this::mapToAuctionListItem).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuctionListItem> getActiveAuctions() {
        List<Auction> auctions = auctionRepository.findActiveAuctions(LocalDateTime.now());
        return auctions.stream().map(this::mapToAuctionListItem).collect(Collectors.toList());
    }

    @Transactional
    public BidResponse placeBid(Long auctionId, PlaceBidRequest request) {
        log.info("Verifying Bidder ID: {}", request.getBidderId());
        UserResponseDto bidderInfo = userServiceClient.getUserById(request.getBidderId());

        if (bidderInfo == null) {
            throw new RuntimeException("Bid rejected: User verification failed (Order Service unreachable or User ID invalid).");
        }

        String safeName = (bidderInfo.getFullname() != null) ? bidderInfo.getFullname() : "Verified Bidder";
        String safeEmail = (bidderInfo.getEmail() != null) ? bidderInfo.getEmail() : "no-email@agrolink.com";

        log.info("Bidder Verified: Name={}, Email={}", safeName, safeEmail);

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found with id: " + auctionId));

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new RuntimeException("Auction is not active. Current status: " + auction.getStatus());
        }
        if (LocalDateTime.now().isAfter(auction.getEndTime())) {
            throw new RuntimeException("Auction has ended");
        }

        BigDecimal minimumBid = auction.getCurrentHighestBidAmount() != null
                ? auction.getCurrentHighestBidAmount()
                : auction.getStartingPrice();

        if (request.getBidAmount().compareTo(minimumBid) <= 0) {
            throw new RuntimeException("Bid amount must be greater than current highest bid: " + minimumBid);
        }

        Bid bid = Bid.builder()
                .auction(auction)
                .bidderId(request.getBidderId())
                .bidderName(safeName)
                .bidderEmail(safeEmail)
                .bidAmount(request.getBidAmount())
                .bidTime(LocalDateTime.now())
                .deliveryAddress(request.getDeliveryAddress())
                .build();

        bid = bidRepository.save(bid);

        // ✅ ATOMIC UPDATE: Update both amount and owner ID on the auction record
        auction.setCurrentHighestBidAmount(request.getBidAmount());
        auction.setHighestBidderId(request.getBidderId());

        try {
            auctionRepository.save(auction);
        } catch (OptimisticLockException e) {
            log.warn("Optimistic lock exception while placing bid on auction {}", auctionId);
            throw new RuntimeException("Another bid was placed simultaneously. Please try again.");
        }

        pruneExcessBids(auctionId);

        return mapToBidResponse(bid, 1);
    }

    @Transactional
    public void pruneExcessBids(Long auctionId) {
        long bidCount = bidRepository.countByAuctionId(auctionId);
        if (bidCount > MAX_BIDS_PER_AUCTION) {
            List<Bid> allBids = bidRepository.findBidsToDelete(auctionId);
            int bidsToDelete = (int) (bidCount - MAX_BIDS_PER_AUCTION);
            for (int i = 0; i < bidsToDelete && i < allBids.size(); i++) {
                bidRepository.delete(allBids.get(i));
            }
        }
    }

    @Transactional
    public Auction updateReservePrice(Long auctionId, UpdateReservePriceRequest request) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        if (auction.getStatus() != AuctionStatus.ACTIVE && auction.getStatus() != AuctionStatus.DRAFT) {
            throw new RuntimeException("Reserve price can only be updated for active or draft auctions");
        }
        auction.setReservePrice(request.getReservePrice());
        return auctionRepository.save(auction);
    }

    @Transactional
    public Auction startAuctionNow(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId).orElseThrow(() -> new RuntimeException("Auction not found"));
        if (auction.getStatus() != AuctionStatus.DRAFT) {
            throw new RuntimeException("Only draft auctions can be started immediately.");
        }
        auction.setStartTime(LocalDateTime.now());
        auction.setStatus(AuctionStatus.ACTIVE);
        return auctionRepository.save(auction);
    }

    @Transactional
    public Auction updateAuctionTime(Long auctionId, LocalDateTime newStart, LocalDateTime newEnd) {
        Auction auction = auctionRepository.findById(auctionId).orElseThrow(() -> new RuntimeException("Auction not found"));
        if (auction.getStatus() == AuctionStatus.DRAFT) {
            if (newStart != null) auction.setStartTime(newStart);
            if (newEnd != null) auction.setEndTime(newEnd);
        } else if (auction.getStatus() == AuctionStatus.ACTIVE) {
            if (newStart != null) throw new RuntimeException("Cannot change start time of an active auction.");
            if (newEnd != null) {
                if (newEnd.isBefore(LocalDateTime.now())) throw new RuntimeException("New end time cannot be in the past.");
                auction.setEndTime(newEnd);
            }
        } else {
            throw new RuntimeException("Cannot update time for completed or cancelled auctions.");
        }
        return auctionRepository.save(auction);
    }

    @Transactional
    public Auction cancelAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId).orElseThrow(() -> new RuntimeException("Auction not found"));
        if (auction.getStatus() == AuctionStatus.COMPLETED) throw new RuntimeException("Cannot cancel a completed auction");
        auction.setStatus(AuctionStatus.CANCELLED);
        return auctionRepository.save(auction);
    }

    @Transactional
    public Auction endAuctionEarly(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId).orElseThrow(() -> new RuntimeException("Auction not found"));
        if (auction.getStatus() != AuctionStatus.ACTIVE) throw new RuntimeException("Only active auctions can be ended early");

        Bid highestBid = bidRepository.findTopByAuctionIdOrderByBidAmountDesc(auctionId)
                .orElseThrow(() -> new RuntimeException("No bids found on this auction"));

        auction.setWinningBidId(highestBid.getId());
        auction.setStatus(AuctionStatus.COMPLETED);
        auction.setEndTime(LocalDateTime.now());
        auction = auctionRepository.save(auction);
        triggerAuctionWonFlow(auction, highestBid);
        return auction;
    }

    @Transactional
    public void processExpiredAuctions() {
        List<Auction> expiredAuctions = auctionRepository.findExpiredAuctions(AuctionStatus.ACTIVE, LocalDateTime.now());
        for (Auction auction : expiredAuctions) processAuctionEnd(auction);
    }

    @Transactional
    public void processAuctionEnd(Auction auction) {
        Bid highestBid = bidRepository.findTopByAuctionIdOrderByBidAmountDesc(auction.getId()).orElse(null);
        if (highestBid == null) {
            auction.setStatus(AuctionStatus.EXPIRED);
            auctionRepository.save(auction);
            return;
        }
        if (auction.getReservePrice() != null && highestBid.getBidAmount().compareTo(auction.getReservePrice()) < 0) {
            auction.setStatus(AuctionStatus.EXPIRED);
            auctionRepository.save(auction);
            return;
        }
        auction.setWinningBidId(highestBid.getId());
        auction.setStatus(AuctionStatus.COMPLETED);
        auctionRepository.save(auction);
        triggerAuctionWonFlow(auction, highestBid);
    }

    private void triggerAuctionWonFlow(Auction auction, Bid winningBid) {
        try {
            orderIntegrationService.createAuctionOrder(auction, winningBid);
        } catch (Exception e) {
            log.error("Failed to create order for auction {}: {}", auction.getId(), e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<BuyerAuctionActivity> getBuyerAuctionActivity(Long buyerId) {
        List<Auction> userAuctions = auctionRepository.findAuctionsWithBidsByBidderId(buyerId);
        return userAuctions.stream().map(auction -> {
            List<Bid> myBids = bidRepository.findByAuctionIdAndBidderId(auction.getId(), buyerId);
            if (myBids.isEmpty()) return null;

            Bid myHighestBid = myBids.stream().max(Comparator.comparing(Bid::getBidAmount)).orElseThrow();
            List<Bid> topBids = bidRepository.findTopBidsByAuctionId(auction.getId());

            // ✅ FALLBACK LOGIC: Handle legacy auctions where highestBidderId is null
            Long actualHighestBidderId = auction.getHighestBidderId();
            if (actualHighestBidderId == null && !topBids.isEmpty()) {
                actualHighestBidderId = topBids.get(0).getBidderId();
            }

            // ✅ EXACT OWNERSHIP CALCULATION
            boolean isWinning = actualHighestBidderId != null && actualHighestBidderId.equals(buyerId);

            boolean hasWon = auction.getStatus() == AuctionStatus.COMPLETED &&
                    auction.getWinningBidId() != null &&
                    auction.getWinningBidId().equals(myHighestBid.getId());

            int rank = -1;
            for (int i = 0; i < topBids.size(); i++) {
                if (topBids.get(i).getBidderId().equals(buyerId)) {
                    rank = i + 1;
                    break;
                }
            }
            int displayRank = (rank != -1) ? rank : 6;

            return BuyerAuctionActivity.builder()
                    .auctionId(auction.getId())
                    .productName(auction.getProductName())
                    .productImageUrl(auction.getProductImageUrl())
                    .auctionStatus(auction.getStatus())
                    .auctionEndTime(auction.getEndTime())
                    .myHighestBid(myHighestBid.getBidAmount())
                    .currentHighestBid(auction.getCurrentHighestBidAmount())
                    .highestBidderId(actualHighestBidderId) // ✅ Exporting the guaranteed ID
                    .isWinning(isWinning)
                    .hasWon(hasWon)
                    .myBidRank(displayRank)
                    .farmerName(auction.getFarmerName())
                    .productQuantity(auction.getProductQuantity())
                    .description(auction.getDescription())
                    .isDeliveryAvailable(auction.getIsDeliveryAvailable())
                    .baseDeliveryFee(auction.getBaseDeliveryFee())
                    .extraFeePer3Km(auction.getExtraFeePer3Km())
                    .pickupLatitude(auction.getPickupLatitude())
                    .pickupLongitude(auction.getPickupLongitude())
                    .myLastBidAddress(myHighestBid.getDeliveryAddress())
                    .build();
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
    }

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
                .reservePrice(auction.getReservePrice())
                .pickupAddress(auction.getPickupAddress())
                .pickupLatitude(auction.getPickupLatitude())
                .pickupLongitude(auction.getPickupLongitude())
                .build();
    }

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