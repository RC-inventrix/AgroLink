package com.agrolink.orderpaymentservice.service;

import com.agrolink.orderpaymentservice.dto.ReviewRequest;
import com.agrolink.orderpaymentservice.dto.ReviewResponse;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderReview;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import com.agrolink.orderpaymentservice.repository.OrderReviewRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private OrderReviewRepository reviewRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public void submitReview(Long orderId, Long userId, ReviewRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Find existing review or create a new one
        OrderReview review = reviewRepository.findById(orderId)
                .orElse(new OrderReview());

        // If it's a new review, initialize the relationship and IDs
        if (review.getOrder() == null) {
            review.setOrder(order);
            // Automatically save both IDs from the existing order object
            review.setBuyerId(order.getUserId());
            review.setSellerId(order.getSellerId());
        }

        // Identify if the current submitter is the Buyer or Seller
        if (order.getUserId().equals(userId)) {
            review.setBuyerRating(request.getRating());
            review.setBuyerComment(request.getComment());
            review.setBuyerReviewedAt(LocalDateTime.now());
        } else if (order.getSellerId().equals(userId)) {
            review.setSellerRating(request.getRating());
            review.setSellerComment(request.getComment());
            review.setSellerReviewedAt(LocalDateTime.now());
        } else {
            throw new RuntimeException("Unauthorized user");
        }

        reviewRepository.save(review);
    }

    public Map<String, Object> getSellerStats(Long sellerId) {
        List<OrderReview> reviews = reviewRepository.findByOrderSellerId(sellerId);

        // Filter out rows where the buyer hasn't left a rating yet
        List<OrderReview> completedReviews = reviews.stream()
                .filter(r -> r.getBuyerRating() != null)
                .toList();

        double averageRating = completedReviews.stream()
                .mapToInt(OrderReview::getBuyerRating)
                .average()
                .orElse(0.0);

        return Map.of(
                "averageRating", averageRating,
                "totalReviews", completedReviews.size(),
                "reviews", completedReviews
        );
    }

    public List<ReviewResponse> getUserReviews(Long userId, String role) {
        if ("SELLER".equalsIgnoreCase(role)) {
            // Logic: If I am a Seller, show me what BUYERS wrote about me
            List<OrderReview> reviews = reviewRepository.findReviewsAboutSeller(userId);

            return reviews.stream().map(r -> ReviewResponse.builder()
                            .id(r.getId())
                            .reviewerId(r.getOrder().getUserId()) // The reviewer is the Buyer
                            .rating(r.getBuyerRating())            // The rating given by the Buyer
                            .comment(r.getBuyerComment())          // The comment given by the Buyer
                            .date(r.getBuyerReviewedAt())
                            .build())
                    .collect(Collectors.toList());

        } else if ("BUYER".equalsIgnoreCase(role)) {
            // Logic: If I am a Buyer, show me what SELLERS wrote about me
            List<OrderReview> reviews = reviewRepository.findReviewsAboutBuyer(userId);

            return reviews.stream().map(r -> ReviewResponse.builder()
                            .id(r.getId())
                            .reviewerId(r.getOrder().getSellerId()) // The reviewer is the Seller
                            .rating(r.getSellerRating())            // The rating given by the Seller
                            .comment(r.getSellerComment())          // The comment given by the Seller
                            .date(r.getSellerReviewedAt())
                            .build())
                    .collect(Collectors.toList());
        }

        return List.of();
    }
}
