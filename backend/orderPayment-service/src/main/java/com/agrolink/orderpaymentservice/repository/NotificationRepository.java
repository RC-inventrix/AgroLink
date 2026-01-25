package com.agrolink.orderpaymentservice.repository;


import com.agrolink.orderpaymentservice.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Find all notifications for a specific user, sorted by newest first
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
