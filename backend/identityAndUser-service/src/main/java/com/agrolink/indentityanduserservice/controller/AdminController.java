package com.agrolink.indentityanduserservice.controller;

import com.agrolink.indentityanduserservice.dto.LoginRequestAdmin;
import com.agrolink.indentityanduserservice.model.Admin;
import com.agrolink.indentityanduserservice.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestAdmin request){
        Admin admin = adminRepository.findByUsername(request.getUsername());

        if(admin == null){
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        if(!passwordEncoder.matches(request.getPassword(),admin.getPassword())){
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        return ResponseEntity.ok("Login successful");
    }

}
