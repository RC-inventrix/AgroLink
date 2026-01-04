package com.agrolink.orderpaymentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Disable CSRF (It blocks POST requests)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. DISABLE explicit CORS configuration here.
                // The API Gateway handles CORS. We don't want to duplicate headers.
                .cors(AbstractHttpConfigurer::disable)

                // 3. Allow all requests (Gateway handles auth routing)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}