package com.agrolink.auctionservice.repository;

import com.agrolink.auctionservice.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    /**
     * Find all bids for a specific auction ordered by bid amount descending.
     */
    List<Bid> findByAuctionIdOrderByBidAmountDesc(Long auctionId);

    /**
     * Find top N bids for a specific auction.
     */
    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId ORDER BY b.bidAmount DESC")
    List<Bid> findTopBidsByAuctionId(@Param("auctionId") Long auctionId);

    /**
     * Find the highest bid for an auction.
     */
    Optional<Bid> findTopByAuctionIdOrderByBidAmountDesc(Long auctionId);

    /**
     * Count bids for a specific auction.
     */
    long countByAuctionId(Long auctionId);

    /**
     * Find bids by bidder ID.
     */
    List<Bid> findByBidderId(Long bidderId);

    /**
     * Find bids by bidder for a specific auction.
     */
    List<Bid> findByAuctionIdAndBidderId(Long auctionId, Long bidderId);

    /**
     * Delete the lowest bids for an auction, keeping only the top N.
     * This helps implement the retention policy of keeping only top 5 bids.
     */
    @Modifying
    @Query(value = "DELETE FROM bids WHERE auction_id = :auctionId AND id NOT IN " +
            "(SELECT id FROM bids WHERE auction_id = :auctionId ORDER BY bid_amount DESC LIMIT :keepCount)", 
            nativeQuery = true)
    int deleteLowestBidsKeepingTop(@Param("auctionId") Long auctionId, @Param("keepCount") int keepCount);

    /**
     * Find bids that should be deleted (beyond top N).
     */
    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId ORDER BY b.bidAmount ASC")
    List<Bid> findBidsToDelete(@Param("auctionId") Long auctionId);
}
