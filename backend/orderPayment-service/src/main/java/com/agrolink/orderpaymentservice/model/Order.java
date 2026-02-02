package com.agrolink.orderpaymentservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "shop_orders") // "orders" is a reserved SQL keyword; "shop_orders" is safer.
@Data // Generates Getters, Setters, ToString, EqualsAndHashCode automatically
@NoArgsConstructor // Required by JPA
@AllArgsConstructor
@Builder // Allows you to build objects like: Order.builder().amount(100).build();
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Stripe payment/checkout/session id
    @Column(name = "stripe_id", nullable = false, unique = true)
    private String stripeId;

    @Column(nullable = false)
    private Long amount; // stored in cents (e.g., $10.00 -> 1000)

    @Column(nullable = false)
    private String currency;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "customer_name")
    private String customerName;

    // Stores items as a JSON string (e.g., "[{'id':1, 'qty':2}, ...]")
    @Column(name = "items_json", columnDefinition = "TEXT")
    private String itemsJson;

    // FIX: Use Enum instead of String for type safety
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    // FIX: Use Hibernate's @CreationTimestamp or JPA's @CreatedDate
    // This automatically sets the time when saved.
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "sellerId")
    private Long sellerId;

    @Column(name = "otp")
    private String otp;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private OrderReview orderReview;
}