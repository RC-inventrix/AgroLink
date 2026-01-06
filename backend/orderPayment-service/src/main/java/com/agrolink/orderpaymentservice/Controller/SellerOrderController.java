package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final OrderRepository orderRepository;

    // 1. Get All Orders
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    // 2. Update Order Status
    // FIX: Changed return type from ResponseEntity<Order> to ResponseEntity<?>
    // This allows returning an Order on success and a "Void" (empty) response on error.
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
}