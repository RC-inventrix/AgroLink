package com.agrolink.productcatalogservice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime biddingStartDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime biddingEndDate;

    @Column(length = 1000)
    private String description;

    private Boolean deliveryAvailable;

    // RENAMED to match DTO/Frontend (was First5Km)
    private Double deliveryFeeFirst3Km;

    private Double deliveryFeePerKm;

    private String pickupAddress;
    private Double pickupLatitude;
    private Double pickupLongitude;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images;
}