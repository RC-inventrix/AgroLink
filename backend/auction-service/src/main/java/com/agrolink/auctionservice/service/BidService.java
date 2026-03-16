package com.agrolink.auctionservice.service;

import com.agrolink.auctionservice.client.UserServiceClient;
import com.agrolink.auctionservice.dto.BidRequest;
import com.agrolink.auctionservice.dto.UserResponseDto;
import com.agrolink.auctionservice.model.Auction;
import com.agrolink.auctionservice.model.Bid;
import com.agrolink.auctionservice.repository.AuctionRepository;
import com.agrolink.auctionservice.repository.BidRepository;
import lombok.extern.slf4j.Slf4j; // 1. Import Slf4j
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j // 2. Add Logging Annotation
public class BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserServiceClient userServiceClient;

    @Transactional
    public Bid placeBid(Long auctionId, BidRequest bidRequest) {
        log.info("Processing bid for Bidder ID: {}", bidRequest.getBidderId());

        // 1. Fetch User Data
        UserResponseDto bidderInfo = userServiceClient.getUserById(bidRequest.getBidderId());

        // --- DEBUG LOGGING ---
        if (bidderInfo != null) {
            log.info("Received User Data from Order Service: ID={}, Name={}, Email={}",
                    bidderInfo.getId(), bidderInfo.getFullname(), bidderInfo.getEmail());
        } else {
            log.error("Received NULL User Data from Order Service");
        }
        // ---------------------

        if (bidderInfo == null) {
            throw new RuntimeException("Bidder validation failed: User not found");
        }

        // 2. Fetch Auction
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // 3. Create Bid Object
        Bid newBid = new Bid();
        newBid.setAuction(auction);
        newBid.setBidAmount(bidRequest.getBidAmount());
        newBid.setBidTime(LocalDateTime.now());

        // 4. Set Data with Fallbacks (Prevent Null Inserts)
        newBid.setBidderId(bidderInfo.getId());

        // If API returns null, we use a placeholder instead of saving NULL to DB
        String nameToSave = (bidderInfo.getFullname() != null && !bidderInfo.getFullname().isEmpty())
                ? bidderInfo.getFullname()
                : "Unknown Bidder (ID: " + bidderInfo.getId() + ")";

        String emailToSave = (bidderInfo.getEmail() != null && !bidderInfo.getEmail().isEmpty())
                ? bidderInfo.getEmail()
                : "no-email@agrolink.com";

        newBid.setBidderName(nameToSave);
        newBid.setBidderEmail(emailToSave);

        // 5. Save
        return bidRepository.save(newBid);
    }
}