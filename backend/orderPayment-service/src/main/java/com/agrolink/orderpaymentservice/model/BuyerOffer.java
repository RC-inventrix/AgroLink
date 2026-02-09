package com.agrolink.orderpaymentservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "buyer_offers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuyerOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requirement_id", nullable = false)
    private Long requirementId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "supply_qty")
    private Double supplyQty;

    @Column(name = "unit_price")
    private Double unitPrice;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "delivery_option")
    private String deliveryOption;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder.Default
    private String status = "PENDING";

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}