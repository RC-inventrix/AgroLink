/* fileName: indentityanduserservice/controller/UserController.java */
package com.agrolink.indentityanduserservice.controller;

import com.agrolink.indentityanduserservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}/address")
    public ResponseEntity<?> getUserAddress(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    // Map only the necessary location data to prevent exposing password hashes
                    Map<String, Object> response = new HashMap<>();
                    response.put("address", user.getAddress());
                    response.put("city", user.getCity());
                    response.put("district", user.getDistrict());
                    response.put("latitude", user.getLatitude());
                    response.put("longitude", user.getLongitude());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}