package com.agrolink.orderpaymentservice.repository;

import com.agrolink.orderpaymentservice.model.CancelledOrderNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CancelledOrderNotificationRepository extends JpaRepository<CancelledOrderNotification, Long> {
    List<CancelledOrderNotification> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
}
