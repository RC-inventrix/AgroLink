package com.agrolink.auctionservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    // ❌ REMOVED @LoadBalanced so we can use direct http://localhost:8075 URLs
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}