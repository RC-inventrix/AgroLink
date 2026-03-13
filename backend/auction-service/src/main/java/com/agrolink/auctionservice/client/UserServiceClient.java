package com.agrolink.auctionservice.client;

import com.agrolink.auctionservice.dto.UserResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class UserServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${order.service.url:http://orderpayment-service}")
    private String orderServiceUrl;

    public UserResponseDto getUserById(Long userId) {
        String url = orderServiceUrl + "/api/users/" + userId;
        try {
            log.info("Calling Order Service: {}", url);
            return restTemplate.getForObject(url, UserResponseDto.class);
        } catch (Exception e) {
            log.error("Failed to call Order Service at {}: {}", url, e.getMessage());
            return null;
        }
    }
}