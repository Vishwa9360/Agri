package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.exception.InvalidNameException;
import com.example.demo.exception.InvalidPhoneException;
import com.example.demo.model.AuthModel;
import com.example.demo.repo.AuthRepo;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthRepo authRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    private AuthModel validUser;

    @BeforeEach
    void setUp() {
        validUser = new AuthModel();
        validUser.setName("Ramesh Patel");
        validUser.setUsername("ramesh123");
        validUser.setEmail("ramesh@farm.com");
        validUser.setPhoneNumber("9822334455");
        validUser.setPassword("Password@123");
        validUser.setRole("FARMER");
    }

    @Test
    @DisplayName("Should successfully register user with valid data and BCrypt hash")
    void testRegisterSuccess() {
        when(authRepo.existsByEmail("ramesh@farm.com")).thenReturn(false);
        when(authRepo.existsByUsername("ramesh123")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("$2a$10$encryptedPasswordHashMock123");
        when(authRepo.save(any(AuthModel.class))).thenAnswer(i -> {
            AuthModel u = i.getArgument(0);
            u.setId(1);
            return u;
        });

        AuthModel saved = authService.register(validUser);

        assertNotNull(saved);
        assertEquals(1, saved.getId());
        assertEquals("Ramesh Patel", saved.getName());
        assertEquals("$2a$10$encryptedPasswordHashMock123", saved.getPassword());
        assertTrue(saved.getIsActive());
        verify(authRepo, times(1)).save(any(AuthModel.class));
    }

    @Test
    @DisplayName("Should throw InvalidNameException when name contains numbers")
    void testRegisterInvalidName() {
        validUser.setName("Ramesh123");

        assertThrows(InvalidNameException.class, () -> {
            authService.register(validUser);
        });
        verify(authRepo, never()).save(any(AuthModel.class));
    }

    @Test
    @DisplayName("Should throw InvalidPhoneException when phone is not 10 digits")
    void testRegisterInvalidPhone() {
        validUser.setPhoneNumber("98223");

        assertThrows(InvalidPhoneException.class, () -> {
            authService.register(validUser);
        });
        verify(authRepo, never()).save(any(AuthModel.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when email format is invalid")
    void testRegisterInvalidEmail() {
        validUser.setEmail("invalid-email-format");

        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(validUser);
        });
        verify(authRepo, never()).save(any(AuthModel.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when email is already registered")
    void testRegisterDuplicateEmail() {
        when(authRepo.existsByEmail("ramesh@farm.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(validUser);
        });
        assertEquals("This email is already registered", ex.getMessage());
        verify(authRepo, never()).save(any(AuthModel.class));
    }

    @Test
    @DisplayName("Should authenticate user when password matches")
    void testAuthenticateSuccess() {
        validUser.setId(1);
        validUser.setIsActive(true);
        when(authRepo.findByUsernameOrEmail("ramesh123")).thenReturn(Optional.of(validUser));
        when(passwordEncoder.matches("Password@123", validUser.getPassword())).thenReturn(true);
        when(authRepo.save(any(AuthModel.class))).thenReturn(validUser);

        AuthModel authenticated = authService.authenticateUser("ramesh123", "Password@123");

        assertNotNull(authenticated);
        assertEquals("ramesh123", authenticated.getUsername());
        assertNotNull(authenticated.getLastLogin());
    }

    @Test
    @DisplayName("Should return null when password does not match")
    void testAuthenticateWrongPassword() {
        when(authRepo.findByUsernameOrEmail("ramesh123")).thenReturn(Optional.of(validUser));
        when(passwordEncoder.matches("WrongPassword", validUser.getPassword())).thenReturn(false);

        AuthModel result = authService.authenticateUser("ramesh123", "WrongPassword");

        assertNull(result);
    }
}
