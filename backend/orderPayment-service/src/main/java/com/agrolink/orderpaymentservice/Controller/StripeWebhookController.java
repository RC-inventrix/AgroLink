package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.service.OrderService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stripe")
@RequiredArgsConstructor
@Slf4j // Adds a logger automatically
public class StripeWebhookController {

    private final OrderService orderService;

    @Value("${STRIPE_WEBHOOK_SECRET}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            // 1. Verify the call is actually from Stripe
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe Signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("Webhook error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error");
        }

        // 2. Check which event happened
        if ("checkout.session.completed".equals(event.getType())) {

            // Extract the session object safely
            // We cast to StripeObject first, then checking instanceof is safer
            // but for simplicity, we use the Stripe logic:

            if (event.getDataObjectDeserializer().getObject().isPresent()) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().get();

                log.info("Payment received for Session ID: {}", session.getId());

                String email = (session.getCustomerDetails() != null) ? session.getCustomerDetails().getEmail() : "unknown@user.com";
                String name = (session.getCustomerDetails() != null) ? session.getCustomerDetails().getName() : "Unknown User";

                // 3. Update the Database
                orderService.markAsPaid(session.getId(), email, name);
            }
        }

        return ResponseEntity.ok("Received");
    }
}