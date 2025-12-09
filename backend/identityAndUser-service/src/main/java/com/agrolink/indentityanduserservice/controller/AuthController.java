package com.agrolink.indentityanduserservice.controller;

import com.agrolink.indentityanduserservice.dto.LoginRequest;
import com.agrolink.indentityanduserservice.dto.RegisterRequest;
import com.agrolink.indentityanduserservice.model.Role;
import com.agrolink.indentityanduserservice.model.User;
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
            // 1. Basic Mapping (Common Fields)
            User user = new User();
            user.setFullname(request.getFullname());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setPhone(request.getPhone());

            // 2. Validate and Set Role
            try {
                // Ensure the string matches the Enum (Farmer, Buyer) - Case Sensitive
                user.setRole(Role.valueOf(request.getRole()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid Role. Please select 'Farmer' or 'Buyer'.");
            }

            // 3. CONDITIONAL VALIDATION: Farmer Logic
            if (user.getRole() == Role.Farmer) {
                // If it is a Farmer, we MUST have Step 2 details.
                if (request.getBusinessName() == null || request.getBusinessName().isEmpty()) {
                    return ResponseEntity.badRequest().body("Business Name is required for Farmers.");
                }
                if (request.getStreetAddress() == null || request.getStreetAddress().isEmpty()) {
                    return ResponseEntity.badRequest().body("Street Address is required for Farmers.");
                }
                if (request.getDistrict() == null || request.getDistrict().isEmpty()) {
                    return ResponseEntity.badRequest().body("District is required for Farmers.");
                }
                if (request.getBusinessRegOrNic() == null || request.getBusinessRegOrNic().isEmpty()) {
                    return ResponseEntity.badRequest().body("Business Registration or NIC is required.");
                }

                // Map the specific fields
                user.setBusinessName(request.getBusinessName());
                user.setAddress(request.getStreetAddress()); // Map "Street Address" to DB "Address"
                user.setDistrict(request.getDistrict());
                user.setZipcode(request.getZipcode());
                user.setNic(request.getBusinessRegOrNic()); // Map "Reg/NIC" to DB "NIC"
            }
            // 4. Buyer Logic (Optional but recommended)
            else if (user.getRole() == Role.Buyer) {
                // Buyers might need an address too, but based on your UI description,
                // they skip Step 2. We can leave address null or set a default.
                user.setAddress("N/A");
            }

            // 5. Save the User
            String response = service.saveUser(user);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ... (Login method remains unchanged) ...
    @PostMapping("/login")
    public String getToken(@RequestBody LoginRequest authRequest) {
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getIdentifier(), authRequest.getPassword())
        );
        if (authenticate.isAuthenticated()) {
            UserDetails userDetails = (UserDetails) authenticate.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority();
            // Remove "ROLE_" prefix if present
            if(role.startsWith("ROLE_")) role = role.substring(5);
            return jwtService.generateToken(authRequest.getIdentifier(), role);
        } else {
            throw new RuntimeException("Invalid Access");
        }
    }
}