package com.agrolink.orderpaymentservice.Controller;


import com.agrolink.orderpaymentservice.model.BuyerOffer;
import com.agrolink.orderpaymentservice.model.Order;
import com.agrolink.orderpaymentservice.model.OrderStatus;
import com.agrolink.orderpaymentservice.model.RequirementStatus;
import com.agrolink.orderpaymentservice.repository.OfferRepository;
import com.agrolink.orderpaymentservice.repository.RequirementRepository;
import com.agrolink.orderpaymentservice.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferRepository offerRepository;
    private final RequirementRepository requirementRepository;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

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

                    // TRIGGER: If the offer is accepted, create a formal Order
                    if ("ACCEPTED".equalsIgnoreCase(newStatus)) {
                        requirementRepository.findById(offer.getRequirementId()).ifPresent(requirement -> {
                            // 1. Close the Requirement
                            requirement.setStatus(RequirementStatus.FULFILLED);
                            requirementRepository.save(requirement);

                            // 2. Prepare Items JSON for Order History
                            String itemsJson = "";
                            try {
                                List<Map<String, Object>> items = List.of(Map.of(
                                        "productName", requirement.getCropName(),
                                        "quantity", offer.getSupplyQty(),
                                        "pricePerKg", offer.getUnitPrice(),
                                        "sellerId", offer.getSellerId()
                                ));
                                itemsJson = objectMapper.writeValueAsString(items);
                            } catch (Exception e) {
                                System.err.println("JSON Parsing failed for Offer Order");
                            }

                            // 3. Create the Order Entry
                            Order newOrder = Order.builder()
                                    .userId(requirement.getBuyerId()) // Buyer from requirement
                                    .sellerId(offer.getSellerId())
                                    .amount((long) (offer.getSupplyQty() * offer.getUnitPrice() * 100))
                                    .currency("lkr")
                                    .status(OrderStatus.PROCESSING)
                                    .itemsJson(itemsJson)
                                    .stripeId("OFFER-" + UUID.randomUUID().toString()) // Internal ID
                                    .build();

                            orderService.createOrder(newOrder); // Generates OTP automatically
                        });
                    }

                    return ResponseEntity.ok(savedOffer);
                }
                return ResponseEntity.badRequest().body("Status field is required");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
