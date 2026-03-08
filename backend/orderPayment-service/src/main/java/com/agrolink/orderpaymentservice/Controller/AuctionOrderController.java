package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.AuctionOrderRequest;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling auction-originated orders.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class AuctionOrderController {

    private final OrderService orderService;

    @PostMapping("/auction")
    public ResponseEntity<Map<String, Object>> createAuctionOrder(@RequestBody AuctionOrderRequest request) {
        log.info("Received auction order request for auction ID: {}", request.getAuctionId());
        Map<String, Object> response = new HashMap<>();

        try {
            Order order = orderService.createAuctionOrder(request);

            response.put("success", true);
            response.put("message", "Auction successfully converted into an order");
            response.put("data", order);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Failed to create auction order: {}", e.getMessage(), e);

            response.put("success", false);
            response.put("message", "Failed to convert auction to order: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}