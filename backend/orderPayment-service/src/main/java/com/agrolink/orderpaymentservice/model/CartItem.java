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

    private Long userId;      // Who owns this cart?
    private Long productId;   // Reference to Product Service

    // Snapshot of product details
    private String productName;
    private Double pricePerKg;
    private Double quantity;
    private String imageUrl;
    private String sellerName;

}