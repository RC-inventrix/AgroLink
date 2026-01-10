package com.agrolink.indentityanduserservice.services;

import com.agrolink.indentityanduserservice.dto.RegisterRequest;
import com.agrolink.indentityanduserservice.dto.UserUpdateDTO;
import com.agrolink.indentityanduserservice.model.Role;
import com.agrolink.indentityanduserservice.model.User;
import com.agrolink.indentityanduserservice.repository.UserRepository;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    @Autowired
    private  UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;



    public  Long getUserIdByEmail(@NotBlank(message = "Username/Email is required") String identifier) {
        // 1. Query the repository for the user by their email/identifier
        return userRepository.findByEmail(identifier)
                // 2. Map the found User object to their numeric ID
                .map(User::getId)
                // 3. Throw an exception if the user does not exist to prevent NullPointerException
                .orElseThrow(() -> new RuntimeException("User not found with email: " + identifier));
                // 4. Convert Long to int if your generateToken method specifically requires 'int'

    }

    public String saveUser(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("An account with this email already exists.");
        }

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

    public String getFullNameByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getFullname) // Assuming your Entity has a getFullName() method
                .orElse("User");
    }

    public List<User> findAllById(List<Long> ids) {
        return userRepository.findAllById(ids);
    }

    // Inside AuthService.java
    // Inside AuthService.java
    public User updateUserDetails(Long userId, UserUpdateDTO updateDTO) {
        // 1. Find user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Update existing attributes
        if (updateDTO.getFullname() != null) user.setFullname(updateDTO.getFullname());
        if (updateDTO.getPhone() != null) user.setPhone(updateDTO.getPhone());
        if (updateDTO.getAddress() != null) user.setAddress(updateDTO.getAddress());
        if (updateDTO.getBusinessName() != null) user.setBusinessName(updateDTO.getBusinessName());
        if (updateDTO.getDistrict() != null) user.setDistrict(updateDTO.getDistrict());
        if (updateDTO.getZipcode() != null) user.setZipcode(updateDTO.getZipcode());
        if (updateDTO.getAvatarUrl() != null) user.setAvatarUrl(updateDTO.getAvatarUrl());

        // 3. Save the updated entity to the database
        return userRepository.save(user);
    }

    public boolean checkEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}