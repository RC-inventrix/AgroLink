/* fileName: auctionservice/client/UserServiceClient.java */
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

    // --- CHANGED: Now points to the Identity Service via Eureka ---
    @Value("${identity.service.url:http://identityAndUser-service}")
    private String identityServiceUrl;

    public UserResponseDto getUserById(Long userId) {
        // --- CHANGED: Targets the AuthController endpoint in Identity Service ---
        String url = identityServiceUrl + "/auth/user/" + userId;
        try {
            log.info("Calling Identity Service: {}", url);
            return restTemplate.getForObject(url, UserResponseDto.class);
        } catch (Exception e) {
            log.error("Failed to call Identity Service at {}: {}", url, e.getMessage());
            return null;
        }
    }
}