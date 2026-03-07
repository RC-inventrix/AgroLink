package com.me.moderationservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "user_notifications")
public class UserNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // The ID of the reported user
    private String title; // e.g., "Official Warning"
    private String message; // The admin's remarks
    private String type; // e.g., "WARNING"
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}
