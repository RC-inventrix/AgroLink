package com.agrolink.auctionservice.model;

/**
 * Enum representing the possible states of an auction.
 */
public enum AuctionStatus {
    DRAFT,      // Auction created but not yet active
    ACTIVE,     // Auction is live and accepting bids
    COMPLETED,  // Auction ended with a winner
    CANCELLED,  // Auction cancelled by farmer
    EXPIRED     // Auction ended without meeting reserve price or no bids
}
