package com.agrolink.auctionservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a bid on an auction.
 * Only the top 5 bids per auction are retained (retention policy).
 */
@Entity
@Table(name = "bids", indexes = {
    @Index(name = "idx_bid_auction_id", columnList = "auction_id"),
    @Index(name = "idx_bid_bidder_id", columnList = "bidder_id"),
    @Index(name = "idx_bid_amount", columnList = "bid_amount")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    @JsonBackReference
    private Auction auction;

    @Column(name = "bidder_id", nullable = false)
    private Long bidderId;

    @Column(name = "bidder_name")
    private String bidderName;

    @Column(name = "bidder_email")
    private String bidderEmail;

    @Column(name = "bid_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal bidAmount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "bid_time", nullable = false)
    private LocalDateTime bidTime;

    // Embedded delivery address
    @Embedded
    private DeliveryAddress deliveryAddress;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
