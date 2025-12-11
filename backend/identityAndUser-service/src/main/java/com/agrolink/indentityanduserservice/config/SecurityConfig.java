package com.agrolink.indentityanduserservice.config;

import com.agrolink.indentityanduserservice.services.CustomUserDetailsService;
// 1. FIXED: Added missing Lombok import
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // This annotation generates the constructor for us automatically
public class SecurityConfig {

    // 2. FIXED: Removed duplicate 'userDetailsService'. We only need this one.
    private final CustomUserDetailsService customUserDetailsService;

    // 3. FIXED: Ensure JwtAuthenticationFilter is imported if it's in a different package!
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // 4. FIXED: Removed the manual constructor.
    // The @RequiredArgsConstructor annotation creates it for us, ensuring all final fields are initialized.

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }



    @Bean
    // CHANGE 2: Add 'PasswordEncoder passwordEncoder' as a parameter here.
    // Spring will automatically inject the bean from SecurityConfigAdmin.
    public AuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(customUserDetailsService);

        // Use the injected parameter
        authProvider.setPasswordEncoder(passwordEncoder);

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}