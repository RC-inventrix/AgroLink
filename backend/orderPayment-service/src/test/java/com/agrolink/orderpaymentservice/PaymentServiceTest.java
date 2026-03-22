/* fileName: PaymentServiceTest.java */
package com.agrolink.orderpaymentservice;

import com.agrolink.orderpaymentservice.model.CartItem;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.repository.CartRepository;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import com.agrolink.orderpaymentservice.service.PaymentService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private PaymentService paymentService;

    private CartItem deliveryCartItem;
    private CartItem pickupCartItem;

    @BeforeEach
    void setUp() throws JsonProcessingException {
        // Mock the JSON serialization to prevent errors during the test
        when(objectMapper.writeValueAsString(any())).thenReturn("[{}]");

        // Set up a standard Delivery Cart Item with coordinates
        deliveryCartItem = CartItem.builder()
                .id(1L)
                .userId(10L)
                .productName("Carrots")
                .pricePerKg(200.0)
                .quantity(2.0)
                .deliveryFee(150.0)
                .buyerAddress("123 Main Street, Colombo")
                .buyerLatitude(6.9271)
                .buyerLongitude(79.8612)
                .build();

        // Set up a Pickup Cart Item
        pickupCartItem = CartItem.builder()
                .id(2L)
                .userId(10L)
                .productName("Potatoes")
                .pricePerKg(150.0)
                .quantity(5.0)
                .deliveryFee(0.0)
                .buyerAddress("Pickup by Buyer")
                .buyerLatitude(null)
                .buyerLongitude(null)
                .build();
    }

    @Test
    void processCashOnDelivery_shouldMapCoordinates_whenItIsADeliveryOrder() {
        // Arrange
        when(cartRepository.findAllById(List.of(1L))).thenReturn(List.of(deliveryCartItem));
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);

        // Act
        paymentService.processCashOnDelivery(10L, List.of(1L));

        // Assert
        verify(orderRepository).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();

        assertThat(savedOrder.getIsDelivery()).isTrue();
        // FIX: Changed from getBuyerAddress() to getDeliveryAddress() to match the Order entity
        assertThat(savedOrder.getDeliveryAddress()).isEqualTo("123 Main Street, Colombo");
        assertThat(savedOrder.getBuyerLatitude()).isEqualTo(6.9271);
        assertThat(savedOrder.getBuyerLongitude()).isEqualTo(79.8612);
        assertThat(savedOrder.getAmount()).isEqualTo(55000L); // (200 * 2 + 150) * 100 cents

        // Verify the cart item gets deleted after processing
        verify(cartRepository).deleteAll(List.of(deliveryCartItem));
    }

    @Test
    void processCashOnDelivery_shouldMarkAsPickup_whenAddressContainsPickupKeyword() {
        // Arrange
        when(cartRepository.findAllById(List.of(2L))).thenReturn(List.of(pickupCartItem));
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);

        // Act
        paymentService.processCashOnDelivery(10L, List.of(2L));

        // Assert
        verify(orderRepository).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();

        // isDelivery should be FALSE because the address says "Pickup by Buyer"
        assertThat(savedOrder.getIsDelivery()).isFalse();
        // FIX: Changed from getBuyerAddress() to getDeliveryAddress() here as well
        assertThat(savedOrder.getDeliveryAddress()).isEqualTo("Pickup by Buyer");
        assertThat(savedOrder.getDeliveryFee()).isEqualTo(0.0);
    }
}