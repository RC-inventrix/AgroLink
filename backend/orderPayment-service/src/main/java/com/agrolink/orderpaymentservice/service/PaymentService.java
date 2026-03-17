package com.agrolink.orderpaymentservice.service;

import com.agrolink.orderpaymentservice.dto.CheckoutResponse;
import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.CartRepository;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    private String generateOtp() {
        return String.valueOf((int)((Math.random() * 900000) + 100000));
    }

    // ... (initiateCheckout method remains unchanged) ...

    @Transactional
    public void processCashOnDelivery(Long userId, List<Long> cartItemIds) {
        List<CartItem> cartItems;

        // 1. Only fetch the items the user actually selected in the UI
        if (cartItemIds != null && !cartItemIds.isEmpty()) {
            cartItems = cartRepository.findAllById(cartItemIds);
            // Security check: Ensure the items actually belong to the requesting user
            cartItems.removeIf(item -> !item.getUserId().equals(userId));
        } else {
            // Fallback just in case
            cartItems = cartRepository.findByUserId(userId);
        }

        if (cartItems.isEmpty()) {
            throw new RuntimeException("No valid cart items found to process for user: " + userId);
        }

        for (CartItem item : cartItems) {
            try {
                double price = item.getPricePerKg() != null ? item.getPricePerKg() : 0.0;
                double qty = item.getQuantity() != null ? item.getQuantity() : 0.0;

                // 2. STRICT CHECK: Must not be null AND must be greater than 0 to be considered delivery
                boolean isDelivery = item.getDeliveryFee() != null && item.getDeliveryFee() > 0.0;
                double deliveryFee = isDelivery ? item.getDeliveryFee() : 0.0;

                double itemTotal = (price * qty) + deliveryFee;

                String itemsJson = objectMapper.writeValueAsString(List.of(item));
                String fakeStripeId = "COD-" + UUID.randomUUID().toString();

                Order order = Order.builder()
                        .userId(userId)
                        .stripeId(fakeStripeId)
                        .amount((long) (itemTotal * 100))
                        .currency("lkr")
                        .status(OrderStatus.COD_CONFIRMED)
                        .itemsJson(itemsJson)
                        .sellerId(item.getSellerId() != null ? item.getSellerId() : 0L)
                        .otp(generateOtp())

                        // Append Delivery Info dynamically
                        .isDelivery(isDelivery)
                        .deliveryAddress(isDelivery ? item.getBuyerAddress() : null)
                        .deliveryFee(isDelivery ? item.getDeliveryFee() : null)
                        .buyerLatitude(isDelivery ? item.getBuyerLatitude() : null)
                        .buyerLongitude(isDelivery ? item.getBuyerLongitude() : null)

                        .build();

                orderRepository.save(order);
            } catch (Exception e) {
                System.err.println("Error creating COD order for item: " + item.getProductName());
                e.printStackTrace();
                throw new RuntimeException("COD processing failed: " + e.getMessage());
            }
        }

        // 3. Delete ONLY the processed items from the cart!
        cartRepository.deleteAll(cartItems);
    }
}