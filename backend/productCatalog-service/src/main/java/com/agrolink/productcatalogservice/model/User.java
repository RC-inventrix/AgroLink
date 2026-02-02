package com.agrolink.productcatalogservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users") // Maps to your existing users table
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Address fields
    private String address;
    private String city;
    private String district;
    private String province;

    // --- NEW: Coordinates ---
    // These match the columns in your database table
    private Double latitude;
    private Double longitude;
}