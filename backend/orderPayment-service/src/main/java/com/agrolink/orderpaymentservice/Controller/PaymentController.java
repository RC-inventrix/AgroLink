package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.CheckoutResponse;
import com.agrolink.orderpaymentservice.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
//@CrossOrigin("http://localhost:3000") // VIP List
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<CheckoutResponse> createCheckoutSession(@RequestParam Long userId) {
        try {
            CheckoutResponse response = paymentService.initiateCheckout(userId);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.status(500).build();
        }
    }
    @PostMapping("/cod")
    public ResponseEntity<String> processCashOnDelivery(@RequestParam Long userId) {
        try {
            paymentService.processCashOnDelivery(userId);
            return ResponseEntity.ok("Order placed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing COD: " + e.getMessage());
        }
    }
}