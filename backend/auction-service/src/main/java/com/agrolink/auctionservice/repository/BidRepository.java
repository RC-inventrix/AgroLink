/* fileName: auctionservice/repository/BidRepository.java */
package com.agrolink.auctionservice.repository;

import com.agrolink.auctionservice.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByAuctionId(Long auctionId);

    long countByAuctionId(Long auctionId);

    // This ensures the highest bids are retrieved for the frontend
    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId ORDER BY b.bidAmount DESC")
    List<Bid> findTopBidsByAuctionId(@Param("auctionId") Long auctionId);

    Optional<Bid> findTopByAuctionIdOrderByBidAmountDesc(Long auctionId);

    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId ORDER BY b.bidAmount ASC")
    List<Bid> findBidsToDelete(@Param("auctionId") Long auctionId);

    List<Bid> findByAuctionIdAndBidderId(Long auctionId, Long bidderId);
}