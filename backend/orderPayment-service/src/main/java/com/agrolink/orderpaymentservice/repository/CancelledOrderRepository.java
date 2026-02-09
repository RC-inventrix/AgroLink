package com.agrolink.orderpaymentservice.repository;


import com.agrolink.orderpaymentservice.model.CancelledOrder;
import com.agrolink.orderpaymentservice.model.CancelledOrderNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// In CancelledOrderRepository.java
public interface CancelledOrderRepository extends JpaRepository<CancelledOrder, Long> {

    // Change findByBuyerId to findByOtherPartyId
    List<CancelledOrder> findByOtherPartyIdOrderByCancelledAtDesc(Long otherPartyId);

    // Also update the "First" method if you are using it
    Optional<CancelledOrder> findFirstByOrderIdOrderByCancelledAtDesc(Long orderId);
}