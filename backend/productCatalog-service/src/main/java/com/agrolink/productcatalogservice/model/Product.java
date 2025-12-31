package com.agrolink.productcatalogservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime; // Correct type for Dates
import java.util.List;

@Entity
@Table(name = "products")
@Data // Generates Getters, Setters, toString, equals, and hashCode automatically
@NoArgsConstructor // Generates a constructor with no arguments (Required by JPA)
@AllArgsConstructor // Generates a constructor with all arguments
@Builder // Helps you create objects easily in testing
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vegetableName;
    private String category;
    private double quantity;

    @Enumerated(EnumType.STRING)
    private PricingType pricingType;

    private Double fixedPrice;
    private Double biddingPrice;

    // FIX: Use LocalDateTime instead of String for date math/sorting
    private LocalDateTime biddingStartDate;
    private LocalDateTime biddingEndDate;

    @Column(length = 1000)
    private String description;

    @ElementCollection
    private List<String> images;
}