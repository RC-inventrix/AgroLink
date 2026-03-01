package com.agrolink.auctionservice.dto;

import lombok.Data;

// A simple DTO to map the response from OrderPaymentService
@Data
public class UserResponseDto {
    private Long id;
    private String email;
    private String fullname;
    // You don't need address/lat/long here if you don't use them for validation
}