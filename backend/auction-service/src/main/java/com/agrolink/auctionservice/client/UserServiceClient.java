package com.agrolink.auctionservice.client;

import com.agrolink.auctionservice.dto.UserResponseDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class UserServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    // DIRECT Connection to Order Service (Port 8075)
    private final String ORDER_SERVICE_URL = "http://localhost:8075/api/users/";

    public UserResponseDto getUserById(Long userId) {
        try {
            log.info("Calling Order Service: " + ORDER_SERVICE_URL + userId);
            return restTemplate.getForObject(ORDER_SERVICE_URL + userId, UserResponseDto.class);
        } catch (Exception e) {
            log.error("Failed to call Order Service at {}: {}", ORDER_SERVICE_URL + userId, e.getMessage());
            return null;
        }
    }
}