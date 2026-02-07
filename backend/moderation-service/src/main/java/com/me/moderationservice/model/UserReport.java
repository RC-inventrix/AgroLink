package com.me.moderationservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_reports")
@Data
public class UserReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Long reporterId;
    private Long reportedId;

    @Enumerated(EnumType.STRING)
    private IssueType issueType;

    private String description;

    // Added to store Cloudinary image URLs
    @ElementCollection
    @CollectionTable(name = "report_evidence_images", joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "image_url")
    private List<String> evidenceUrls;

    private String status;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    private String actionTaken;
    private Long adminId;
    private String adminRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
        if (this.issueType != null) {
            this.riskLevel = this.issueType.getRiskLevel();
        }
    }

    public enum RiskLevel { LOW, MEDIUM, HIGH }
}