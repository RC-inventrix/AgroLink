package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.ReviewRequest;
import com.agrolink.orderpaymentservice.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}