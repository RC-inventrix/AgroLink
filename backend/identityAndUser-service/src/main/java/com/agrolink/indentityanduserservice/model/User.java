/* fileName: indentityanduserservice/model/User.java */
package com.agrolink.indentityanduserservice.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    private String fullname;

    @Column(unique = true,nullable = false)
    private String email;

    private String phone;
    private String password;
    private String address; // Stores Street Address
    @Enumerated(EnumType.STRING)
    private Role role;
    private String businessName;
    private String district;
    private String zipcode;
    private String nic;
    private String AvatarUrl;

    // --- NEW FIELDS FOR LOCATION MAPPING ---
    private String province;
    private String city;
    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private int penaltyPoints = 0; // Tracks the accumulated severity points

    @Column(name = "is_banned", nullable = false)
    private boolean isBanned = false;// Flag to block access if points >= 6


    @OneToOne(mappedBy = "user")
    private ForgotPassword forgotPassword;
}