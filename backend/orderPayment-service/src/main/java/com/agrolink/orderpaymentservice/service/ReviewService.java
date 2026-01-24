package com.agrolink.orderpaymentservice.service;

import com.agrolink.orderpaymentservice.dto.ReviewRequest;
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
}
