package com.agrolink.orderpaymentservice.repository;


import com.agrolink.orderpaymentservice.model.BuyerOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OfferRepository extends JpaRepository<BuyerOffer, Long> {
    List<BuyerOffer> findByRequirementId(Long requirementId);
    List<BuyerOffer> findBySellerId(Long sellerId);
}
