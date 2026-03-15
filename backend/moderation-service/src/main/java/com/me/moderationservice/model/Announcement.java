package com.me.moderationservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String message;
    private String targetAudience; // e.g., "ALL", "FARMER", "BUYER"
    private String priority; // e.g., "NORMAL", "HIGH", "URGENT"
    private String status; // e.g., "DRAFT", "PUBLISHED"

    private LocalDateTime createdAt = LocalDateTime.now();
}
