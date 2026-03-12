package com.agrolink.orderpaymentservice;

import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.repository.OrderRepository;
import com.agrolink.orderpaymentservice.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private OrderService orderService;

    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleOrder = Order.builder()
                .id(1L)
                .userId(10L)
                .stripeId("pi_test_123")
                .amount(5000L)
                .currency("LKR")
                .customerEmail("buyer@example.com")
                .customerName("Test Buyer")
                .itemsJson("[]")
                .status(OrderStatus.CREATED)
                .build();
    }

    @Test
    void createOrder_shouldSetDefaultStatusAndOtp() {
        Order inputOrder = Order.builder()
                .userId(10L)
                .stripeId("pi_new_456")
                .amount(2000L)
                .currency("LKR")
                .build();

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(2L);
            return o;
        });

        Order result = orderService.createOrder(inputOrder);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.CREATED);
        assertThat(result.getOtp()).isNotNull().hasSize(6);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void createOrder_shouldPreserveExistingStatus() {
        Order inputOrder = Order.builder()
                .userId(10L)
                .stripeId("pi_paid_789")
                .amount(3000L)
                .currency("LKR")
                .status(OrderStatus.PAID)
                .build();

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.createOrder(inputOrder);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.PAID);
    }

    @Test
    void markAsPaid_shouldUpdateOrderStatusToPaymentSuccessful() {
        when(orderRepository.findByStripeId("pi_test_123"))
                .thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.markAsPaid("pi_test_123", "buyer@example.com", "Test Buyer");

        assertThat(result.getStatus()).isEqualTo(OrderStatus.PAID);
        assertThat(result.getCustomerEmail()).isEqualTo("buyer@example.com");
    }

    @Test
    void markAsPaid_shouldThrowWhenOrderNotFound() {
        when(orderRepository.findByStripeId("nonexistent_id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.markAsPaid("nonexistent_id", "a@b.com", "Name"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Order not found");
    }

    @Test
    void findByStripeId_shouldReturnOrderWhenExists() {
        when(orderRepository.findByStripeId("pi_test_123")).thenReturn(Optional.of(sampleOrder));

        Optional<Order> result = orderService.findByStripeId("pi_test_123");

        assertThat(result).isPresent();
        assertThat(result.get().getStripeId()).isEqualTo("pi_test_123");
    }

    @Test
    void findByStripeId_shouldReturnEmptyWhenNotFound() {
        when(orderRepository.findByStripeId("unknown")).thenReturn(Optional.empty());

        Optional<Order> result = orderService.findByStripeId("unknown");

        assertThat(result).isEmpty();
    }
}
