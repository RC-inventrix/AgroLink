package com.agrolink.orderpaymentservice.repository;

import com.agrolink.orderpaymentservice.model.Bargain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BargainRepository extends JpaRepository<Bargain, Long> {
    List<Bargain> findByBuyerId(Long buyerId);
    List<Bargain> findBySellerId(String sellerId);
}