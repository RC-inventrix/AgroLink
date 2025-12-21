package com.agrolink.orderpaymentservice.service;


import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Order createOrder(Order order) {
        order.setStatus(order.getStatus() == null ? "CREATED" : order.getStatus());
        return orderRepository.save(order);
    }

    @Transactional
    public Order markAsPaid(String stripeId, String email, String name) {
        Optional<Order> opt = orderRepository.findByStripeId(stripeId);
        if (opt.isPresent()) {
            Order o = opt.get();
            o.setStatus("PAID");
            o.setCustomerEmail(email);
            o.setCustomerName(name);// <--- SAVE THE EMAIL HERE
            return orderRepository.save(o);
        }
        throw new IllegalStateException("Order not found for stripeId: " + stripeId);
    }

    public Optional<Order> findByStripeId(String stripeId) {
        return orderRepository.findByStripeId(stripeId);
    }
}

