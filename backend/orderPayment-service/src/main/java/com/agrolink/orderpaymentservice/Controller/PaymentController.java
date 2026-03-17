package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.CheckoutResponse;
import com.agrolink.orderpaymentservice.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

   /* @PostMapping("/create-checkout-session")
    public ResponseEntity<CheckoutResponse> createCheckoutSession(@RequestParam Long userId) {
        try {
            CheckoutResponse response = paymentService.initiateCheckout(userId);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.status(500).build();
        }
    }*/

    @PostMapping("/cod")
    public ResponseEntity<String> processCashOnDelivery(
            @RequestParam Long userId,
            @RequestBody Map<String, Object> payload) {
        try {
            // Extract the selected cart item IDs sent from the frontend
            List<Integer> cartItemIdsInt = (List<Integer>) payload.get("cartItemIds");
            List<Long> cartItemIds = null;

            if (cartItemIdsInt != null) {
                cartItemIds = cartItemIdsInt.stream().map(Integer::longValue).collect(Collectors.toList());
            }

            paymentService.processCashOnDelivery(userId, cartItemIds);
            return ResponseEntity.ok("Order placed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing COD: " + e.getMessage());
        }
    }
}