/* fileName: orderpaymentservice/service/PaymentService.java */
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
                double deliveryFee = item.getDeliveryFee() != null ? item.getDeliveryFee() : 0.0;

                double itemTotal = (price * qty) + deliveryFee;

                String itemsJson = objectMapper.writeValueAsString(List.of(item));
                String fakeStripeId = "COD-" + UUID.randomUUID().toString();

                // FIX: Check if it's a delivery by inspecting the address string instead of just the fee
                // (This handles Free Delivery and explicitly filters out Pickup orders)
                boolean isDelivery = item.getBuyerAddress() != null &&
                        !item.getBuyerAddress().toLowerCase().contains("pickup") &&
                        !item.getBuyerAddress().toLowerCase().contains("location n/a");

                Order order = Order.builder()
                        .userId(userId)
                        .stripeId(fakeStripeId)
                        .amount((long) (itemTotal * 100))
                        .currency("LKR")
                        .status(OrderStatus.COD_CONFIRMED)
                        .itemsJson(itemsJson)
                        .sellerId(item.getSellerId() != null ? item.getSellerId() : 0L)
                        .otp(generateOtp())

                        // FIX: Directly and unconditionally map the delivery details & exact coordinates
                        // straight from the CartItem to prevent losing them during checkout
                        .isDelivery(isDelivery)
                        .deliveryAddress(item.getBuyerAddress())
                        .deliveryFee(deliveryFee)
                        .buyerLatitude(item.getBuyerLatitude())
                        .buyerLongitude(item.getBuyerLongitude())

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