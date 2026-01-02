package com.agrolink.indentityanduserservice.controller;

import com.agrolink.indentityanduserservice.dto.AuthResponse;
import com.agrolink.indentityanduserservice.dto.LoginRequest;
import com.agrolink.indentityanduserservice.dto.RegisterRequest;
import com.agrolink.indentityanduserservice.dto.UserUpdateDTO;
import com.agrolink.indentityanduserservice.model.User;
import com.agrolink.indentityanduserservice.services.AuthService;
import com.agrolink.indentityanduserservice.services.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;


    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            String response = service.saveUser(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> getToken(@RequestBody LoginRequest authRequest, HttpServletResponse response) {
        try {
            Authentication authenticate = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getIdentifier(), authRequest.getPassword())
            );

            // Inside AuthController.java -> getToken()
            // Inside AuthController.java -> getToken()
            if (authenticate.isAuthenticated()) {
                Long userId = service.getUserIdByEmail(authRequest.getIdentifier());
                UserDetails userDetails = (UserDetails) authenticate.getPrincipal();
                String role = userDetails.getAuthorities().iterator().next().getAuthority();
                if(role.startsWith("ROLE_")) role = role.substring(5);

                String token = jwtService.generateToken(authRequest.getIdentifier(),role, (long) userId);

                // 1. Remove the cookie logic
                // 2. Return the token in the body
                return ResponseEntity.ok(new AuthResponse(token, role, authRequest.getIdentifier(),userId));

            } else {
                return ResponseEntity.status(401).body("Authentication failed");
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // To log out, we overwrite the existing "token" cookie with an expired one
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Immediately expires the cookie

        response.addCookie(cookie);
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        // If the request reaches this point, the JwtAuthenticationFilter
        // already verified the cookie and set the SecurityContext
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        // 1. Get the email from the authenticated user context
        String email = authentication.getName();

        // 2. Fetch the user's full name from your database service
        // For example, if you have a service that finds user by email:
        String fullName = service.getFullNameByEmail(email);

        // 3. Return a small JSON object with the name
        return ResponseEntity.ok(java.util.Map.of("fullName", fullName));
    }

    @GetMapping("/fullnames")
    public ResponseEntity<Map<Long, String>> getFullNamesByIds(@RequestParam List<Long> ids) {
        // Use the method we just added to authService
        List<User> users = authService.findAllById(ids);

        Map<Long, String> fullNameMap = users.stream()
                .collect(Collectors.toMap(
                        User::getId,       // Key: Long
                        User::getFullname  // Value: String
                ));

        return ResponseEntity.ok(fullNameMap);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        // We use the existing AuthService to find the user by ID
        // Since you already have a findAllById method, we can use it like this:
        return service.findAllById(java.util.Collections.singletonList(id))
                .stream()
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody UserUpdateDTO updateDTO, HttpServletRequest request) {
        // 1. Safely extract and convert the userId from the request attribute
        Object userIdObj = request.getAttribute("userId");

        if (userIdObj == null) {
            return ResponseEntity.status(401).body("User ID not found in security context");
        }

        // Use Number to handle potential Integer-to-Long casting issues
        Long userId = Long.valueOf(userIdObj.toString());

        try {
            User updatedUser = service.updateUserDetails(userId, updateDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            // Log the actual error to your terminal to see specific DB or mapping issues
            e.printStackTrace();
            return ResponseEntity.status(500).body("Update failed: " + e.getMessage());
        }
    }
}