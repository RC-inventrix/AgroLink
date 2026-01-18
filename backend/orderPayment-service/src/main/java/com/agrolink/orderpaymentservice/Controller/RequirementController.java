package com.agrolink.orderpaymentservice.Controller;

import com.agrolink.orderpaymentservice.model.Requirement;
import com.agrolink.orderpaymentservice.model.RequirementStatus;
import com.agrolink.orderpaymentservice.repository.RequirementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirements")
@RequiredArgsConstructor
public class RequirementController {

    private final RequirementRepository requirementRepository;

    @PostMapping("/create")
    public ResponseEntity<Requirement> createRequirement(@RequestBody Requirement requirement) {
        return ResponseEntity.ok(requirementRepository.save(requirement));
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<Requirement>> getBuyerRequirements(@PathVariable Long buyerId) {
        return ResponseEntity.ok(requirementRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Requirement> updateRequirement(@PathVariable Long id, @RequestBody Requirement updatedReq) {
        return requirementRepository.findById(id)
                .map(existingReq -> {
                    existingReq.setCropName(updatedReq.getCropName());
                    existingReq.setQuantity(updatedReq.getQuantity());
                    existingReq.setExpectedUnitPrice(updatedReq.getExpectedUnitPrice());
                    existingReq.setDeliveryAddress(updatedReq.getDeliveryAddress());
                    existingReq.setExpectedDate(updatedReq.getExpectedDate());
                    existingReq.setDescription(updatedReq.getDescription());
                    return ResponseEntity.ok(requirementRepository.save(existingReq));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequirement(@PathVariable Long id) {
        requirementRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Requirement>> getByStatus(@PathVariable RequirementStatus status) {
        // Spring automatically converts the String "OPEN" from the URL
        // to the RequirementStatus.OPEN enum constant.
        return ResponseEntity.ok(requirementRepository.findByStatusOrderByCreatedAtDesc(status));
    }
}
