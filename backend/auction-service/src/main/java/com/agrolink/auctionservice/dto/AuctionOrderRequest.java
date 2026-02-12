package com.agrolink.auctionservice.dto;

import com.agrolink.auctionservice.model.DeliveryAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for sending auction order to order-service.
 * This is the payload sent when an auction is won.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionOrderRequest {

    // Source identifier
    @Builder.Default
    private String source = "AUCTION";
    private Long auctionId;

    // Product details
    private Long productId;
    private String productName;
    private Double productQuantity;
    private String productImageUrl;

    // Winner details
    private Long winnerId;
    private String winnerName;
    private String winnerEmail;
    private DeliveryAddress deliveryAddress;

    // Seller/Farmer details
    private Long farmerId;
    private String farmerName;
    private String farmerAddress;
    private Double farmerLatitude;
    private Double farmerLongitude;

    // Pricing
    private BigDecimal winningBidAmount;
    private BigDecimal baseDeliveryFee;
    private BigDecimal extraFeePer3Km;
    private BigDecimal totalDeliveryFee;
    private BigDecimal totalAmount;

    // Flags
    private Boolean isDeliveryAvailable;
}
