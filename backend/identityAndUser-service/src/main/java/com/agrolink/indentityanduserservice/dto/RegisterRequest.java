/* fileName: indentityanduserservice/dto/RegisterRequest.java */
package com.agrolink.indentityanduserservice.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
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

    @NotBlank(message = "Role is required")
    private String role; // "Farmer" or "Buyer"

    // --- STEP 2: Farmer Specific Fields ---
    private String businessName;
    private String streetAddress; // Mapped to 'address' in DB
    private String district;
    private String zipcode;

    // New Location Fields
    private String province;
    private String city;
    private Double latitude;
    private Double longitude;

    // This handles the "Business Registration OR NIC" input
    private String businessRegOrNic;
}