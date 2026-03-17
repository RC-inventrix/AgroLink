package com.me.moderationservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    private Long id;

    @Column(name = "penalty_points") // Force mapping to snake_case column
    private int penaltyPoints;

    @Column(name = "is_banned") // Force mapping to snake_case column
    private boolean isBanned;
}
