package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")

@RequiredArgsConstructor
// NO @CrossOrigin annotation here (Gateway handles it now!)
public class CartController {

    private final CartRepository cartRepository;

    // 1. Add to Cart
    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItem item) {
        // Check if item already exists in cart for this user
        var existingItem = cartRepository.findByUserIdAndProductId(item.getUserId(), item.getProductId());

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            // Add new quantity to existing quantity
            cartItem.setQuantity(cartItem.getQuantity() + item.getQuantity());
            return ResponseEntity.ok(cartRepository.save(cartItem));
        }

        return ResponseEntity.ok(cartRepository.save(item));
    }

    // 2. Get User's Cart
    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItem>> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartRepository.findByUserId(userId));
    }

    // 3. Remove Item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long id) {
        cartRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // 4. Clear Cart (Useful after checkout)
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        List<CartItem> items = cartRepository.findByUserId(userId);
        cartRepository.deleteAll(items);
        return ResponseEntity.ok().build();
    }
}