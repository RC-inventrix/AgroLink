package com.agrolink.auctionservice.dto;

import com.agrolink.auctionservice.model.AuctionStatus;
import com.agrolink.auctionservice.model.DeliveryAddress;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    private Long highestBidderId;

    // ✅ FIX: Force Jackson to output "isWinning" instead of "winning"
    @JsonProperty("isWinning")
    private boolean isWinning;

    // ✅ FIX: Protect hasWon just in case
    @JsonProperty("hasWon")
    private boolean hasWon;

    private int myBidRank;

    private String farmerName;
    private Double productQuantity;
    private String description;

    private Boolean isDeliveryAvailable;
    private BigDecimal baseDeliveryFee;
    private BigDecimal extraFeePer3Km;

    private Double pickupLatitude;
    private Double pickupLongitude;

    private DeliveryAddress myLastBidAddress;
}