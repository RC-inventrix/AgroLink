package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.dto.BargainRequest;
import com.agrolink.orderpaymentservice.model.Bargain;
import com.agrolink.orderpaymentservice.model.BargainStatus;
import com.agrolink.orderpaymentservice.repository.BargainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bargains")
//@CrossOrigin(origins = "*")
public class BargainController {

    @Autowired
    private BargainRepository bargainRepository;

    // ... Existing createBargain method ...
    @PostMapping("/create")
    public ResponseEntity<Bargain> createBargain(@RequestBody BargainRequest request,
                                                 @RequestHeader(value = "X-User-Id", required = false) Long buyerId) {
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
                .status(BargainStatus.PENDING)
                .build();
        return ResponseEntity.ok(bargainRepository.save(bargain));
    }

    // ... Existing getBargainsBySeller method ...
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Bargain>> getBargainsBySeller(@PathVariable String sellerId) {
        return ResponseEntity.ok(bargainRepository.findBySellerId(sellerId));
    }

    // NEW: Get Bargains for a specific Buyer
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<Bargain>> getBargainsByBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(bargainRepository.findByBuyerId(buyerId));
    }

    // ... Existing updateBargainStatus method ...
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

    // NEW: Delete a Bargain Request
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBargain(@PathVariable Long id) {
        if (bargainRepository.existsById(id)) {
            bargainRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}