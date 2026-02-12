package com.agrolink.auctionservice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing an auction in the system.
 * Uses optimistic locking (@Version) for concurrency control.
 */
@Entity
@Table(name = "auctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Version field for optimistic locking.
     * Automatically incremented by JPA on each update.
     */
    @Version
    private Long version;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(name = "farmer_name")
    private String farmerName;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    // Cached product details for quick access
    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_quantity")
    private Double productQuantity;

    @Column(name = "product_image_url")
    private String productImageUrl;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "reserve_price", precision = 10, scale = 2)
    private BigDecimal reservePrice;

    @Column(name = "starting_price", precision = 10, scale = 2)
    private BigDecimal startingPrice;

    /**
     * Current highest bid amount - stored directly for quick read access.
     */
    @Column(name = "current_highest_bid_amount", precision = 10, scale = 2)
    private BigDecimal currentHighestBidAmount;

    @Column(name = "winning_bid_id")
    private Long winningBidId;

    // Delivery configuration
    @Column(name = "is_delivery_available")
    private Boolean isDeliveryAvailable;

    @Column(name = "base_delivery_fee", precision = 10, scale = 2)
    private BigDecimal baseDeliveryFee;

    @Column(name = "extra_fee_per_3km", precision = 10, scale = 2)
    private BigDecimal extraFeePer3Km;

    // Pickup location (farmer's location)
    @Column(name = "pickup_address")
    private String pickupAddress;

    @Column(name = "pickup_latitude")
    private Double pickupLatitude;

    @Column(name = "pickup_longitude")
    private Double pickupLongitude;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Bid> bids = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
