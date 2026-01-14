package com.agrolink.productcatalogservice.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class ProductRequestDTO {

    private Long farmerId;
    private String vegetableName;
    private String category;
    private double quantity;
    private String pricingType; // "FIXED" or "BIDDING"

    private Double fixedPrice;
    private Double biddingPrice;
    private String biddingStartDate;
    private String biddingEndDate;

    private String description;

    // --- NEW DELIVERY FIELDS ---
    private Boolean deliveryAvailable;
    private Double deliveryFeeFirst3Km;
    private Double deliveryFeePerKm;

    private List<MultipartFile> images;
}