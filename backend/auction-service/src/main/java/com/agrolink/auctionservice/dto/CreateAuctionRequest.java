package com.agrolink.auctionservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for creating a new auction.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAuctionRequest {

    @NotNull(message = "Farmer ID is required")
    private Long farmerId;

    private String farmerName;

    @NotNull(message = "Product ID is required")
    private Long productId;

    // Product details (can be fetched from Product Service or provided)
    private String productName;
    private Double productQuantity;
    private String productImageUrl;
    private String description;

    @NotNull(message = "Start time is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    @NotNull(message = "Starting price is required")
    @Positive(message = "Starting price must be positive")
    private BigDecimal startingPrice;

    @Positive(message = "Reserve price must be positive")
    private BigDecimal reservePrice;

    // Delivery configuration
    private Boolean isDeliveryAvailable;
    private BigDecimal baseDeliveryFee;
    private BigDecimal extraFeePer3Km;

    // Pickup location
    private String pickupAddress;
    private Double pickupLatitude;
    private Double pickupLongitude;
}
