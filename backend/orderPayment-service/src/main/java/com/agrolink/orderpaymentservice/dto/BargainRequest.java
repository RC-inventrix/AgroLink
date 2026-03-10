package com.agrolink.orderpaymentservice.dto;

import lombok.Data;

@Data
public class BargainRequest {
    private String vegetableId;
    private String vegetableName;
    private String vegetableImage;
    private String sellerId;
    private String buyerName;
    private Double quantity;
    private Double suggestedPrice;
    private Double originalPricePerKg;

    // --- NEW LOGISTICS & DELIVERY FIELDS ---
    private Boolean deliveryRequired;
    private String buyerAddress;
    private Double buyerLatitude;
    private Double buyerLongitude;
    private Double deliveryFee;
    private Double distance;
    private Double finalTotal;
}