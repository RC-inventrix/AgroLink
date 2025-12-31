package com.agrolink.orderpaymentservice.service;

import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor // 1. Removes the manual constructor code
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public Order createOrder(Order order) {
        // 2. Clean one-liner to ensure status is never null
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.CREATED);
        }
        return orderRepository.save(order);
    }

    @Transactional
    public Order markAsPaid(String stripeId, String email, String name) {
        // 3. The "Modern" way to handle Optionals
        // Find the order OR throw an error immediately if missing.
        Order order = orderRepository.findByStripeId(stripeId)
                .orElseThrow(() -> new RuntimeException("Order not found for stripeId: " + stripeId));

        // Now we just update the fields safely
        order.setStatus(OrderStatus.PAID);
        order.setCustomerEmail(email);
        order.setCustomerName(name);

        return orderRepository.save(order);
    }

    // 4. Performance Boost: Tells DB we are only reading, so it skips locking rows.
    @Transactional(readOnly = true)
    public Optional<Order> findByStripeId(String stripeId) {
        return orderRepository.findByStripeId(stripeId);
    }
}