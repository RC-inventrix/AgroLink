package com.agrolink.orderpaymentservice.Controller;

import com.stripe.exception.StripeException;
import com.stripe.model.LineItem;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("http://localhost/8082")
public class PaymentController {

    @PostMapping("/create-checkout-session")
    public Map<String,Object> createCheckoutSession() throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder().addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.PAYPAL)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8082/api/payment/success")
                .setCancelUrl("http://localhost:8082/api/payment/cancel")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
//                                .setPriceData(
//                                        SessionCreateParams.LineItem.PriceData.builder()
//                                                .setCurrency("lkr")
//                                                .setUnitAmount(1000000L)
//                                                .setProductData(
//                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
//                                                                .setName("test product")
//                                                                .build()
//                                                )
//                                                .build()
//                                ).setQuantity(1L)
//                                .build()
                                .setPrice("price_1SciXIJhk5DMuYs0OSpqxvvE")  // ← Use your actual Dashboard price ID
                                .setQuantity(1L)
                                .build()

                ).build();
        Session session = Session.create(params);
        Map<String,Object> result = new HashMap<String ,Object>();
        result.put("sessionId",session.getId());
        return ResponseEntity.ok(result).getBody();
    }

    @GetMapping("/success")
    public String getSuccess(){
        return "payment success";
    }

    @GetMapping("/cancel")
    public String getCancel(){
        return "payment cancel";
    }

}
