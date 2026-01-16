package com.agrolink.orderpaymentservice.repository;


import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByStripeId(String stripeId);

    List<Order> findByUserId(Long userId);

    List<Order> findAllByStripeId(String stripeId);

    List<Order> findBySellerId(Long sellerId);

    List<Order> findByUserIdAndStatusAndIsSeenByBuyer(Long userId, OrderStatus status, boolean isSeen);

    // Counts unread notifications for the header badge
    long countByUserIdAndStatusAndIsSeenByBuyer(Long userId, OrderStatus status, boolean isSeen);

    @Modifying
    @Transactional
    @Query("UPDATE Order o SET o.isSeenByBuyer = true WHERE o.userId = :userId AND o.status = :status AND o.isSeenByBuyer = false")
    void markAllAsSeen(@Param("userId") Long userId, @Param("status") OrderStatus status);
}
