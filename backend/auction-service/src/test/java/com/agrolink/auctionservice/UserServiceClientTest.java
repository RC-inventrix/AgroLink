/* fileName: UserServiceClientTest.java */
package com.agrolink.auctionservice;

import com.agrolink.auctionservice.client.UserServiceClient;
import com.agrolink.auctionservice.dto.UserResponseDto;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceClientTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private UserServiceClient userServiceClient;

    private final String MOCK_IDENTITY_URL = "http://identityAndUser-service";

    @BeforeEach
    void setUp() {
        // Inject the @Value property manually for the unit test
        ReflectionTestUtils.setField(userServiceClient, "identityServiceUrl", MOCK_IDENTITY_URL);

        // --- NEW: Simulate an incoming HTTP request with a JWT token ---
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer mock-jwt-token-12345");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @AfterEach
    void tearDown() {
        // Clean up the context holder to avoid interfering with other tests
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void getUserById_shouldReturnUserResponseDto_whenCallIsSuccessful() {
        Long userId = 1L;
        String expectedUrl = MOCK_IDENTITY_URL + "/auth/user/" + userId;

        UserResponseDto mockResponse = new UserResponseDto();
        mockResponse.setId(userId);
        mockResponse.setEmail("farmer@test.com");
        mockResponse.setFullname("Test Farmer");

        // --- CHANGED: Mock restTemplate.exchange() instead of getForObject() ---
        when(restTemplate.exchange(
                eq(expectedUrl),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserResponseDto.class)
        )).thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        UserResponseDto result = userServiceClient.getUserById(userId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(userId);
        assertThat(result.getEmail()).isEqualTo("farmer@test.com");
    }

    @Test
    void getUserById_shouldReturnNull_whenCallFails() {
        Long userId = 99L;
        String expectedUrl = MOCK_IDENTITY_URL + "/auth/user/" + userId;

        // Simulate the Identity Service being down or throwing an error
        when(restTemplate.exchange(
                eq(expectedUrl),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserResponseDto.class)
        )).thenThrow(new RestClientException("Service Unavailable"));

        UserResponseDto result = userServiceClient.getUserById(userId);

        // Verify it gracefully handles the exception and returns null
        assertThat(result).isNull();
    }
}