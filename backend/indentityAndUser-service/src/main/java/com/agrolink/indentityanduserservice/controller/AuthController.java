package com.agrolink.indentityanduserservice.controller;

import com.agrolink.indentityanduserservice.model.User;
import com.agrolink.indentityanduserservice.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public String registerUser(@RequestBody User user){
        return service.saveUser(user);
    }
}
