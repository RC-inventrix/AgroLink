package com.agrolink.auctionservice.dto;

import com.agrolink.auctionservice.model.AuctionStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for listing auctions (simplified view).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionListItem {

    private Long id;
    private Long farmerId;
    private String farmerName;
    private String productName;
    private Double productQuantity;
    private String productImageUrl;
    private String description;

    private AuctionStatus status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    private BigDecimal startingPrice;
    private BigDecimal currentHighestBidAmount;
    private int bidCount;

    private Boolean isDeliveryAvailable;
    private BigDecimal reservePrice;
    private String pickupAddress;

    // FIX: Added coordinates to support map/distance on listing & popup
    private Double pickupLatitude;
    private Double pickupLongitude;
}