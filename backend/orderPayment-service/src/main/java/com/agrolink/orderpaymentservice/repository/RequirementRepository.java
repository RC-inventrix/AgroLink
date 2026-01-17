package com.agrolink.orderpaymentservice.repository;

import com.agrolink.orderpaymentservice.model.Requirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequirementRepository extends JpaRepository<Requirement, Long> {
    List<Requirement> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<Requirement> findByStatusOrderByCreatedAtDesc(String status);
}
