package com.me.agrochat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply to all endpoints including /api/chat/**
                .allowedOrigins("http://localhost:3000") // Your React app's URL
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // CRITICAL: Must be true to allow HttpOnly cookies to be sent
                .allowCredentials(true);
    }
}
