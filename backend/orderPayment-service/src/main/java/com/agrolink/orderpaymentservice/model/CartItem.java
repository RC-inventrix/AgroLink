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
    private String buyerName; // Added buyer name

    private Long productId;

    // Snapshot of product details
    private String productName;
    private Double pricePerKg;
    private Double quantity;
    private String imageUrl;
    private String sellerName;
    private Long sellerId;

    // --- NEW FIELDS FOR DELIVERY & PRICING ---
    private String farmerAddress;
    private String buyerAddress;

    private Double deliveryFee;   // Calculated delivery charge
    private Double productPrice;  // Quantity * PricePerKg
    private Double totalPrice;    // ProductPrice + DeliveryFee
}