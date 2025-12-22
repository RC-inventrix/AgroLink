package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.service.OrderService;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("http://localhost:3000")
public class PaymentController {

    private final OrderService orderService;

    public PaymentController(OrderService orderService) {
        this.orderService = orderService;
    }


    @PostMapping("/create-checkout-session")
    public Map<String, Object> createCheckoutSession(@RequestParam Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            String priceId = "price_1SciXIJhk5DMuYs0OSpqxvvE"; // Your Hardcoded ID

            // --- STEP 1: Fetch Product Details from Stripe ---
            // We ask Stripe to retrieve the Price AND expand the "product" object inside it
            // so we can get the name immediately.
            Map<String, Object> expandParams = new HashMap<>();
            expandParams.put("expand", java.util.Arrays.asList("product"));

            com.stripe.model.Price stripePrice = com.stripe.model.Price.retrieve(priceId, expandParams, null);
            com.stripe.model.Product product = stripePrice.getProductObject();
            String productName = product.getName(); // <--- "Green Tractor" (or whatever you named it)

            // --- STEP 2: Build Stripe Checkout Session ---
            SessionCreateParams params = SessionCreateParams.builder()
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("http://localhost:8075/api/payment/success")
                    .setCancelUrl("http://localhost:8075/api/payment/cancel")
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(priceId)
                                    .setQuantity(1L)
                                    .build()
                    )
                    .build();

            Session session = Session.create(params);

// --- STEP 3: Create Dynamic JSON ---
            String dynamicItemsJson = String.format("[{\"name\":\"%s\",\"qty\":1}]", productName);

// ... (Order saving logic remains the same) ...



            // 4. Save to DB
            Order order = new Order();
            order.setUserId(userId);
            order.setStripeId(session.getId());
            order.setAmount(session.getAmountTotal());
            order.setCurrency(session.getCurrency());
            order.setStatus("CREATED");
            order.setItemsJson(dynamicItemsJson); // <--- Saving real details

            orderService.createOrder(order);


            response.put("sessionId", session.getId());
            response.put("url", session.getUrl());



        } catch (Exception e) {
            e.printStackTrace();
            response.put("error", e.getMessage());
        }


        return response;
    }
    @GetMapping("/success")
    public String success() {
        return "Payment success — BUT backend confirmation happens via webhook.";
    }

    @GetMapping("/cancel")
    public String cancel() {
        return "Payment cancelled.";
    }
}
