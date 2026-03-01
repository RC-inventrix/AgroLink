package com.agrolink.orderpaymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for receiving auction order requests from auction-service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionOrderRequest {

    // Source identifier
    private String source;
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
    private DeliveryAddressDTO deliveryAddress;

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

    /**
     * Embedded delivery address DTO.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeliveryAddressDTO {
        private String streetAddress;
        private String city;
        private String district;
        private String province;
        private String zipcode;
        private Double latitude;
        private Double longitude;
    }
}
