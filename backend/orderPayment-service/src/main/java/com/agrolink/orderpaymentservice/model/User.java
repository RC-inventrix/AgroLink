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

    // ✅ CRITICAL: These fields were missing.
    // Without them, the API sends null to the Auction Service.
    private String email;
    private String fullname;

    private String address;
    private String city;
    private String district;
    private String province;

    private Double latitude;
    private Double longitude;
}