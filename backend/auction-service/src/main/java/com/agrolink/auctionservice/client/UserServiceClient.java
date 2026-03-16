/* fileName: auctionservice/client/UserServiceClient.java */
package com.agrolink.auctionservice.client;

import com.agrolink.auctionservice.dto.UserResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class UserServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${identity.service.url:http://identityAndUser-service}")
    private String identityServiceUrl;

    public UserResponseDto getUserById(Long userId) {
        String url = identityServiceUrl + "/auth/user/" + userId;
        try {
            HttpHeaders headers = new HttpHeaders();
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && !authHeader.isEmpty()) {
                    headers.set("Authorization", authHeader);
                    log.info("Successfully extracted Authorization header to relay to Identity Service.");
                } else {
                    log.warn("WARNING: Authorization header is missing from the incoming request. Identity verification will fail.");
                }
            } else {
                log.warn("WARNING: RequestContextHolder is null. Cannot extract headers.");
            }

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<UserResponseDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    UserResponseDto.class
            );

            return response.getBody();

        } catch (Exception e) {
            log.error("Failed to call Identity Service at {}. Exception: {}", url, e.getMessage());
            return null;
        }
    }
}