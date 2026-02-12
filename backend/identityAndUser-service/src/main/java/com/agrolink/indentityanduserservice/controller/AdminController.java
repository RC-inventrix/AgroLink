package com.agrolink.indentityanduserservice.controller;

import com.agrolink.indentityanduserservice.dto.LoginRequestAdmin; // Import the DTO we just made
import com.agrolink.indentityanduserservice.model.Admin;
import com.agrolink.indentityanduserservice.repository.AdminRepository; // Import Repository
import com.agrolink.indentityanduserservice.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder; // Import PasswordEncoder
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AdminRepository adminRepository; // Inject Repository

    @Autowired
    private PasswordEncoder passwordEncoder; // Inject PasswordEncoder

    // Register Endpoint
    @PostMapping("/register")
    public ResponseEntity<Admin> registerAdmin(@RequestBody Admin admin) {
        return ResponseEntity.ok(adminService.registerAdmin(admin));
    }

    // --- NEW: Login Endpoint ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestAdmin request) {
        // 1. Find Admin (Handle Optional correctly using .orElse(null))
        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElse(null);

        // 2. Check if Admin exists
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        // 3. Check if Password matches
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        // 4. Success
        return ResponseEntity.ok("Login successful");
    }
}