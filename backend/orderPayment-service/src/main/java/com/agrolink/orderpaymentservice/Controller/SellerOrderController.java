package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.SellerAnalyticsDTO;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final OrderRepository orderRepository;

    // 1. Get All Orders
    @GetMapping("")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }


    @GetMapping("/{sellerId}")
    public ResponseEntity<List<Order>> getOrdersBySeller(@PathVariable Long sellerId) {
        List<Order> sellerOrders = orderRepository.findBySellerId(sellerId);
        return ResponseEntity.ok(sellerOrders);
    }

    // 2. Update Order Status

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long orderId, @RequestParam String status) {
        // 1. Check if Order exists
        Optional<Order> orderOptional = orderRepository.findById(orderId);

        if (orderOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOptional.get();

        // 2. Try to update status
        try {
            order.setStatus(OrderStatus.valueOf(status));
            Order updatedOrder = orderRepository.save(order);
            return ResponseEntity.ok(updatedOrder);
        } catch (IllegalArgumentException e) {
            // Return 400 Bad Request if the status string is invalid
            return ResponseEntity.badRequest().body("Invalid status provided");
        }
    }


    @PostMapping("/{orderId}/verify-otp")
    public ResponseEntity<?> verifyOrderOtp(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
        return orderRepository.findById(orderId).map(order -> {
            String inputOtp = payload.get("otp");

            if (order.getOtp() != null && order.getOtp().equals(inputOtp)) {
                order.setStatus(OrderStatus.COMPLETED);
                orderRepository.save(order);
                return ResponseEntity.ok().body(Map.of("message", "Order verified and completed successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP code. Please try again."));
            }
        }).orElse(ResponseEntity.notFound().build());
    }



    @GetMapping("/{sellerId}/analytics")
    public ResponseEntity<SellerAnalyticsDTO> getSellerAnalytics(@PathVariable Long sellerId) {

        SellerAnalyticsDTO analytics = orderRepository.getSellerAnalytics(sellerId);


        if (analytics.getTotalCompletedIncome() == null) {
            analytics.setTotalCompletedIncome(0L);
        }

        return ResponseEntity.ok(analytics);
    }
}