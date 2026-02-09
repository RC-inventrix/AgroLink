package com.agrolink.indentityanduserservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data // This automatically creates getters, setters, toString, etc.
public class LoginRequestAdmin {

    @NotBlank(message = "username is required")
    private String username;

    @NotBlank(message = "password is required")
    private String password;

}