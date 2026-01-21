package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import com.agrolink.orderpaymentservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buyer/orders")
@RequiredArgsConstructor
public class BuyerOrderController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getBuyerOrders(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        // This will now trigger the OTP generation in the Service layer
        return ResponseEntity.ok(orderService.createOrder(order));
    }

}