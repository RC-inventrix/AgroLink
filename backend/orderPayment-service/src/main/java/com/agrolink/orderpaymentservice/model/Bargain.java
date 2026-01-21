package com.agrolink.orderpaymentservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bargains")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bargain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String vegetableId;

    @Column(nullable = false)
    private String vegetableName;

    private String vegetableImage; // Added for UI display

    @Column(nullable = false)
    private String sellerId;

    @Column(nullable = false)
    private Long buyerId;

    private String buyerName; // Added for UI display

    @Column(nullable = false)
    private Double quantity; // Total quantity in Kg

    @Column(nullable = false)
    private Double suggestedPrice; // Total Price offered by buyer

    private Double originalPricePerKg; // To calculate discount/actual price

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BargainStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}