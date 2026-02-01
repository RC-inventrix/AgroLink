package com.agrolink.apigateway.config; // Adjust package name to match your Gateway

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // 1. Allow your Frontend URL specifically
        corsConfig.setAllowedOrigins(Collections.singletonList("http://localhost:3000"));

        // 2. Allow all standard HTTP methods
        corsConfig.setMaxAge(3600L); // Cache this config for 1 hour
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // 3. Allow all headers (Authorization, Content-Type, etc.)
        corsConfig.addAllowedHeader("*");

        // 4. Allow Credentials (Cookies/Tokens)
        corsConfig.setAllowCredentials(true);

        // 5. Apply this config to ALL routes handled by the Gateway
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}