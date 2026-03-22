package com.agrolink.orderpaymentservice.repository;

import com.agrolink.orderpaymentservice.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);

    // Changed from Optional to List to handle different delivery locations for the same product
    List<CartItem> findByUserIdAndProductId(Long userId, Long productId);
}