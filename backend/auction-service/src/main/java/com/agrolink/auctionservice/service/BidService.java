package com.agrolink.auctionservice.service;

import com.agrolink.auctionservice.client.UserServiceClient;
import com.agrolink.auctionservice.dto.BidRequest;
import com.agrolink.auctionservice.dto.UserResponseDto;
import com.agrolink.auctionservice.model.Auction; // Import Auction
import com.agrolink.auctionservice.model.Bid;
import com.agrolink.auctionservice.repository.AuctionRepository; // Import AuctionRepository
import com.agrolink.auctionservice.repository.BidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionRepository auctionRepository; // <--- Add this

    @Autowired
    private UserServiceClient userServiceClient;

    @Transactional
    public Bid placeBid(Long auctionId, BidRequest bidRequest) {
        // 1. Validate User
        UserResponseDto bidderInfo = userServiceClient.getUserById(bidRequest.getBidderId());
        if (bidderInfo == null) {
            throw new RuntimeException("Bidder does not exist");
        }

        // 2. Fetch Auction Reference
        // We need the Auction entity to set the relationship
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // 3. Create Bid Object
        Bid newBid = new Bid();
        newBid.setAuction(auction); // <--- Use setAuction instead of setAuctionId
        newBid.setBidAmount(bidRequest.getBidAmount());
        newBid.setBidTime(java.time.LocalDateTime.now());

        // 4. Securely set user details
        newBid.setBidderId(bidderInfo.getId());
        newBid.setBidderName(bidderInfo.getFullname());
        newBid.setBidderEmail(bidderInfo.getEmail());

        // 5. Save
        return bidRepository.save(newBid);
    }
}