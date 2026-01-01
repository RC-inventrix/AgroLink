package com.agrolink.orderpaymentservice.service;

import com.agrolink.orderpaymentservice.dto.CheckoutResponse;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;

    @Value("${stripe.price.id}") // Put the ID in application.properties!
    private String priceId;

    @Value("${client.base.url}") // e.g., http://localhost:3000
    private String clientBaseUrl;

    public CheckoutResponse initiateCheckout(Long userId) throws StripeException {
        // 1. Fetch Product Name (Optional, but good for records)
        // (Skipping Price.retrieve for brevity, but you can keep it if needed)

        // 2. Build the Stripe Session
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(clientBaseUrl + "/payment/success") // Redirect to Frontend
                .setCancelUrl(clientBaseUrl + "/payment/cancel")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(priceId)
                                .setQuantity(1L)
                                .build()
                )
                .build();

        Session session = Session.create(params);

        // 3. Save Initial Order to DB
        Order order = Order.builder()
                .userId(userId)
                .stripeId(session.getId())
                .amount(session.getAmountTotal())
                .currency(session.getCurrency())
                .status(OrderStatus.CREATED) // Pending payment
                .itemsJson("Green Tractor") // Simplified for now
                .build();

        orderRepository.save(order);

        // 4. Return the URL
        return  CheckoutResponse.builder()
                .sessionId(session.getId())
                .url(session.getUrl())
                .build();
    }
}