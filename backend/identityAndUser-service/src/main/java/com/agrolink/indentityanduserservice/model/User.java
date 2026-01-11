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
    private String address;
    @Enumerated(EnumType.STRING)
    private Role role;
    private String businessName;
    private String district;
    private String zipcode;
    private String nic;
    private String AvatarUrl;

    @OneToOne(mappedBy = "user")
    private ForgotPassword forgotPassword;


}
