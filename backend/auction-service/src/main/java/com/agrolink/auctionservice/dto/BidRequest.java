package com.agrolink.auctionservice.dto;

import lombok.Data;
import lombok.Getter;

import java.math.BigDecimal;

@Data
public class BidRequest {
    // These fields match the JSON sent from AuctionBidPopup.tsx
    private Long bidderId;

    private BigDecimal bidAmount;

    // Optional: Include these if you want to capture the address sent by frontend
    // (even if you handle it differently in logic, the DTO needs to receive it)
    private Object deliveryAddress;

    // Note: bidderName and bidderEmail are sent by frontend,
    // but since we fetch them securely from User Service,
    // we don't strictly need them here unless you want to log them.
}