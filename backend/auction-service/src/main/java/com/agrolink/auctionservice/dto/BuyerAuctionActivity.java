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
 * DTO for buyer's auction activity (my bids, won auctions).
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
}
