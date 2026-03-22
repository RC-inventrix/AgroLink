package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    @Autowired
    private final CartRepository cartRepository;

    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItem item) {
        // Find all cart items for this user and product
        List<CartItem> existingItems = cartRepository.findByUserIdAndProductId(item.getUserId(), item.getProductId());

        // Filter the list to find an EXACT MATCH based on the chosen Delivery Address
        Optional<CartItem> matchingItem = existingItems.stream()
                .filter(c -> Objects.equals(c.getBuyerAddress(), item.getBuyerAddress()))
                .findFirst();

        if (matchingItem.isPresent()) {
            CartItem cartItem = matchingItem.get();

            // Add new quantity to existing quantity because the location matches perfectly
            cartItem.setQuantity(cartItem.getQuantity() + item.getQuantity());

            // INTEGRATION FOR BARGAINING & NEW LOGISTICS:
            if (item.getPricePerKg() != null) {
                cartItem.setPricePerKg(item.getPricePerKg());
            }
            if (item.getAgreedPrice() != null) {
                cartItem.setAgreedPrice(item.getAgreedPrice());
                cartItem.setProductPrice(item.getProductPrice());
                cartItem.setTotalPrice(item.getTotalPrice());
                cartItem.setBargainId(item.getBargainId());
            }

            // Update Delivery Info safely
            if (item.getBuyerLatitude() != null) {
                cartItem.setBuyerLatitude(item.getBuyerLatitude());
                cartItem.setBuyerLongitude(item.getBuyerLongitude());
            }
            if (item.getDeliveryFee() != null) {
                cartItem.setDeliveryFee(item.getDeliveryFee());
            }

            return ResponseEntity.ok(cartRepository.save(cartItem));
        }

        // If it's a completely new item OR the delivery location is different, save as a separate row!
        return ResponseEntity.ok(cartRepository.save(item));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItem>> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartRepository.findByUserId(userId));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long id) {
        cartRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        List<CartItem> items = cartRepository.findByUserId(userId);
        cartRepository.deleteAll(items);
        return ResponseEntity.ok().build();
    }
}