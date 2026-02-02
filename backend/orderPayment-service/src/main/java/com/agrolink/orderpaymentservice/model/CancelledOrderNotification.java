package com.agrolink.orderpaymentservice.model;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "cancelled_order_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelledOrderNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    private boolean read = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
