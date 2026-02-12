package com.agrolink.auctionservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for processing expired auctions.
 * Runs every minute to check for auctions that have ended.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final AuctionService auctionService;

    /**
     * Process expired auctions every minute.
     * Finds all ACTIVE auctions where endTime < current time and processes them.
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    public void processExpiredAuctions() {
        log.debug("Running auction expiry check...");
        try {
            auctionService.processExpiredAuctions();
        } catch (Exception e) {
            log.error("Error processing expired auctions: {}", e.getMessage(), e);
        }
    }
}
