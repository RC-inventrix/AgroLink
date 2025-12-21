package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.service.OrderService;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stripe")
public class StripeWebhookController {

    private final OrderService orderService;

    @Value("${STRIPE_WEBHOOK_SECRET}")
    private String webhookSecret;

    public StripeWebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject().orElse(null);

            if (session != null && session.getCustomerDetails() != null) {
                String email = session.getCustomerDetails().getEmail();
                String name = session.getCustomerDetails().getName();
                orderService.markAsPaid(session.getId(),email,name);
            }
        }

        return ResponseEntity.ok("");
    }
}

