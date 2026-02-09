package com.agrolink.auctionservice.service;

import com.agrolink.auctionservice.dto.AuctionOrderRequest;
import com.agrolink.auctionservice.model.Auction;
import com.agrolink.auctionservice.model.Bid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

/**
 * Service for integrating with the order-service.
 * Handles creation of orders when auctions are won.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${order.service.url:http://localhost:8075}")
    private String orderServiceUrl;

    /**
     * Create an order in the order-service when an auction is won.
     */
    public void createAuctionOrder(Auction auction, Bid winningBid) {
        AuctionOrderRequest orderRequest = buildAuctionOrderRequest(auction, winningBid);

        String url = orderServiceUrl + "/api/orders/auction";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<AuctionOrderRequest> entity = new HttpEntity<>(orderRequest, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully created auction order for auction {} in order-service", auction.getId());
            } else {
                log.error("Failed to create auction order. Status: {}, Body: {}", 
                        response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to create auction order: " + response.getStatusCode());
            }
        } catch (RestClientException e) {
            log.error("Error communicating with order-service: {}", e.getMessage());
            throw new RuntimeException("Failed to communicate with order-service", e);
        }
    }

    /**
     * Build the auction order request payload.
     */
    private AuctionOrderRequest buildAuctionOrderRequest(Auction auction, Bid winningBid) {
        // Calculate delivery fee if delivery is available
        BigDecimal totalDeliveryFee = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(auction.getIsDeliveryAvailable()) && 
            winningBid.getDeliveryAddress() != null) {
            totalDeliveryFee = calculateDeliveryFee(auction, winningBid);
        }

        // Calculate total amount
        BigDecimal totalAmount = winningBid.getBidAmount().add(totalDeliveryFee);

        return AuctionOrderRequest.builder()
                .source("AUCTION")
                .auctionId(auction.getId())
                .productId(auction.getProductId())
                .productName(auction.getProductName())
                .productQuantity(auction.getProductQuantity())
                .productImageUrl(auction.getProductImageUrl())
                .winnerId(winningBid.getBidderId())
                .winnerName(winningBid.getBidderName())
                .winnerEmail(winningBid.getBidderEmail())
                .deliveryAddress(winningBid.getDeliveryAddress())
                .farmerId(auction.getFarmerId())
                .farmerName(auction.getFarmerName())
                .farmerAddress(auction.getPickupAddress())
                .farmerLatitude(auction.getPickupLatitude())
                .farmerLongitude(auction.getPickupLongitude())
                .winningBidAmount(winningBid.getBidAmount())
                .baseDeliveryFee(auction.getBaseDeliveryFee())
                .extraFeePer3Km(auction.getExtraFeePer3Km())
                .totalDeliveryFee(totalDeliveryFee)
                .totalAmount(totalAmount)
                .isDeliveryAvailable(auction.getIsDeliveryAvailable())
                .build();
    }

    /**
     * Calculate delivery fee based on distance.
     */
    private BigDecimal calculateDeliveryFee(Auction auction, Bid winningBid) {
        if (auction.getBaseDeliveryFee() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal fee = auction.getBaseDeliveryFee();

        // If we have coordinates, calculate distance-based fee
        if (auction.getPickupLatitude() != null && auction.getPickupLongitude() != null &&
            winningBid.getDeliveryAddress() != null && 
            winningBid.getDeliveryAddress().getLatitude() != null &&
            winningBid.getDeliveryAddress().getLongitude() != null) {
            
            double distance = calculateDistance(
                    auction.getPickupLatitude(), auction.getPickupLongitude(),
                    winningBid.getDeliveryAddress().getLatitude(),
                    winningBid.getDeliveryAddress().getLongitude()
            );

            // Base fee covers first 3km, extra fee per additional 3km
            if (distance > 3 && auction.getExtraFeePer3Km() != null) {
                double extraKm = distance - 3;
                int extraIntervals = (int) Math.ceil(extraKm / 3);
                fee = fee.add(auction.getExtraFeePer3Km().multiply(BigDecimal.valueOf(extraIntervals)));
            }
        }

        return fee;
    }

    /**
     * Calculate distance between two coordinates using Haversine formula.
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}
