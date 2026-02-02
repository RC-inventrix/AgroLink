package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.SellerAnalyticsDTO;
import com.agrolink.orderpaymentservice.model.CancelledOrder;
import com.agrolink.orderpaymentservice.model.CancelledOrderNotification;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.CancelledOrderNotificationRepository;
import com.agrolink.orderpaymentservice.repository.CancelledOrderRepository;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final OrderRepository orderRepository;
    private final CancelledOrderRepository cancelledOrderRepository;
    private final CancelledOrderNotificationRepository notificationRepository;

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



    @PostMapping("/{orderId}/cancel")
    @Transactional
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");

        return orderRepository.findById(orderId).map(order -> {
            // 1. Update Order Status
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            // 2. Save Audit Record in the cancelled_orders table
            CancelledOrder cancellationRecord = CancelledOrder.builder()
                    .orderId(order.getId())
                    .cancelledById(order.getSellerId())
                    .otherPartyId(order.getUserId())
                    .reason(reason)
                    .build();
            cancelledOrderRepository.save(cancellationRecord);

            // 3. Create the specific CancelledOrderNotification
            String msg = "Your Order #" + order.getId() + " was cancelled by the seller. Reason: " + reason;

            CancelledOrderNotification notification = CancelledOrderNotification.builder()
                    .buyerId(order.getUserId())
                    .orderId(order.getId())
                    .message(msg)
                    .read(false)
                    .build();

            notificationRepository.save(notification);

            return ResponseEntity.ok().body(Map.of("message", "Order cancelled and notification sent."));
        }).orElse(ResponseEntity.notFound().build());
    }
}