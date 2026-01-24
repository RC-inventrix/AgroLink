package com.agrolink.orderpaymentservice.repository;

import com.agrolink.orderpaymentservice.model.OrderReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderReviewRepository extends JpaRepository<OrderReview, Long> {
    // Finds reviews tied to orders where a specific user was the seller
    List<OrderReview> findByOrderSellerId(Long sellerId);

    // Finds reviews tied to orders where a specific user was the buyer
    List<OrderReview> findByOrderUserId(Long buyerId);
}
