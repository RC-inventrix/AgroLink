package com.agrolink.indentityanduserservice.config;

import com.agrolink.indentityanduserservice.services.AdminService;
import com.agrolink.indentityanduserservice.services.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/auth/register", "/auth/login", "/auth/count", "/auth/validate",
                                "/auth/count/farmers", "/auth/count/buyers" , "/auth/user/**" , "/auth/fullnames" ).permitAll()
                        // 1. Admin Controller එකට අදාළ endpoints
                        .requestMatchers("/api/admin/register", "/api/admin/login").permitAll()

                        // 2. Auth Controller එකට අදාළ endpoints (මෙතන තමයි /auth/count තියෙන්නේ)
                        .requestMatchers("/auth/register", "/auth/login", "/auth/count", "/auth/validate" , "/auth/me").permitAll()

                        // 3. H2 Console එකට අවසර දීම
                        .requestMatchers("/h2-console/**").permitAll()

                        // අනිත් හැම request එකකටම login වෙන්න ඕන
                        .anyRequest().authenticated()
                )
                // H2 Console එක හරියට වැඩ කරන්න නම් මේ කෑල්ල ඕන (Frames allow කරන්න)
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(CustomUserDetailsService customUserDetailsService) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}