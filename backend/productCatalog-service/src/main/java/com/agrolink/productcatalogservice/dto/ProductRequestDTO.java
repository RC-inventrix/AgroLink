package com.agrolink.productcatalogservice.dto;

import lombok.Data;
import java.util.List;
// import org.springframework.web.multipart.MultipartFile; <--- REMOVE THIS

@Data
public class ProductRequestDTO {
    private Long farmerId;
    private String vegetableName;
    private String category;
    private double quantity;
    private String pricingType;
    private Double fixedPrice;
    private Double biddingPrice;
    private String biddingStartDate;
    private String biddingEndDate;
    private String description;

    private Boolean deliveryAvailable;
    private Double deliveryFeeFirst3Km;
    private Double deliveryFeePerKm;

    private String pickupAddress;
    private Double pickupLatitude;
    private Double pickupLongitude;

    // CHANGED: From List<MultipartFile> to List<String>
    // The frontend will send the S3 URLs here
    private List<String> imageUrls;
}