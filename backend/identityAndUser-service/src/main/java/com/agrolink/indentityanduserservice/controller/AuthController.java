package com.agrolink.indentityanduserservice.controller;

import com.agrolink.indentityanduserservice.dto.LoginRequest;
import com.agrolink.indentityanduserservice.model.User;
import com.agrolink.indentityanduserservice.services.AuthService;
import com.agrolink.indentityanduserservice.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service; // Your existing service for Registration

    @Autowired
    private JwtService jwtService; // The service we created to generate Tokens

    @Autowired
    private AuthenticationManager authenticationManager; // Handles the password checking

    // Your existing Registration Endpoint
    @PostMapping("/register")
    public String registerUser(@RequestBody User user){
        return service.saveUser(user);
    }

    // NEW: Login Endpoint
    @PostMapping("/login")
    public String getToken(@RequestBody LoginRequest authRequest) {
        // 1. This triggers the AuthenticationProvider we defined in SecurityConfig
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getIdentifier(), authRequest.getPassword())
        );

        // 2. If authentication is successful, generate the token
        if (authenticate.isAuthenticated()) {
            // We retrieve the UserDetails to get the correct Role
            UserDetails userDetails = (UserDetails) authenticate.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority();

            return jwtService.generateToken(authRequest.getIdentifier(), role);
        } else {
            throw new RuntimeException("Invalid Access");
        }
    }
}