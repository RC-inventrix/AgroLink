package com.agrolink.auctionservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final AuctionService auctionService;

    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    public void processExpiredAuctions() {
        log.debug("Running auction expiry check...");
        try {
            auctionService.processExpiredAuctions();
        } catch (Exception e) {
            log.error("Error processing expired auctions: {}", e.getMessage(), e);
        }
    }

    @Scheduled(fixedRate = 60000) // Every 1 minute
    public void checkScheduledAuctions() {
        auctionService.activateScheduledAuctions();
    }

    /**
     * ✅ NEW: Database Watcher to ensure no orders are lost due to network drops.
     */
    @Scheduled(fixedRate = 60000) // Every 1 minute
    public void retryOrderTransfers() {
        log.debug("Running order transfer retry check...");
        try {
            auctionService.retryFailedOrderTransfers();
        } catch (Exception e) {
            log.error("Error retrying order transfers: {}", e.getMessage(), e);
        }
    }
}