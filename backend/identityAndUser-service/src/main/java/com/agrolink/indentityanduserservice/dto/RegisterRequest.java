package com.agrolink.indentityanduserservice.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    // --- STEP 1: Common Fields ---
    @NotBlank(message = "Full name is required")
    private String fullname;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Note: "Repeat Password" is handled purely on the Frontend for validation.
    // The backend only needs the final confirmed password.

    @NotBlank(message = "Role is required")
    private String role; // "Farmer" or "Buyer"

    // --- STEP 2: Farmer Specific Fields (Optional in DTO, Validated in Logic) ---
    private String businessName;
    private String streetAddress; // Mapped to 'address' in DB
    private String district;
    private String zipcode;

    // This handles the "Business Registration OR NIC" input
    private String businessRegOrNic;
}