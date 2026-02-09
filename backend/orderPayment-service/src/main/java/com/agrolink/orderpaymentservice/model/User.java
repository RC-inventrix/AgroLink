package com.agrolink.orderpaymentservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String address;
    private String city;
    private String district;
    private String province;

    // Coordinates for distance calculation
    private Double latitude;
    private Double longitude;
}