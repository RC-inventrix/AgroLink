package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.AuctionOrderRequest;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling auction-originated orders.
 * These orders skip the standard cart/checkout flow since price and winner are already finalized.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class AuctionOrderController {

    private final OrderService orderService;

    /**
     * Create an order from an auction win.
     * Called by the auction-service when an auction is completed.
     */
    @PostMapping("/auction")
    public ResponseEntity<Order> createAuctionOrder(@RequestBody AuctionOrderRequest request) {
        log.info("Received auction order request for auction ID: {}", request.getAuctionId());

        try {
            Order order = orderService.createAuctionOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            log.error("Failed to create auction order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
