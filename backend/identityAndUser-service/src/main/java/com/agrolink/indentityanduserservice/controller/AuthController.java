package com.agrolink.indentityanduserservice.controller;

import com.agrolink.indentityanduserservice.dto.LoginRequest;
import com.agrolink.indentityanduserservice.dto.RegisterRequest;
import com.agrolink.indentityanduserservice.services.AuthService;
import com.agrolink.indentityanduserservice.services.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            // FIX: Delegate all logic to the Service.
            // The service now handles the mapping of address, nic, etc.
            String response = service.saveUser(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ... (Keep your existing login method below) ...
    @PostMapping("/login")
    public String getToken(@RequestBody LoginRequest authRequest) {
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getIdentifier(), authRequest.getPassword())
        );
        if (authenticate.isAuthenticated()) {
            UserDetails userDetails = (UserDetails) authenticate.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority();
            if(role.startsWith("ROLE_")) role = role.substring(5);
            return jwtService.generateToken(authRequest.getIdentifier(), role);
        } else {
            throw new RuntimeException("Invalid Access");
        }
    }
}