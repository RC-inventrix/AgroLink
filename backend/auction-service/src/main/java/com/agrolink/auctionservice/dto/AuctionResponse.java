package com.agrolink.auctionservice.dto;

import com.agrolink.auctionservice.model.AuctionStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for auction response with top bids.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionResponse {

    private Long id;
    private Long farmerId;
    private String farmerName;
    private Long productId;
    private String productName;
    private Double productQuantity;
    private String productImageUrl;
    private String description;

    private AuctionStatus status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    private BigDecimal startingPrice;
    private BigDecimal reservePrice;
    private BigDecimal currentHighestBidAmount;
    private Long winningBidId;

    // Delivery info
    private Boolean isDeliveryAvailable;
    private BigDecimal baseDeliveryFee;
    private BigDecimal extraFeePer3Km;

    // Pickup location
    private String pickupAddress;
    private Double pickupLatitude;
    private Double pickupLongitude;

    // Top 5 bids
    private List<BidResponse> topBids;

    private int totalBidCount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
