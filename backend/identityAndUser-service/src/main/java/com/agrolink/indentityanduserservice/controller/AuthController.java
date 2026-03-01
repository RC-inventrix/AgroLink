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
import org.springframework.http.HttpStatus;
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

    @GetMapping("/count/farmers")
    public ResponseEntity<Long> getFarmerCount() {
        return ResponseEntity.ok(service.getActiveFarmerCount());
    }

    @GetMapping("/count/buyers")
    public ResponseEntity<Long> getBuyerCount() {
        return ResponseEntity.ok(service.getActiveBuyerCount());
    }



    // --- FIX: Endpoint to resolve "NoResourceFoundException" for /auth/user/{id} ---
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            // Ensure you have implemented findById in your AuthService
            User user = service.findById(id);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving user: " + e.getMessage());
        }
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

            if (authenticate.isAuthenticated()) {
                Long userId = service.getUserIdByEmail(authRequest.getIdentifier());
                UserDetails userDetails = (UserDetails) authenticate.getPrincipal();
                String role = userDetails.getAuthorities().iterator().next().getAuthority();
                if(role.startsWith("ROLE_")) role = role.substring(5);

                String token = jwtService.generateToken(authRequest.getIdentifier(), role, userId);

                return ResponseEntity.ok(new AuthResponse(token, role, authRequest.getIdentifier(), userId));
            } else {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
            }
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("message", "The email or password you entered is incorrect."));
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(403).body(Map.of("message", "Your account is temporarily disabled. Please contact support."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "An unexpected server error occurred. Please try again later."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String email = authentication.getName();
        String fullName = service.getFullNameByEmail(email);
        return ResponseEntity.ok(java.util.Map.of("fullName", fullName));
    }

    @GetMapping("/fullnames")
    public ResponseEntity<Map<Long, String>> getFullNamesByIds(@RequestParam List<Long> ids) {
        List<User> users = service.findAllById(ids);
        Map<Long, String> fullNameMap = users.stream()
                .collect(Collectors.toMap(
                        User::getId,
                        User::getFullname
                ));
        return ResponseEntity.ok(fullNameMap);
    }

    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody UserUpdateDTO updateDTO, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(service.updateUserDetails(userId, updateDTO));
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = service.checkEmailExists(email);
        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("An account with this email already exists.");
        }
        return ResponseEntity.ok("Email is available");
    }

    // Endpoint to get total number of users
    @GetMapping("/count")
    public ResponseEntity<Long> getUserCount() {
        try {
            long count = service.getTotalUserCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/total-users")
    public ResponseEntity<Long> getTotalUsers() {
        try {
            long count = service.getTotalUserCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            // මොකක් හරි අවුලක් ගියොත් Error එකක් යවනවා
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


}