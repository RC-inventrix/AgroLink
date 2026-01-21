package com.agrolink.orderpaymentservice.repository;

import com.agrolink.orderpaymentservice.model.Requirement;
import com.agrolink.orderpaymentservice.model.RequirementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface RequirementRepository extends JpaRepository<Requirement, Long> {
    List<Requirement> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<Requirement> findByStatusOrderByCreatedAtDesc(RequirementStatus status);

    @Transactional
    @Modifying
    void deleteByExpectedDateBefore(LocalDate date);
}
