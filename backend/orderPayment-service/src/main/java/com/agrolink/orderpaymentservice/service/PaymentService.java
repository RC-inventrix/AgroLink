package com.agrolink.orderpaymentservice.service;

import com.agrolink.orderpaymentservice.dto.CheckoutResponse;
import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.CartRepository;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    private final String FRONTEND_URL = "http://localhost:3000";

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Updated Stripe Checkout:
     * Now pre-creates orders in the database with status CREATED.
     */

    @Transactional
    public CheckoutResponse initiateCheckout(Long userId) throws StripeException {
        // 1. Fetch Cart Items
        List<CartItem> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 2. Build Stripe Session Parameters (Do not save to DB yet)
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(FRONTEND_URL + "/buyer/order-success?payment=success")
                .setCancelUrl(FRONTEND_URL + "/buyer/checkout?canceled=true")
                .setClientReferenceId(userId.toString());

        for (CartItem item : cartItems) {
            paramsBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(item.getQuantity().longValue())
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("lkr")
                                            .setUnitAmount((long) (item.getPricePerKg() * 100))
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(item.getProductName())
                                                            .build())
                                            .build())
                            .build());
        }

        // Add Delivery Fee to Stripe Session
        paramsBuilder.addLineItem(
                SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                                SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency("lkr")
                                        .setUnitAmount(3000L) // Rs 30.00
                                        .setProductData(
                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                        .setName("Delivery Fee")
                                                        .build())
                                        .build())
                        .build());

        // 3. CREATE THE STRIPE SESSION FIRST
        // This gives us a unique ID like 'cs_test_...'
        Session session = Session.create(paramsBuilder.build());

        // 4. NOW SAVE TO DATABASE using the unique session ID
        // This solves the "PENDING" duplicate key error
        for (CartItem item : cartItems) {
            String itemJson;
            try {
                itemJson = objectMapper.writeValueAsString(List.of(item));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error mapping item JSON", e);
            }

            Order pendingOrder = Order.builder()
                    .userId(userId)
                    .sellerId(Long.valueOf(item.getSellerId()))
                    .amount((long) (item.getPricePerKg() * item.getQuantity() * 100))
                    .currency("lkr")
                    .status(OrderStatus.CREATED)
                    .itemsJson(itemJson)
                    .stripeId(session.getId()) // --- UNIQUE STRIPE ID FROM SESSION ---
                    .build();

            orderRepository.save(pendingOrder);
        }

        return CheckoutResponse.builder()
                .sessionId(session.getId())
                .url(session.getUrl())
                .build();
    }

    /**
     * Cash on Delivery logic (Already correctly loops through items)
     */
    @Transactional
    public void processCashOnDelivery(Long userId) {
        List<CartItem> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        for (CartItem item : cartItems) {
            String itemsJson;
            try {
                itemsJson = objectMapper.writeValueAsString(List.of(item));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error converting cart items to JSON", e);
            }

            double itemTotal = (item.getPricePerKg() * item.getQuantity()) + 30.0;
            String fakeStripeId = "COD-" + UUID.randomUUID().toString();

            Order order = Order.builder()
                    .userId(userId)
                    .stripeId(fakeStripeId)
                    .amount((long) (itemTotal * 100))
                    .currency("lkr")
                    .status(OrderStatus.COD_CONFIRMED)
                    .itemsJson(itemsJson)
                    .sellerId(Long.valueOf(item.getSellerId())) // Map Seller ID
                    .build();

            orderRepository.save(order);
        }

        cartRepository.deleteAll(cartItems);
    }
}