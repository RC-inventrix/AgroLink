package com.agrolink.indentityanduserservice.services;

import com.agrolink.indentityanduserservice.dto.RegisterRequest;
import com.agrolink.indentityanduserservice.model.Role;
import com.agrolink.indentityanduserservice.model.User;
import com.agrolink.indentityanduserservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String saveUser(RegisterRequest request) {
        User user = new User();

        // 1. Map Common Fields
        user.setFullname(request.getFullname());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // 2. Map Role
        try {
            user.setRole(Role.valueOf(request.getRole()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid Role");
        }

        // 3. Map Address & Business Details (For BOTH Farmers and Buyers)
        // Remove the "if (Farmer)" check here so Buyers get their data saved too.
        user.setBusinessName(request.getBusinessName());
        user.setAddress(request.getStreetAddress()); // Maps 'Delivery Address' to 'Address'
        user.setDistrict(request.getDistrict());
        user.setZipcode(request.getZipcode());

        // 4. Map NIC (Only relevant for Farmers, but safe to map always)
        // Buyers send "" (empty string) for this, which is fine.
        user.setNic(request.getBusinessRegOrNic());

        userRepository.save(user);
        return "User registered successfully";
    }
}