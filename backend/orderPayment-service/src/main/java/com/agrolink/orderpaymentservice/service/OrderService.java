package com.agrolink.orderpaymentservice.service;

import com.agrolink.orderpaymentservice.dto.AuctionOrderRequest;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor // 1. Removes the manual constructor code
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    // Update your existing createOrder method in OrderService.java
    @Transactional
    public Order createOrder(Order order) {
        // Ensure initial status
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.CREATED);
        }

        // Generate the handover verification code
        String generatedOtp = String.valueOf((int)((Math.random() * 900000) + 100000));
        order.setOtp(generatedOtp);

        return orderRepository.save(order);
    }

    /**
     * Create an order from an auction win.
     * Skips the standard cart/checkout flow since price and winner are already finalized.
     */
    @Transactional
    public Order createAuctionOrder(AuctionOrderRequest request) {
        log.info("Creating auction order for auction ID: {}", request.getAuctionId());

        // Build the items JSON for the auction product
        String itemsJson;
        try {
            itemsJson = objectMapper.writeValueAsString(new Object[]{
                new java.util.HashMap<String, Object>() {{
                    put("productId", request.getProductId());
                    put("productName", request.getProductName());
                    put("quantity", request.getProductQuantity());
                    put("price", request.getWinningBidAmount());
                    put("imageUrl", request.getProductImageUrl());
                    put("source", "AUCTION");
                    put("auctionId", request.getAuctionId());
                }}
            });
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize auction order items for auction ID: {}", request.getAuctionId(), e);
            itemsJson = "[]";
        }

        // Generate a unique order identifier for auction orders (not a Stripe ID, but used for reference)
        String auctionOrderId = "AUCTION-" + request.getAuctionId() + "-" + UUID.randomUUID().toString().substring(0, 8);

        // Create the order
        Order order = Order.builder()
                .userId(request.getWinnerId())
                .stripeId(auctionOrderId) // Using stripeId field for auction order reference
                .amount(request.getTotalAmount().longValue() * 100) // Convert to cents
                .currency("LKR")
                .customerEmail(request.getWinnerEmail())
                .customerName(request.getWinnerName())
                .itemsJson(itemsJson)
                .status(OrderStatus.COD_CONFIRMED) // Auction orders skip payment, go directly to confirmed
                .sellerId(request.getFarmerId())
                .build();

        // Generate the handover verification code
        String generatedOtp = String.valueOf((int)((Math.random() * 900000) + 100000));
        order.setOtp(generatedOtp);

        Order savedOrder = orderRepository.save(order);
        log.info("Auction order created successfully with ID: {}", savedOrder.getId());

        return savedOrder;
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