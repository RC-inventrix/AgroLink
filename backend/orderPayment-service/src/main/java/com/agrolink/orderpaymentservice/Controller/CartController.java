package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart") // Ensuring consistency with your other APIs
@RequiredArgsConstructor
// NO @CrossOrigin annotation here (Gateway handles it now!)
public class CartController {

    @Autowired
    private final CartRepository cartRepository;

    // 1. Add to Cart (Integrated to support Bargain Price updates)
    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItem item) {
        // Check if item already exists in cart for this user
        var existingItem = cartRepository.findByUserIdAndProductId(item.getUserId(), item.getProductId());

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();

            // Add new quantity to existing quantity
            cartItem.setQuantity(cartItem.getQuantity() + item.getQuantity());

            // INTEGRATION FOR BARGAINING:
            // If the incoming item has a price (which happens in a Bargain),
            // and it's different/new, we update the cart item's price to match the agreed deal.
            // This ensures the user gets the discounted price they fought for!
            if (item.getPricePerKg() != null) {
                cartItem.setPricePerKg(item.getPricePerKg());
            }

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
    @DeleteMapping("/delete/{id}")
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