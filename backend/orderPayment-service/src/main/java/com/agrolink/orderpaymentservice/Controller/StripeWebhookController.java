package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.CartRepository;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
public class StripeWebhookController {

    @Value("${STRIPE_WEBHOOK_SECRET}")
    private String endpointSecret;

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository; // --- ADDED THIS ---

    @PostMapping
    public ResponseEntity<String> handleStripeEvent(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        if (sigHeader == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Stripe-Signature Header");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error: " + e.getMessage());
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                handlePaymentSuccess(session);
            }
        }

        return ResponseEntity.ok("Received");
    }

    private void handlePaymentSuccess(Session session) {
        String userIdStr = session.getClientReferenceId();
        String sessionId = session.getId(); // This matches the 'stripeId' in your Order table

        // 1. Update Order Status in Database
        System.out.println("Updating orders for Stripe Session: " + sessionId);
        List<Order> orders = orderRepository.findAllByStripeId(sessionId);

        if (!orders.isEmpty()) {
            orders.forEach(order -> {
                order.setStatus(OrderStatus.PAID);
                // Also capture customer details from Stripe for the record
                order.setCustomerEmail(session.getCustomerDetails().getEmail());
                order.setCustomerName(session.getCustomerDetails().getName());
                orderRepository.save(order);
            });
            System.out.println("Set " + orders.size() + " orders to PAID status.");
        }

        // 2. Clear the User's Cart
        if (userIdStr != null) {
            Long userId = Long.parseLong(userIdStr);
            System.out.println("Clearing cart for User ID: " + userId);
            List<CartItem> items = cartRepository.findByUserId(userId);
            cartRepository.deleteAll(items);
        }
    }
}