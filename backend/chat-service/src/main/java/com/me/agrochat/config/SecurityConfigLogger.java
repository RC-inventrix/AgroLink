package com.me.agrochat.config;


import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SecurityConfigLogger {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfigLogger.class);

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @PostConstruct
    public void logSecret() {
        // Logging only the first and last few characters for security
        if (secretKey != null && secretKey.length() > 10) {
            String masked = secretKey.substring(0, 4) + "****" + secretKey.substring(secretKey.length() - 4);
            logger.info("DEBUG: Resolved JWT Secret Key (Masked): [{}]", masked);
            logger.info("DEBUG: Key Length: {}", secretKey.length());
        } else {
            logger.error("CRITICAL: JWT Secret Key is MISSING or too short! Value: [{}]", secretKey);
        }
    }
}
