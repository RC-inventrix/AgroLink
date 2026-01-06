package com.agrolink.orderpaymentservice.repository;


import com.agrolink.orderpaymentservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByStripeId(String stripeId);

    List<Order> findByUserId(Long userId);
}
