package com.agrolink.orderpaymentservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "buyer_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Requirement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long buyerId;
    private String cropName;
    private Double quantity; // in Kgs
    private Double expectedUnitPrice;

    @Column(columnDefinition = "TEXT")
    private String deliveryAddress;

    private LocalDate expectedDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RequirementStatus status = RequirementStatus.OPEN;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    private String description;
}

enum RequirementStatus {
    OPEN, CLOSED, FULFILLED
}
