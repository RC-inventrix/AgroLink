/* fileName: auctionservice/controller/AuctionController.java */
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

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    @GetMapping("/active")
    public ResponseEntity<List<AuctionListItem>> getActiveAuctions() {
        List<AuctionListItem> auctions = auctionService.getActiveAuctions();
        return ResponseEntity.ok(auctions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getAuctionById(@PathVariable Long id) {
        AuctionResponse auction = auctionService.getAuctionById(id);
        return ResponseEntity.ok(auction);
    }

    @PostMapping
    public ResponseEntity<Auction> createAuction(@Valid @RequestBody CreateAuctionRequest request) {
        Auction auction = auctionService.createAuction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(auction);
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<AuctionListItem>> getFarmerAuctions(
            @PathVariable Long farmerId,
            @RequestParam(required = false) String status) {
        List<AuctionListItem> auctions = auctionService.getAuctionsByFarmerId(farmerId, status);
        return ResponseEntity.ok(auctions);
    }

    @PostMapping("/{id}/start-now")
    public ResponseEntity<Auction> startAuctionNow(@PathVariable Long id) {
        Auction auction = auctionService.startAuctionNow(id);
        return ResponseEntity.ok(auction);
    }

    @PatchMapping("/{id}/time")
    public ResponseEntity<Auction> updateAuctionTime(
            @PathVariable Long id,
            @RequestBody UpdateTimeRequest request) {
        Auction auction = auctionService.updateAuctionTime(id, request.getStartTime(), request.getEndTime());
        return ResponseEntity.ok(auction);
    }

    @PatchMapping("/{id}/reserve-price")
    public ResponseEntity<Auction> updateReservePrice(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservePriceRequest request) {
        Auction auction = auctionService.updateReservePrice(id, request);
        return ResponseEntity.ok(auction);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Auction> cancelAuction(@PathVariable Long id) {
        Auction auction = auctionService.cancelAuction(id);
        return ResponseEntity.ok(auction);
    }

    @PostMapping("/{id}/end-early")
    public ResponseEntity<Auction> endAuctionEarly(@PathVariable Long id) {
        Auction auction = auctionService.endAuctionEarly(id);
        return ResponseEntity.ok(auction);
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable Long id,
            @Valid @RequestBody PlaceBidRequest request) {
        BidResponse bid = auctionService.placeBid(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(bid);
    }

    // Safely handles both path variations to prevent 404 errors on the frontend
    @GetMapping({"/buyer/{buyerId}", "/buyer/{buyerId}/activity"})
    public ResponseEntity<List<BuyerAuctionActivity>> getBuyerActivity(@PathVariable Long buyerId) {
        List<BuyerAuctionActivity> activity = auctionService.getBuyerAuctionActivity(buyerId);
        return ResponseEntity.ok(activity);
    }
}