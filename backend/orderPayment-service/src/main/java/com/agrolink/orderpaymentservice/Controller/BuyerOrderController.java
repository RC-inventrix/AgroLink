package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/buyer/orders")
@RequiredArgsConstructor
public class BuyerOrderController {

    private final OrderRepository orderRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getBuyerOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderRepository.findByUserId(userId));
    }

    @PutMapping("/mark-seen/{userId}")
    public ResponseEntity<String> markOrdersAsSeen(@PathVariable Long userId) {
        try {
            orderRepository.markAllAsSeen(userId, OrderStatus.PROCESSING);
            return ResponseEntity.ok("Notifications cleared successfully");
        } catch (Exception e) {
            e.printStackTrace(); // Logs the error in your IntelliJ terminal
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}