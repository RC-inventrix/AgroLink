package com.agrolink.orderpaymentservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String buyerName;

    private Long productId;

    // Snapshot of product details
    private String productName;
    private Double pricePerKg;
    private Double quantity;
    private String imageUrl;
    private String sellerName;
    private Long sellerId;

    // --- NEW FIELDS FOR BARGAIN DETAILS ---
    private Long bargainId;       // Link to the specific accepted bargain
    private Double agreedPrice;   // Final customer offered price

    // --- NEW & EXISTING FIELDS FOR DELIVERY & PRICING ---
    private String farmerAddress;
    private String buyerAddress;

    // Parsed address data
    private String buyerCity;
    private String buyerStreetAddress;

    // Precise coordinates
    private Double buyerLatitude;
    private Double buyerLongitude;

    private Double deliveryFee;
    private Double productPrice;
    private Double totalPrice;
}