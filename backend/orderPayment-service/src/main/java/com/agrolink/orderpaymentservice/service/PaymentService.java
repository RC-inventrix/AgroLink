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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    private final String FRONTEND_URL = "http://localhost:3000";

    // 1. INJECT REPOSITORIES & OBJECT MAPPER
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper; // Spring Boot automatically provides this

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public CheckoutResponse initiateCheckout(Long userId) throws StripeException {
        // 1. Fetch Cart Items
        List<CartItem> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 2. Convert Items to JSON String (The Fix)
        String itemsJson;
        try {
            itemsJson = objectMapper.writeValueAsString(cartItems);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting cart items to JSON", e);
        }

        // 3. Build Stripe Session
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

        // Add Delivery Fee
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

        Session session = Session.create(paramsBuilder.build());

        // 4. Save Initial Order to DB (Status: CREATED)
        // This ensures the order exists in history even before the webhook fires.
        // The Webhook will later update this order's status to PAID.
        Order order = Order.builder()
                .userId(userId)
                .stripeId(session.getId())
                .amount(session.getAmountTotal())
                .currency(session.getCurrency())
                .status(OrderStatus.CREATED)
                .itemsJson(itemsJson) // <--- SAVING REAL JSON HERE
                .build();

        orderRepository.save(order);

        return CheckoutResponse.builder()
                .sessionId(session.getId())
                .url(session.getUrl())
                .build();
    }

    public void processCashOnDelivery(Long userId) {
        // 1. Fetch Cart Items
        List<CartItem> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 2. Convert Items to JSON String (The Fix)
        String itemsJson;
        try {
            itemsJson = objectMapper.writeValueAsString(cartItems);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting cart items to JSON", e);
        }

        // 3. Calculate Total
        double totalAmount = cartItems.stream()
                .mapToDouble(item -> item.getPricePerKg() * item.getQuantity())
                .sum();
        totalAmount += 30.0; // Delivery Fee

        String fakeStripeId = "COD-" + UUID.randomUUID().toString();

        // 4. Create Order
        Order order = Order.builder()
                .userId(userId)
                .stripeId(fakeStripeId)
                .amount((long) (totalAmount * 100))
                .currency("lkr")
                .status(OrderStatus.COD_CONFIRMED)
                .itemsJson(itemsJson) // <--- SAVING REAL JSON HERE
                .build();

        orderRepository.save(order);

        // 5. Clear Cart
        cartRepository.deleteAll(cartItems);
    }
}