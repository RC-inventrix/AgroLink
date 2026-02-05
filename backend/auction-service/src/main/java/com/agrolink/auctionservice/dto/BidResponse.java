package com.agrolink.auctionservice.dto;

import com.agrolink.auctionservice.model.DeliveryAddress;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for bid response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidResponse {

    private Long id;
    private Long auctionId;
    private Long bidderId;
    private String bidderName;
    private BigDecimal bidAmount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bidTime;

    private DeliveryAddress deliveryAddress;
    private int rank; // Position in the bid ranking (1 = highest)
}
