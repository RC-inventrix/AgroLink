/* fileName: UserControllerTest.java */
package com.agrolink.indentityanduserservice;

import com.agrolink.indentityanduserservice.controller.UserController;
import com.agrolink.indentityanduserservice.model.User;
import com.agrolink.indentityanduserservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserController userController;

    @Test
    void getUserAddress_shouldReturnAddressMapWhenUserExists() {
        User user = new User();
        user.setId(1L);
        user.setAddress("123 Farm Road");
        user.setCity("Kandy");
        user.setDistrict("Kandy");
        user.setLatitude(7.2906);
        user.setLongitude(80.6337);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        ResponseEntity<?> response = userController.getUserAddress(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();

        assertThat(body).isNotNull();
        assertThat(body.get("address")).isEqualTo("123 Farm Road");
        assertThat(body.get("city")).isEqualTo("Kandy");
        assertThat(body.get("district")).isEqualTo("Kandy");
        assertThat(body.get("latitude")).isEqualTo(7.2906);
        assertThat(body.get("longitude")).isEqualTo(80.6337);
    }

    @Test
    void getUserAddress_shouldReturnNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userController.getUserAddress(99L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}