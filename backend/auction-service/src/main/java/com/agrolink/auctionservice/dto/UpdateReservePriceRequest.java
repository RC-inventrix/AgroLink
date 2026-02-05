package com.agrolink.auctionservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for updating reserve price.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateReservePriceRequest {

    @NotNull(message = "Reserve price is required")
    @Positive(message = "Reserve price must be positive")
    private BigDecimal reservePrice;
}
