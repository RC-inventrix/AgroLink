package com.agrolink.auctionservice.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for REST clients.
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Create a LoadBalanced RestTemplate for service-to-service communication.
     * The @LoadBalanced annotation enables client-side load balancing with Eureka.
     */
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
