package com.example.demo.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.demo.model.AuthModel;

public class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(
                jwtService,
                "secretKey",
                "SmartFarmingProjectSecretKeyForJwtAuthentication2026With256BitsMinimum"
        );
        jwtService.init();
    }

    @Test
    @DisplayName("Should generate valid JWT token containing user claims and role")
    void testGenerateAndValidateToken() {
        AuthModel user = new AuthModel();
        user.setId(42);
        user.setUsername("farmer_test");
        user.setEmail("farmer@test.com");
        user.setRole("FARMER");

        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3); // Valid JWT structure (header.payload.signature)

        // Verify claims extraction
        assertTrue(jwtService.validateToken(token));
        assertEquals("farmer_test", jwtService.extractUsername(token));
        assertEquals(42, jwtService.extractUserId(token));
        assertEquals("FARMER", jwtService.extractRole(token));
    }

    @Test
    @DisplayName("Should return false when validating an invalid or tampered token")
    void testInvalidTokenValidation() {
        assertFalse(jwtService.validateToken("invalid.tampered.token"));
    }
}
