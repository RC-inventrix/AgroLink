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

    @Column(nullable = false)
    private Long farmerId;

    private String vegetableName;
    private String category;
    private double quantity;

    @Enumerated(EnumType.STRING)
    private PriceType pricingType;

    private Double fixedPrice;
    private Double biddingPrice;
    private LocalDateTime biddingStartDate;
    private LocalDateTime biddingEndDate;

    @Column(length = 1000)
    private String description;

    private Boolean deliveryAvailable;
    private Double deliveryFeeFirst3Km;
    private Double deliveryFeePerKm;

    private String pickupAddress;
    private Double pickupLatitude;
    private Double pickupLongitude;

    // --- UPDATED IMAGE MAPPING ---
    // Cascade ALL means if you save Product, it automatically saves the Images
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images;
}