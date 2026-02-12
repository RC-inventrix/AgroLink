package com.agrolink.auctionservice.dto;

import com.agrolink.auctionservice.model.AuctionStatus;
import com.agrolink.auctionservice.model.DeliveryAddress;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Updated DTO for buyer's auction activity.
 * Includes extended product details and delivery configuration.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyerAuctionActivity {

    private Long auctionId;
    private String productName;
    private String productImageUrl;
    private AuctionStatus auctionStatus;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime auctionEndTime;

    private BigDecimal myHighestBid;
    private BigDecimal currentHighestBid;
    private boolean isWinning;
    private boolean hasWon;
    private int myBidRank;

    // --- NEW FIELDS FOR UI ENHANCEMENT ---
    private String farmerName;
    private Double productQuantity;
    private String description;

    // Delivery Configuration
    private Boolean isDeliveryAvailable;
    private BigDecimal baseDeliveryFee;
    private BigDecimal extraFeePer3Km;

    // Coordinates for Fee Calculation
    private Double pickupLatitude;
    private Double pickupLongitude;

    // User's previous context
    private DeliveryAddress myLastBidAddress;
}