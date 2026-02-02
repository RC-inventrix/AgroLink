package com.agrolink.orderpaymentservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "cancelled_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelledOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "cancelled_by_id", nullable = false)
    private Long cancelledById; // The ID of the person who initiated the cancellation

    @Column(name = "other_party_id", nullable = false)
    private Long otherPartyId; // The ID of the buyer (if seller cancels) or seller (if buyer cancels)

    @Column(columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    @Column(name = "cancelled_at", updatable = false)
    private LocalDateTime cancelledAt;
}