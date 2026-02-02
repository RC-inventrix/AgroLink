/* fileName: indentityanduserservice/services/AuthService.java */
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
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public Long getUserIdByEmail(@NotBlank(message = "Username/Email is required") String identifier) {
        return userRepository.findByEmail(identifier)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + identifier));
    }

    public String saveUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("An account with this email already exists.");
        }

        User user = new User();
        user.setFullname(request.getFullname());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        try {
            user.setRole(Role.valueOf(request.getRole()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid Role");
        }

        user.setBusinessName(request.getBusinessName());
        user.setAddress(request.getStreetAddress());
        user.setDistrict(request.getDistrict());
        user.setZipcode(request.getZipcode());
        user.setNic(request.getBusinessRegOrNic());

        // --- Set New Location Fields ---
        user.setProvince(request.getProvince());
        user.setCity(request.getCity());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());

        userRepository.save(user);
        return "User registered successfully";
    }

    public String getFullNameByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getFullname)
                .orElse("User");
    }

    public List<User> findAllById(List<Long> ids) {
        return userRepository.findAllById(ids);
    }

    public User updateUserDetails(Long userId, UserUpdateDTO updateDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updateDTO.getFullname() != null) user.setFullname(updateDTO.getFullname());
        if (updateDTO.getPhone() != null) user.setPhone(updateDTO.getPhone());
        if (updateDTO.getAddress() != null) user.setAddress(updateDTO.getAddress());
        if (updateDTO.getBusinessName() != null) user.setBusinessName(updateDTO.getBusinessName());
        if (updateDTO.getDistrict() != null) user.setDistrict(updateDTO.getDistrict());
        if (updateDTO.getZipcode() != null) user.setZipcode(updateDTO.getZipcode());
        if (updateDTO.getAvatarUrl() != null) user.setAvatarUrl(updateDTO.getAvatarUrl());

        return userRepository.save(user);
    }

    public boolean checkEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}