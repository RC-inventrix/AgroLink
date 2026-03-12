package com.agrolink.indentityanduserservice;

import com.agrolink.indentityanduserservice.services.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    private static final String TEST_SECRET =
            "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
    }

    @Test
    void generateToken_shouldReturnNonNullToken() {
        String token = jwtService.generateToken("test@example.com", "Farmer", 1L);
        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void generateToken_shouldProduceDifferentTokensForDifferentUsers() {
        String token1 = jwtService.generateToken("user1@example.com", "Farmer", 1L);
        String token2 = jwtService.generateToken("user2@example.com", "Buyer", 2L);
        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    void generateToken_shouldContainThreeJwtParts() {
        String token = jwtService.generateToken("test@example.com", "Admin", 99L);
        // A valid JWT has exactly 3 parts separated by dots
        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
    }
}
