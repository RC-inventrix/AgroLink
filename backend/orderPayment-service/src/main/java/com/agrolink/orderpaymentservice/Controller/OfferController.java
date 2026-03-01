package com.agrolink.orderpaymentservice.Controller;


import com.agrolink.orderpaymentservice.model.*;
import com.agrolink.orderpaymentservice.repository.NotificationRepository;
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
    private final NotificationRepository notificationRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createOffer(@RequestBody BuyerOffer offer) {
        try {
            // In a real scenario, you would handle image saving to S3/Local here
            return ResponseEntity.ok(offerRepository.save(offer));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating offer: " + e.getMessage());
        }
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

                    if ("ACCEPTED".equalsIgnoreCase(newStatus)) {
                        requirementRepository.findById(offer.getRequirementId()).ifPresent(requirement -> {
                            // 1. Close Requirement
                            requirement.setStatus(RequirementStatus.FULFILLED);
                            requirementRepository.save(requirement);

                            // 2. Prepare Order Logic (Existing)
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
                                System.err.println("JSON Parsing failed");
                            }

                            Order newOrder = Order.builder()
                                    .userId(requirement.getBuyerId())
                                    .sellerId(offer.getSellerId())
                                    .amount((long) (offer.getSupplyQty() * offer.getUnitPrice() * 100))
                                    .currency("lkr")
                                    .status(OrderStatus.PROCESSING)
                                    .itemsJson(itemsJson)
                                    .stripeId("OFFER-" + UUID.randomUUID().toString())
                                    .build();

                            orderService.createOrder(newOrder);

                            // 3. CREATE NOTIFICATION FOR SELLER
                            Notification sellerNotification = Notification.builder()
                                    .userId(offer.getSellerId())
                                    .message("Your offer for " + requirement.getCropName() + " has been accepted! An order has been created.")
                                    .isRead(false)
                                    .build();

                            notificationRepository.save(sellerNotification);
                        });
                    }
                    return ResponseEntity.ok(savedOffer);
                }
                return ResponseEntity.badRequest().body("Status required");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<BuyerOffer>> getOffersBySeller(@PathVariable Long sellerId) {

        return ResponseEntity.ok(offerRepository.findBySellerId(sellerId));
    }


    @GetMapping("/notifications/seller/{sellerId}")
    public ResponseEntity<List<Notification>> getSellerNotifications(@PathVariable Long sellerId) {
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(sellerId));
    }

    @GetMapping("/requirement/{reqId}")
    public ResponseEntity<?> getOffersByRequirement(@PathVariable Long reqId) {
        return ResponseEntity.ok(offerRepository.findByRequirementId(reqId));
    }


}
