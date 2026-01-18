package com.agrolink.orderpaymentservice.Controller;


import com.agrolink.orderpaymentservice.model.BuyerOffer;
import com.agrolink.orderpaymentservice.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferRepository offerRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createOffer(@RequestBody BuyerOffer offer) {
        try {
            // In a real scenario, you would handle image saving to S3/Local here
            return ResponseEntity.ok(offerRepository.save(offer));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating offer: " + e.getMessage());
        }
    }

    @GetMapping("/requirement/{reqId}")
    public ResponseEntity<?> getOffersByRequirement(@PathVariable Long reqId) {
        return ResponseEntity.ok(offerRepository.findByRequirementId(reqId));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<BuyerOffer>> getOffersBySeller(@PathVariable Long sellerId) {
        
        return ResponseEntity.ok(offerRepository.findBySellerId(sellerId));
    }
}
