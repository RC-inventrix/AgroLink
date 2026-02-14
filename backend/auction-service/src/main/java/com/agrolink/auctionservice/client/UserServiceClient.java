package com.agrolink.auctionservice.client;

import com.agrolink.auctionservice.dto.UserResponseDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class UserServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    // This URL matches the one you provided in the prompt
    private final String USER_SERVICE_URL = "http://localhost:8080/api/users/";

    public UserResponseDto getUserById(Long userId) {
        try {
            return restTemplate.getForObject(USER_SERVICE_URL + userId, UserResponseDto.class);
        } catch (Exception e) {
            // Handle timeout or 404
            throw new RuntimeException("Could not verify user identity with OrderService");
        }
    }
}