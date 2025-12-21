package com.agrolink.orderpaymentservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;


@Entity
@Table(name = "orders")
public class Order {
    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Getter
    @Column(name = "user_id")
    private Long userId;

    // Stripe payment/checkout/session id
    @Setter
    @Getter
    @Column(name = "stripe_id", nullable = false, unique = true)
    private String stripeId;

    @Setter
    @Getter
    @Column(nullable = false)
    private Long amount; // cents

    @Setter
    @Getter
    @Column(nullable = false)
    private String currency;

    @Setter
    @Getter
    @Column(name = "customer_email")
    private String customerEmail;

    // Inside Order.java
    @Setter
    @Getter
    @Column(name = "customer_name")
    private String customerName;

    // JSON representation of order items (or replace with relation)
    @Setter
    @Getter
    @Column(name = "items_json", columnDefinition = "text")
    private String itemsJson;

    @Setter
    @Getter
    @Column(name = "status")
    private String status; // e.g. CREATED, PAID, CONFIRMED

    @Setter
    @Getter
    @Column(name = "created_at")
    private LocalDateTime createdAt = ZonedDateTime.now(ZoneId.of("Asia/Colombo")).toLocalDateTime();

}

