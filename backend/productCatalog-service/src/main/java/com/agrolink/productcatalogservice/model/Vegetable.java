package com.agrolink.productcatalogservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vegetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long farmerId;

    private String name;
    private String description;

    private String imageUrl; //store file path

    private String listingType; //FIXED OR BIDDING
    private Double price; //For FIXED pricing

    private Double startingBid; //For bidding
    private LocalDate biddingStart;
    private LocalDate biddingEnd;

}
