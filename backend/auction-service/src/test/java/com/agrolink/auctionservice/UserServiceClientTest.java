/* fileName: UserServiceClientTest.java */
package com.agrolink.auctionservice.client;

import com.agrolink.auctionservice.dto.UserResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
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
    }

    @Test
    void getUserById_shouldReturnUserResponseDto_whenCallIsSuccessful() {
        Long userId = 1L;
        String expectedUrl = MOCK_IDENTITY_URL + "/auth/user/" + userId;

        UserResponseDto mockResponse = new UserResponseDto();
        mockResponse.setId(userId);
        mockResponse.setEmail("farmer@test.com");
        mockResponse.setFullname("Test Farmer");

        when(restTemplate.getForObject(eq(expectedUrl), eq(UserResponseDto.class)))
                .thenReturn(mockResponse);

        UserResponseDto result = userServiceClient.getUserById(userId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(userId);
        assertThat(result.getEmail()).isEqualTo("farmer@test.com");
    }

    @Test
    void getUserById_shouldReturnNull_whenCallFails() {
        Long userId = 99L;
        String expectedUrl = MOCK_IDENTITY_URL + "/auth/user/" + userId;

        // Simulate the Identity Service being down or throwing a 404
        when(restTemplate.getForObject(eq(expectedUrl), eq(UserResponseDto.class)))
                .thenThrow(new RestClientException("Service Unavailable"));

        UserResponseDto result = userServiceClient.getUserById(userId);

        // Our client is designed to catch the exception and return null
        assertThat(result).isNull();
    }
}