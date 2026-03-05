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

// Add these imports at the top
import com.agrolink.indentityanduserservice.services.JwtService;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService; // 1. Inject your JwtService

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestAdmin request) {
        // 1. Find the Admin
        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElse(null);

        // 2. Validate Credentials
        if (admin == null || !passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        // 3. Generate Token
        // IMPORTANT: If your JwtFilter expects an email to find the user,
        // you must pass the admin's unique identifier here.
        String token = jwtService.generateToken(admin.getUsername(), "ROLE_ADMIN", admin.getId());

        // 4. Return as a Map so frontend receives JSON
        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", admin.getUsername(),
                "role", "ADMIN"
        ));
    }
}