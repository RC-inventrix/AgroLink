package com.agrolink.orderpaymentservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "order_reviews")
public class OrderReview {

    @Id
    private Long id; // This will match the Order ID

    @OneToOne
    @MapsId // This links the ID of this entity to the ID of the Order entity
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    // Buyer Feedback (Reviewing the product/seller)
    private Integer buyerRating;
    @Column(columnDefinition = "TEXT")
    private String buyerComment;
    private LocalDateTime buyerReviewedAt;

    // Seller Feedback (Reviewing the buyer/transaction)
    private Integer sellerRating;
    @Column(columnDefinition = "TEXT")
    private String sellerComment;
    private LocalDateTime sellerReviewedAt;

    private Long sellerId;

    private Long buyerId;
}
