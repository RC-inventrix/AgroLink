package com.agrolink.auctionservice.controller;

import com.agrolink.auctionservice.dto.*;
import com.agrolink.auctionservice.model.Auction;
import com.agrolink.auctionservice.service.AuctionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for auction operations.
 */
@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Get all active auctions for the main listing page.
     */
    @GetMapping("/active")
    public ResponseEntity<List<AuctionListItem>> getActiveAuctions() {
        List<AuctionListItem> auctions = auctionService.getActiveAuctions();
        return ResponseEntity.ok(auctions);
    }

    /**
     * Get auction details by ID (includes top 5 bids).
     */
    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getAuctionById(@PathVariable Long id) {
        AuctionResponse auction = auctionService.getAuctionById(id);
        return ResponseEntity.ok(auction);
    }

    // ==================== FARMER ENDPOINTS ====================

    /**
     * Create a new auction.
     */
    @PostMapping
    public ResponseEntity<Auction> createAuction(@Valid @RequestBody CreateAuctionRequest request) {
        Auction auction = auctionService.createAuction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(auction);
    }

    /**
     * Get auctions by farmer ID.
     * Supports filtering by status: ONGOING, SOLD, CANCELLED
     */
    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<AuctionListItem>> getFarmerAuctions(
            @PathVariable Long farmerId,
            @RequestParam(required = false) String status) {
        List<AuctionListItem> auctions = auctionService.getAuctionsByFarmerId(farmerId, status);
        return ResponseEntity.ok(auctions);
    }

    /**
     * Update reserve price for an active auction.
     */
    @PatchMapping("/{id}/reserve-price")
    public ResponseEntity<Auction> updateReservePrice(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservePriceRequest request) {
        Auction auction = auctionService.updateReservePrice(id, request);
        return ResponseEntity.ok(auction);
    }

    /**
     * Cancel an auction.
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Auction> cancelAuction(@PathVariable Long id) {
        Auction auction = auctionService.cancelAuction(id);
        return ResponseEntity.ok(auction);
    }

    /**
     * End auction early and select winner (manual win selection).
     */
    @PostMapping("/{id}/end-early")
    public ResponseEntity<Auction> endAuctionEarly(@PathVariable Long id) {
        Auction auction = auctionService.endAuctionEarly(id);
        return ResponseEntity.ok(auction);
    }

    // ==================== BUYER ENDPOINTS ====================

    /**
     * Place a bid on an auction.
     */
    @PostMapping("/{id}/bids")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable Long id,
            @Valid @RequestBody PlaceBidRequest request) {
        BidResponse bid = auctionService.placeBid(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(bid);
    }

    /**
     * Get buyer's auction activity (active bids, won auctions, etc.).
     */
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<BuyerAuctionActivity>> getBuyerActivity(@PathVariable Long buyerId) {
        List<BuyerAuctionActivity> activity = auctionService.getBuyerAuctionActivity(buyerId);
        return ResponseEntity.ok(activity);
    }
}
