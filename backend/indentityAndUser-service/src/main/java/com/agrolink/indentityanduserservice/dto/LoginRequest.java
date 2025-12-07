package com.agrolink.indentityanduserservice.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username/Email is required")
    private String identifier; // Can be username or email

    @NotBlank(message = "Password is required")
    private String password;
}
