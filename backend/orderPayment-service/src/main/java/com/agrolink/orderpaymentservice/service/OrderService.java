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

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Order createOrder(Order order) {
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.CREATED);
        }
        String generatedOtp = String.valueOf((int)((Math.random() * 900000) + 100000));
        order.setOtp(generatedOtp);
        return orderRepository.save(order);
    }

    @Transactional
    public Order createAuctionOrder(AuctionOrderRequest request) {
        log.info("Creating auction order for auction ID: {}", request.getAuctionId());

        // IDEMPOTENCY GUARD: Use deterministic Stripe ID to prevent duplicate orders
        String auctionOrderId = "AUCTION-" + request.getAuctionId();

        Optional<Order> existingOrder = orderRepository.findByStripeId(auctionOrderId);
        if (existingOrder.isPresent()) {
            log.info("Order for auction {} already exists. Skipping duplicate creation.", request.getAuctionId());
            return existingOrder.get();
        }

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

        Order order = Order.builder()
                .userId(request.getWinnerId())
                .stripeId(auctionOrderId) // Deterministic Unique ID ensures DB-level duplicate protection
                .amount(request.getTotalAmount().longValue() * 100)
                .currency("LKR")
                .customerEmail(request.getWinnerEmail())
                .customerName(request.getWinnerName())
                .itemsJson(itemsJson)
                .status(OrderStatus.COD_CONFIRMED)
                .sellerId(request.getFarmerId())
                .build();

        String generatedOtp = String.valueOf((int)((Math.random() * 900000) + 100000));
        order.setOtp(generatedOtp);

        Order savedOrder = orderRepository.save(order);
        log.info("Auction order created successfully with ID: {}", savedOrder.getId());

        return savedOrder;
    }

    @Transactional
    public Order markAsPaid(String stripeId, String email, String name) {
        Order order = orderRepository.findByStripeId(stripeId)
                .orElseThrow(() -> new RuntimeException("Order not found for stripeId: " + stripeId));

        order.setStatus(OrderStatus.PAID);
        order.setCustomerEmail(email);
        order.setCustomerName(name);

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Optional<Order> findByStripeId(String stripeId) {
        return orderRepository.findByStripeId(stripeId);
    }
}