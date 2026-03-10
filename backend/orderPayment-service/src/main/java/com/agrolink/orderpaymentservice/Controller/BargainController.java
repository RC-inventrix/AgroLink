package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.BargainRequest;
import com.agrolink.orderpaymentservice.model.Bargain;
import com.agrolink.orderpaymentservice.model.BargainStatus;
import com.agrolink.orderpaymentservice.repository.BargainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bargains")
//@CrossOrigin(origins = "*")
public class BargainController {

    @Autowired
    private BargainRepository bargainRepository;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createBargain(@RequestBody BargainRequest request,
                                                             @RequestHeader(value = "X-User-Id", required = false) Long buyerId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long actualBuyerId = (buyerId != null) ? buyerId : 1L;

            Bargain bargain = Bargain.builder()
                    .vegetableId(request.getVegetableId())
                    .vegetableName(request.getVegetableName())
                    .vegetableImage(request.getVegetableImage())
                    .sellerId(request.getSellerId())
                    .buyerId(actualBuyerId)
                    .buyerName(request.getBuyerName() != null ? request.getBuyerName() : "Unknown Buyer")
                    .quantity(request.getQuantity())
                    .suggestedPrice(request.getSuggestedPrice())
                    .originalPricePerKg(request.getOriginalPricePerKg())

                    // NEW: Appending the new delivery & cost properties to the builder
                    .deliveryRequired(request.getDeliveryRequired())
                    .buyerAddress(request.getBuyerAddress())
                    .buyerLatitude(request.getBuyerLatitude())
                    .buyerLongitude(request.getBuyerLongitude())
                    .deliveryFee(request.getDeliveryFee())
                    .distance(request.getDistance())
                    .finalTotal(request.getFinalTotal())

                    .status(BargainStatus.PENDING)
                    .build();

            Bargain savedBargain = bargainRepository.save(bargain);

            // Clean, structured success response
            response.put("success", true);
            response.put("message", "Bargain request submitted successfully");
            response.put("data", savedBargain);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Clean, structured error response
            response.put("success", false);
            response.put("message", "Failed to submit bargain request: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Bargain>> getBargainsBySeller(@PathVariable String sellerId) {
        return ResponseEntity.ok(bargainRepository.findBySellerId(sellerId));
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<Bargain>> getBargainsByBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(bargainRepository.findByBuyerId(buyerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBargainStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        return bargainRepository.findById(id).map(bargain -> {
            try {
                BargainStatus newStatus = BargainStatus.valueOf(statusUpdate.get("status").toUpperCase());
                bargain.setStatus(newStatus);
                bargainRepository.save(bargain);
                return ResponseEntity.ok(bargain);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBargain(@PathVariable Long id) {
        if (bargainRepository.existsById(id)) {
            bargainRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}