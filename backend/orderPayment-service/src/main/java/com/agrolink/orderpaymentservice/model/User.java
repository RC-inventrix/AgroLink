package com.agrolink.orderpaymentservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users") // Maps to your existing users table
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Address fields used to display the default location
    private String address;
    private String city;
    private String district;
    private String province;

    // You can include other fields from your user table if needed,
    // but these are the ones required for the location feature.
}