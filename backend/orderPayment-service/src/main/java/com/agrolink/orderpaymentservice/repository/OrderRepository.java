package com.agrolink.orderpaymentservice.repository;


import com.agrolink.orderpaymentservice.dto.SellerAnalyticsDTO;
import com.agrolink.orderpaymentservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByStripeId(String stripeId);

    List<Order> findByUserId(Long userId);

    List<Order> findAllByStripeId(String stripeId);

    List<Order> findBySellerId(Long sellerId);


    @Query("SELECT new com.agrolink.orderpaymentservice.dto.SellerAnalyticsDTO(" +
            "SUM(CASE WHEN o.status = 'COMPLETED' THEN o.amount ELSE 0 END), " +
            "COUNT(CASE WHEN o.status = 'PENDING' THEN 1 END), " +
            "COUNT(CASE WHEN o.status = 'COMPLETED' THEN 1 END)) " +
            "FROM Order o WHERE o.sellerId = :sellerId")
    SellerAnalyticsDTO getSellerAnalytics(@Param("sellerId") Long sellerId);
}
