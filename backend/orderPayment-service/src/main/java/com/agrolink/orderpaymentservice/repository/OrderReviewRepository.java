package com.agrolink.orderpaymentservice.repository;

import com.agrolink.orderpaymentservice.model.OrderReview;
import com.stripe.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderReviewRepository extends JpaRepository<OrderReview, Long> {
    // Finds reviews tied to orders where a specific user was the seller
    List<OrderReview> findByOrderSellerId(Long sellerId);

    // Finds reviews tied to orders where a specific user was the buyer
    List<OrderReview> findByOrderUserId(Long buyerId);

    @Query("SELECT r FROM OrderReview  r WHERE r.order.sellerId = :sellerId AND r.buyerRating IS NOT NULL")
    List<OrderReview> findReviewsAboutSeller(@Param("sellerId") Long sellerId);

    // 2. Find reviews linked to orders where the BUYER is the specific user
    // (This retrieves what SELLERS wrote about this Buyer)
    @Query("SELECT r FROM OrderReview r WHERE r.order.userId = :buyerId AND r.sellerRating IS NOT NULL")
    List<OrderReview> findReviewsAboutBuyer(@Param("buyerId") Long buyerId);

    @Query("SELECT AVG(r.sellerRating) FROM OrderReview r WHERE r.order.sellerId = :sellerId AND r.sellerRating IS NOT NULL")
    Double getAverageSellerRating(@Param("sellerId") Long sellerId);

    // Calculate Average Rating for a BUYER
    @Query("SELECT AVG(r.buyerRating) FROM OrderReview r WHERE r.order.userId = :buyerId AND r.buyerRating IS NOT NULL")
    Double getAverageBuyerRating(@Param("buyerId") Long buyerId);

    // Optional: Count total reviews
    @Query("SELECT COUNT(r) FROM OrderReview r WHERE r.order.sellerId = :sellerId AND r.sellerRating IS NOT NULL")
    Long countSellerReviews(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(r) FROM OrderReview r WHERE r.order.userId = :buyerId AND r.buyerRating IS NOT NULL")
    Long countBuyerReviews(@Param("buyerId") Long buyerId);
}
