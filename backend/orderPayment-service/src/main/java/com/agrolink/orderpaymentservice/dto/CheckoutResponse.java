package com.agrolink.orderpaymentservice.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data              // Generates Getters, Setters, toString
@Builder           // <--- THIS IS THE MAGIC KEY. It creates the .builder() method
@AllArgsConstructor // Required for @Builder to work properly
@NoArgsConstructor
public class CheckoutResponse {
    private String sessionId;
    private String url;
}
