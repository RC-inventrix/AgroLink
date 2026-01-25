package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.ReviewRequest;
import com.agrolink.orderpaymentservice.dto.ReviewResponse;
import com.agrolink.orderpaymentservice.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/{orderId}")
    public ResponseEntity<String> postReview(
            @PathVariable Long orderId,
            @RequestParam Long userId, // Replace with Security context in production
            @RequestBody ReviewRequest reviewRequest) {

        reviewService.submitReview(orderId, userId, reviewRequest);
        return ResponseEntity.ok("Review submitted successfully!");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByUser(
            @PathVariable Long userId,
            @RequestParam String role) {

        List<ReviewResponse> reviews = reviewService.getUserReviews(userId, role);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<Map<String, Object>> getRatingStats(
            @PathVariable Long userId,
            @RequestParam String role) {

        // Returns JSON: { "average": 4.5, "count": 12 }
        return ResponseEntity.ok(reviewService.getUserRatingStats(userId, role));
    }

}