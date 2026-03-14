package com.me.moderationservice.controller;

import com.me.moderationservice.model.Announcement;
import com.me.moderationservice.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
public class AnnouncementController {
    private final AnnouncementRepository repository;

    @PostMapping("/create")
    public ResponseEntity<Announcement> create(@RequestBody Announcement announcement) {
        return ResponseEntity.ok(repository.save(announcement));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Announcement>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    // Used by Farmers/Buyers to see their relevant messages
    @GetMapping("/my-announcements")
    public ResponseEntity<List<Announcement>> getMyAnnouncements(@RequestParam String role) {
        return ResponseEntity.ok(repository.findByTargetAudienceIn(List.of("ALL", role.toUpperCase())));
    }


    // AnnouncementController.java additions

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        try {
            if (repository.existsById(id)) {
                repository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Announcement deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Announcement not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting announcement: " + e.getMessage());
        }
    }

    // Add this to AnnouncementController.java
    @PutMapping("/{id}")
    public ResponseEntity<Announcement> updateAnnouncement(@PathVariable Long id, @RequestBody Announcement updatedDetails) {
        return repository.findById(id)
                .map(announcement -> {
                    announcement.setTitle(updatedDetails.getTitle());
                    announcement.setMessage(updatedDetails.getMessage());
                    announcement.setTargetAudience(updatedDetails.getTargetAudience());
                    announcement.setPriority(updatedDetails.getPriority());
                    announcement.setStatus(updatedDetails.getStatus());
                    return ResponseEntity.ok(repository.save(announcement));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
