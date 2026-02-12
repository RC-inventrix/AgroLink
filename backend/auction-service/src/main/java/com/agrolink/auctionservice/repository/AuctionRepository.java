package com.agrolink.auctionservice.repository;

import com.agrolink.auctionservice.model.Auction;
import com.agrolink.auctionservice.model.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    List<Auction> findByFarmerId(Long farmerId);

    List<Auction> findByFarmerIdAndStatus(Long farmerId, AuctionStatus status);

    List<Auction> findByStatus(AuctionStatus status);

    /**
     * Find all active auctions that have expired (end time has passed).
     */
    @Query("SELECT a FROM Auction a WHERE a.status = :status AND a.endTime < :currentTime")
    List<Auction> findExpiredAuctions(@Param("status") AuctionStatus status, @Param("currentTime") LocalDateTime currentTime);

    /**
     * Find all active auctions for listing page.
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' AND a.endTime > :currentTime ORDER BY a.endTime ASC")
    List<Auction> findActiveAuctions(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Find auctions where the user has placed bids.
     */
    @Query("SELECT DISTINCT a FROM Auction a JOIN a.bids b WHERE b.bidderId = :bidderId")
    List<Auction> findAuctionsWithBidsByBidderId(@Param("bidderId") Long bidderId);

    /**
     * Find auctions won by a specific bidder.
     */
    @Query("SELECT a FROM Auction a JOIN Bid b ON a.winningBidId = b.id WHERE b.bidderId = :bidderId AND a.status = 'COMPLETED'")
    List<Auction> findWonAuctionsByBidderId(@Param("bidderId") Long bidderId);
}
