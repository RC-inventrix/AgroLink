package com.agrolink.productcatalogservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long farmerId;

    private String vegetableName;
    private String category;
    private double quantity;

    @Enumerated(EnumType.STRING)
    private PriceType pricingType; // FIXED or BIDDING

    private Double fixedPrice;
    private Double biddingPrice;
    private LocalDateTime biddingStartDate;
    private LocalDateTime biddingEndDate;

    @Column(length = 1000)
    private String description;

    // --- NEW DELIVERY FIELDS ---
    private Boolean deliveryAvailable; // True if seller delivers
    private Double deliveryFeeFirst3Km; // Price for first 3 km
    private Double deliveryFeePerKm;    // Price per extra km

    @ElementCollection
    private List<String> images;
}