package com.agrolink.auctionservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the auction service.
 * 
 * Note: This microservice is only accessible through the API Gateway, which handles:
 * - CORS configuration
 * - Authentication/Authorization
 * - Rate limiting
 * 
 * CSRF protection is disabled because:
 * 1. This is a stateless REST API service
 * 2. All requests come through the API Gateway, not directly from browsers
 * 3. JWT tokens are used for authentication (not session-based)
 * 4. This follows the same pattern as all other services in the AgroLink architecture
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF disabled - service only accessible via API Gateway with JWT authentication
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
