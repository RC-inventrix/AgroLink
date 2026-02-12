package com.agrolink.auctionservice.dto;

import com.agrolink.auctionservice.model.DeliveryAddress;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for placing a bid on an auction.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceBidRequest {

    @NotNull(message = "Bidder ID is required")
    private Long bidderId;

    private String bidderName;
    private String bidderEmail;

    @NotNull(message = "Bid amount is required")
    @Positive(message = "Bid amount must be positive")
    private BigDecimal bidAmount;

    // Delivery address for the bid
    private DeliveryAddress deliveryAddress;
}
