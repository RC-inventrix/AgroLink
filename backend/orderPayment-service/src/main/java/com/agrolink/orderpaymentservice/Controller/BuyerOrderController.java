package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.CancelledOrderNotification;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.repository.CancelledOrderNotificationRepository;
import com.agrolink.orderpaymentservice.repository.CancelledOrderRepository;
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
    private final CancelledOrderNotificationRepository notificationRepository;
    private final CancelledOrderRepository cancelledOrderRepository;

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

    // Add to BuyerOrderController.java or a new NotificationController.java
    @GetMapping("/notifications/{buyerId}")
    public ResponseEntity<List<CancelledOrderNotification>> getNotifications(@PathVariable Long buyerId) {
        return ResponseEntity.ok(notificationRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId));
    }

    @GetMapping("/cancellation-detail/{orderId}")
    public ResponseEntity<?> getCancellationDetail(@PathVariable Long orderId) {
        // Uses the 'findFirst' method to safely handle duplicate entries
        return cancelledOrderRepository.findFirstByOrderIdOrderByCancelledAtDesc(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Inside BuyerOrderController.java

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setRead(true);
            notificationRepository.save(notif);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }


}