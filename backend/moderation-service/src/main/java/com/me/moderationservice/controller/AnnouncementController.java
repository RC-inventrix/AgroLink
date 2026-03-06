package com.me.moderationservice.controller;

import com.me.moderationservice.model.Announcement;
import com.me.moderationservice.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
