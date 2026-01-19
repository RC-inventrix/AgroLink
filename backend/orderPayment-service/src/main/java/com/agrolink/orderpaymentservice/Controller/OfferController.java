package com.agrolink.orderpaymentservice.Controller;


import com.agrolink.orderpaymentservice.model.BuyerOffer;
import com.agrolink.orderpaymentservice.model.RequirementStatus;
import com.agrolink.orderpaymentservice.repository.OfferRepository;
import com.agrolink.orderpaymentservice.repository.RequirementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferRepository offerRepository;
    private final RequirementRepository requirementRepository;

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

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOfferStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            Optional<BuyerOffer> optionalOffer = offerRepository.findById(id);

            if (optionalOffer.isPresent()) {
                BuyerOffer offer = optionalOffer.get();
                String newStatus = statusUpdate.get("status");

                if (newStatus != null) {
                    offer.setStatus(newStatus);
                    BuyerOffer savedOffer = offerRepository.save(offer);

                    // LOGIC: If the offer is accepted, update the related requirement to FULFILLED
                    if ("ACCEPTED".equalsIgnoreCase(newStatus)) {
                        requirementRepository.findById(offer.getRequirementId()).ifPresent(requirement -> {
                            requirement.setStatus(RequirementStatus.FULFILLED); // Change status to FULFILLED
                            requirementRepository.save(requirement);
                        });
                    }

                    return ResponseEntity.ok(savedOffer);
                } else {
                    return ResponseEntity.badRequest().body("Status field is required in the request body.");
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating offer status: " + e.getMessage());
        }
    }
}
