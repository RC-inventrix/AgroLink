package com.agrolink.indentityanduserservice;

import com.agrolink.indentityanduserservice.dto.RegisterRequest;
import com.agrolink.indentityanduserservice.model.Role;
import com.agrolink.indentityanduserservice.model.User;
import com.agrolink.indentityanduserservice.repository.UserRepository;
import com.agrolink.indentityanduserservice.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new RegisterRequest();
        validRequest.setFullname("John Farmer");
        validRequest.setEmail("john@farm.com");
        validRequest.setPhone("0771234567");
        validRequest.setPassword("securePass123");
        validRequest.setRole("Farmer");
        validRequest.setBusinessName("Green Farm");
        validRequest.setStreetAddress("123 Farm Lane");
        validRequest.setDistrict("Colombo");
        validRequest.setZipcode("10100");
    }

    @Test
    void saveUser_shouldRegisterNewUserSuccessfully() {
        when(userRepository.findByEmail("john@farm.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        String result = authService.saveUser(validRequest);

        assertThat(result).isEqualTo("User registered successfully");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void saveUser_shouldThrowWhenEmailAlreadyExists() {
        when(userRepository.findByEmail("john@farm.com")).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> authService.saveUser(validRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void saveUser_shouldThrowForInvalidRole() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        validRequest.setRole("INVALID_ROLE");

        assertThatThrownBy(() -> authService.saveUser(validRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid Role");
    }

    @Test
    void findById_shouldReturnUserWhenExists() {
        User user = new User();
        user.setId(1L);
        user.setEmail("john@farm.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = authService.findById(1L);

        assertThat(result.getEmail()).isEqualTo("john@farm.com");
    }

    @Test
    void findById_shouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.findById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void checkEmailExists_shouldReturnTrueWhenEmailExists() {
        when(userRepository.findByEmail("john@farm.com")).thenReturn(Optional.of(new User()));
        assertThat(authService.checkEmailExists("john@farm.com")).isTrue();
    }

    @Test
    void checkEmailExists_shouldReturnFalseWhenEmailDoesNotExist() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());
        assertThat(authService.checkEmailExists("nobody@example.com")).isFalse();
    }

    @Test
    void getActiveFarmerCount_shouldDelegateToRepository() {
        when(userRepository.countByRole(Role.Farmer)).thenReturn(5L);
        assertThat(authService.getActiveFarmerCount()).isEqualTo(5L);
    }

    @Test
    void getActiveBuyerCount_shouldDelegateToRepository() {
        when(userRepository.countByRole(Role.Buyer)).thenReturn(3L);
        assertThat(authService.getActiveBuyerCount()).isEqualTo(3L);
    }
}
