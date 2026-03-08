package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    @Autowired
    private final CartRepository cartRepository;

    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItem item) {
        var existingItem = cartRepository.findByUserIdAndProductId(item.getUserId(), item.getProductId());

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();

            // Add new quantity to existing quantity
            cartItem.setQuantity(cartItem.getQuantity() + item.getQuantity());

            // INTEGRATION FOR BARGAINING & NEW LOGISTICS:
            // Update the pricing to the bargained rate
            if (item.getPricePerKg() != null) {
                cartItem.setPricePerKg(item.getPricePerKg());
            }
            if (item.getAgreedPrice() != null) {
                cartItem.setAgreedPrice(item.getAgreedPrice());
                cartItem.setProductPrice(item.getProductPrice());
                cartItem.setTotalPrice(item.getTotalPrice());
                cartItem.setBargainId(item.getBargainId());
            }

            // Update Delivery Info in case the buyer changed locations
            if (item.getBuyerAddress() != null) {
                cartItem.setBuyerAddress(item.getBuyerAddress());
                cartItem.setBuyerCity(item.getBuyerCity());
                cartItem.setBuyerStreetAddress(item.getBuyerStreetAddress());
                cartItem.setBuyerLatitude(item.getBuyerLatitude());
                cartItem.setBuyerLongitude(item.getBuyerLongitude());
                cartItem.setDeliveryFee(item.getDeliveryFee());
            }

            return ResponseEntity.ok(cartRepository.save(cartItem));
        }

        // If it's a completely new item, save directly.
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