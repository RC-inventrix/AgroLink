package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.Order;
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
        List<Order> orders = orderRepository.findByUserId(userId);
        return ResponseEntity.ok(orders);
    }
}