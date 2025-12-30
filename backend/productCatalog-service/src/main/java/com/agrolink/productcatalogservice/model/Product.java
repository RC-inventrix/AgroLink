package com.agrolink.productcatalogservice.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vegetableName;
    private String category;
    private double quantity;

    @Enumerated(EnumType.STRING)
    private PricingType pricingType;

    private Double fixedPrice;
    private Double biddingPrice;
    private String biddingStartDate;
    private String biddingEndDate;

    @Column(length = 1000)
    private String description;

    @ElementCollection
    private List<String> images;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getVegetableName() {
        return vegetableName;
    }

    public void setVegetableName(String vegetableName) {
        this.vegetableName = vegetableName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getQuantity() {
        return quantity;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public PricingType getPricingType() {
        return pricingType;
    }

    public void setPricingType(PricingType pricingType) {
        this.pricingType = pricingType;
    }

    public Double getFixedPrice() {
        return fixedPrice;
    }

    public void setFixedPrice(Double fixedPrice) {
        this.fixedPrice = fixedPrice;
    }

    public Double getBiddingPrice() {
        return biddingPrice;
    }

    public void setBiddingPrice(Double biddingPrice) {
        this.biddingPrice = biddingPrice;
    }

    public String getBiddingStartDate() {
        return biddingStartDate;
    }

    public void setBiddingStartDate(String biddingStartDate) {
        this.biddingStartDate = biddingStartDate;
    }

    public String getBiddingEndDate() {
        return biddingEndDate;
    }

    public void setBiddingEndDate(String biddingEndDate) {
        this.biddingEndDate = biddingEndDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }
}

