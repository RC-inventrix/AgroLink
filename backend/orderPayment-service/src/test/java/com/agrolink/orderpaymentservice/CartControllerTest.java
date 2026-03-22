/* fileName: CartControllerTest.java */
package com.agrolink.orderpaymentservice;

import com.agrolink.orderpaymentservice.Controller.CartController;
import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {

    @Mock
    private CartRepository cartRepository;

    @InjectMocks
    private CartController cartController;

    private CartItem existingItem;
    private CartItem newItemRequest;

    @BeforeEach
    void setUp() {
        existingItem = CartItem.builder()
                .id(1L)
                .userId(10L)
                .productId(100L)
                .buyerAddress("123 Farm Road, Colombo")
                .quantity(5.0)
                .pricePerKg(200.0)
                .build();

        newItemRequest = CartItem.builder()
                .userId(10L)
                .productId(100L)
                .quantity(3.0)
                .pricePerKg(200.0)
                .build();
    }

    @Test
    void addToCart_shouldIncreaseQuantity_whenAddressIsExactMatch() {
        // Arrange: The new request has the EXACT SAME address as the item already in the cart
        newItemRequest.setBuyerAddress("123 Farm Road, Colombo");
        newItemRequest.setDeliveryFee(150.0);

        when(cartRepository.findByUserIdAndProductId(10L, 100L)).thenReturn(List.of(existingItem));
        when(cartRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        ResponseEntity<CartItem> response = cartController.addToCart(newItemRequest);

        // Assert: Quantity should be aggregated (5.0 + 3.0 = 8.0)
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getQuantity()).isEqualTo(8.0);
        assertThat(response.getBody().getDeliveryFee()).isEqualTo(150.0);

        // Verify repository save was called once
        verify(cartRepository, times(1)).save(existingItem);
    }

    @Test
    void addToCart_shouldCreateNewCartItem_whenAddressIsDifferent() {
        // Arrange: The new request is for the same product, but a DIFFERENT address
        newItemRequest.setBuyerAddress("456 City Center, Kandy");

        when(cartRepository.findByUserIdAndProductId(10L, 100L)).thenReturn(List.of(existingItem));
        when(cartRepository.save(any(CartItem.class))).thenAnswer(inv -> {
            CartItem savedItem = inv.getArgument(0);
            savedItem.setId(2L); // Give it a new ID to simulate a fresh DB insertion
            return savedItem;
        });

        // Act
        ResponseEntity<CartItem> response = cartController.addToCart(newItemRequest);

        // Assert: A completely new item is created, quantity remains 3.0
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo(2L);
        assertThat(response.getBody().getQuantity()).isEqualTo(3.0);
        assertThat(response.getBody().getBuyerAddress()).isEqualTo("456 City Center, Kandy");

        // Ensure the original existing item's quantity was NOT modified
        assertThat(existingItem.getQuantity()).isEqualTo(5.0);
        verify(cartRepository, times(1)).save(newItemRequest);
    }

    @Test
    void addToCart_shouldCreateNewCartItem_whenProductNotInCartAtAll() {
        // Arrange: Cart is empty for this product
        newItemRequest.setBuyerAddress("789 Village Street, Galle");

        when(cartRepository.findByUserIdAndProductId(10L, 100L)).thenReturn(Collections.emptyList());
        when(cartRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        ResponseEntity<CartItem> response = cartController.addToCart(newItemRequest);

        // Assert
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getQuantity()).isEqualTo(3.0);
        verify(cartRepository, times(1)).save(newItemRequest);
    }

    @Test
    void getCart_shouldReturnUsersCartItems() {
        when(cartRepository.findByUserId(10L)).thenReturn(List.of(existingItem));

        ResponseEntity<List<CartItem>> response = cartController.getCart(10L);

        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getUserId()).isEqualTo(10L);
    }

    @Test
    void clearCart_shouldDeleteAllItemsForUser() {
        when(cartRepository.findByUserId(10L)).thenReturn(List.of(existingItem));
        doNothing().when(cartRepository).deleteAll(anyList());

        ResponseEntity<Void> response = cartController.clearCart(10L);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        verify(cartRepository, times(1)).deleteAll(List.of(existingItem));
    }
}