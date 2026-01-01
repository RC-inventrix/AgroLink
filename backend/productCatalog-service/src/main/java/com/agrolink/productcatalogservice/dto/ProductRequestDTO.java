package com.agrolink.productcatalogservice.dto;

import org.springframework.web.multipart.MultipartFile;
import lombok.Data;
import java.util.List;

@Data
public class ProductRequestDTO {
    private String vegetableName;
    private String category;
    private double quantity;
    private String pricingType; // "FIXED" or "BIDDING"
    private Double fixedPrice;
    private Double biddingPrice;
    private String biddingStartDate; // We accept String, Service converts to Date
    private String biddingEndDate;
    private String description;
    private List<MultipartFile> images; // The files
}