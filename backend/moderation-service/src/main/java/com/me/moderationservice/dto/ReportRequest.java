package com.me.moderationservice.dto;

import com.me.moderationservice.model.IssueType;
import lombok.Data;
import java.util.List;

@Data
public class ReportRequest {
    private Long orderId;
    private Long reporterId;
    private Long reportedId;
    private IssueType issueType;
    private String description;
    private List<String> evidenceUrls; // List of secure URLs from Cloudinary
}