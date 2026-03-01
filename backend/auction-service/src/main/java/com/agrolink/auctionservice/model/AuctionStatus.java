package com.agrolink.auctionservice.model;

public enum AuctionStatus {
    DRAFT,      // Scheduled for future
    ACTIVE,     // Currently bidding
    COMPLETED,  // Sold
    CANCELLED,  // Cancelled by farmer
    EXPIRED     // Time ended with no bids
}