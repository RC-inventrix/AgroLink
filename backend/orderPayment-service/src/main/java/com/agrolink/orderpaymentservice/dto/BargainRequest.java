package com.agrolink.orderpaymentservice.dto;

import lombok.Data;

@Data
public class BargainRequest {
    private String vegetableId;
    private String vegetableName;
    private String vegetableImage;
    private String sellerId;
    private String buyerName; // Passed from frontend or derived
    private Double quantity;
    private Double suggestedPrice;
    private Double originalPricePerKg;
}