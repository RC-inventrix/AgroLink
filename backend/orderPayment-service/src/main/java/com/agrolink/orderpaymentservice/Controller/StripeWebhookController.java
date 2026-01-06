package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.repository.CartRepository;
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

        // Handle the event
        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);

            if (session != null) {
                handlePaymentSuccess(session);
            }
        }

        return ResponseEntity.ok("Received");
    }

    private void handlePaymentSuccess(Session session) {
        // 1. Get User ID from Client Reference ID
        String userIdStr = session.getClientReferenceId();

        if (userIdStr != null) {
            Long userId = Long.parseLong(userIdStr);
            System.out.println("Payment successful for User ID: " + userId + ". Clearing cart...");

            // 2. Clear the User's Cart
            List<CartItem> items = cartRepository.findByUserId(userId);
            cartRepository.deleteAll(items);
        }
    }
}