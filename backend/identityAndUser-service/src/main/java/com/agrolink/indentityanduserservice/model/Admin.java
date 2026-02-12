package com.agrolink.indentityanduserservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import lombok.Builder;


@Entity
@Data
@Builder // Helps create objects easily
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    // IMPROVEMENT: Added role for Spring Security (Default to ROLE_ADMIN)
    @Column(nullable = false)
    private String role;
}
