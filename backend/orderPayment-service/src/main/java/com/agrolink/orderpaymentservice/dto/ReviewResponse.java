package com.agrolink.orderpaymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long reviewerId; // The ID of the person who wrote the review
    private String reviewerName; // Optional: If you store names in the Order/Review
    private int rating;
    private String comment;
    private LocalDateTime date;
}