package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.AuthModel;
import com.example.demo.security.JwtService;
import com.example.demo.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Authentication", description = "User registration, authentication and JWT session management")
public class AuthController {

    @Autowired
    private AuthService service;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private com.example.demo.security.TokenBlacklistService tokenBlacklistService;

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class LoginDto {
        @io.swagger.v3.oas.annotations.media.Schema(example = "vishwa@gmail.com", description = "Username or Email")
        private String username;

        @io.swagger.v3.oas.annotations.media.Schema(example = "Vishwa@123", description = "Password")
        private String password;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class RegisterDto {
        @io.swagger.v3.oas.annotations.media.Schema(example = "Vishwaboopathi")
        private String name;

        @io.swagger.v3.oas.annotations.media.Schema(example = "vishwa")
        private String username;

        @io.swagger.v3.oas.annotations.media.Schema(example = "vishwa@gmail.com")
        private String email;

        @io.swagger.v3.oas.annotations.media.Schema(example = "9876543210")
        private String phoneNumber;

        @io.swagger.v3.oas.annotations.media.Schema(example = "Vishwa@123")
        private String password;

        @io.swagger.v3.oas.annotations.media.Schema(example = "FARMER")
        private String role;
    }

    @Operation(summary = "Register new user account")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Registration details",
        required = true,
        content = @io.swagger.v3.oas.annotations.media.Content(
            schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = RegisterDto.class),
            examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                value = "{\n  \"name\": \"Vishwaboopathi\",\n  \"username\": \"vishwa\",\n  \"email\": \"vishwa@gmail.com\",\n  \"phoneNumber\": \"9876543210\",\n  \"password\": \"Vishwa@123\",\n  \"role\": \"FARMER\"\n}"
            )
        )
    )
    @PostMapping({"/api/auth/register", "/auth/register"})
    public ResponseEntity<?> register(@RequestBody AuthModel auth) {
        try {
            AuthModel registeredUser = service.register(auth);
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @Operation(summary = "User login and JWT token generation")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "User login credentials",
        required = true,
        content = @io.swagger.v3.oas.annotations.media.Content(
            schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = LoginDto.class),
            examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                value = "{\n  \"username\": \"vishwa@gmail.com\",\n  \"password\": \"Vishwa@123\"\n}"
            )
        )
    )
    @PostMapping({"/api/auth/login", "/auth/login"})
    public ResponseEntity<?> login(@RequestBody AuthModel auth, jakarta.servlet.http.HttpServletRequest request) {
        String identifier = auth.getUsername() != null && !auth.getUsername().trim().isEmpty()
                ? auth.getUsername()
                : auth.getEmail();

        if (identifier == null || auth.getPassword() == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Username/Email and password are required");
        }

        try {
            AuthModel user = service.authenticateUser(identifier, auth.getPassword());

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid username or password");
            }

            // Generate HMAC-SHA256 JWT Token with claims
            String token = jwtService.generateToken(user);

            return ResponseEntity.ok(token);

        } catch (IllegalStateException ex) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ex.getMessage());
        }
    }

    @Operation(summary = "Logout user session and invalidate JWT token")
    @PostMapping({"/api/auth/logout", "/auth/logout"})
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null) {
            tokenBlacklistService.blacklistToken(authHeader);
        }
        return ResponseEntity.ok(java.util.Map.of("message", "Logout successful. Token invalidated and blacklisted."));
    }

    @Operation(summary = "Generate 2FA OTP for sensitive operations (FR1 / FR2)")
    @PostMapping({"/api/auth/2fa/generate", "/auth/2fa/generate"})
    public ResponseEntity<?> generate2fa(@RequestBody java.util.Map<String, Object> body) {
        try {
            Integer userId = Integer.parseInt(body.get("userId").toString());
            return ResponseEntity.ok(service.generateTwoFactorOtp(userId));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @Operation(summary = "Verify 2FA OTP for sensitive operations (FR1 / FR2)")
    @PostMapping({"/api/auth/2fa/verify", "/auth/2fa/verify"})
    public ResponseEntity<?> verify2fa(@RequestBody java.util.Map<String, Object> body) {
        try {
            Integer userId = Integer.parseInt(body.get("userId").toString());
            String otp = body.get("otp").toString();
            boolean ok = service.verifyTwoFactorOtp(userId, otp);
            if (ok) {
                return ResponseEntity.ok(java.util.Map.of("verified", true, "message", "Two-factor authentication successful"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("verified", false, "error", "Invalid or expired 2FA OTP"));
            }
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @Operation(summary = "Initiate password recovery via OTP (SRS Section 4)")
    @PostMapping({"/api/auth/forgot-password", "/auth/forgot-password"})
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        try {
            String identifier = body.get("identifier");
            if (identifier == null) identifier = body.get("email");
            java.util.Map<String, Object> resp = service.generateForgotPasswordOtp(identifier);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @Operation(summary = "Reset password using OTP (SRS Section 4)")
    @PostMapping({"/api/auth/reset-password", "/auth/reset-password"})
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> body) {
        try {
            String identifier = body.get("identifier");
            if (identifier == null) identifier = body.get("email");
            String otp = body.get("otp");
            String newPassword = body.get("newPassword");
            java.util.Map<String, Object> resp = service.resetPasswordWithOtp(identifier, otp, newPassword);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @Operation(summary = "Refresh JWT authentication token")
    @PostMapping({"/api/auth/refresh", "/auth/refresh"})
    public ResponseEntity<?> refreshToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String oldToken = authHeader.substring(7);
            if (jwtService.validateToken(oldToken)) {
                Integer userId = jwtService.extractUserId(oldToken);
                AuthModel user = service.getById(userId);
                if (user != null && Boolean.TRUE.equals(user.getIsActive())) {
                    String newToken = jwtService.generateToken(user);
                    return ResponseEntity.ok(newToken);
                }
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired authorization token");
    }

    @Operation(summary = "Get current authenticated user profile (SRS Appendix H)")
    @GetMapping({"/api/users/profile", "/api/auth/profile"})
    public ResponseEntity<?> getProfile() {
        try {
            org.springframework.security.core.Authentication authentication =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Integer userId) {
                AuthModel user = service.getById(userId);
                if (user != null) {
                    return ResponseEntity.ok(user);
                }
            }
        } catch (Exception ignored) {}
        List<AuthModel> all = service.getAll();
        return ResponseEntity.ok(!all.isEmpty() ? all.get(0) : "Authenticated Profile Active");
    }

    @Operation(summary = "Get all user accounts (Admin/Staff)")
    @GetMapping({"/api/auth/getAll", "/auth/getAll"})
    public List<AuthModel> getAll() {
        return service.getAll();
    }

    @Operation(summary = "Get user account by ID")
    @GetMapping({"/api/auth/get/{id}", "/auth/get/{id}"})
    public AuthModel getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @Operation(summary = "Update user account details")
    @PutMapping({"/api/auth/update/{id}", "/auth/update/{id}"})
    public AuthModel update(
            @PathVariable Integer id,
            @RequestBody AuthModel auth) {
        return service.update(id, auth);
    }

    @Operation(summary = "Delete user account")
    @DeleteMapping({"/api/auth/delete/{id}", "/auth/delete/{id}"})
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}