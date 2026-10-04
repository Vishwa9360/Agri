package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.exception.InvalidNameException;
import com.example.demo.exception.InvalidPhoneException;
import com.example.demo.model.AuthModel;
import com.example.demo.repo.AuthRepo;

@Service
public class AuthService {

    @Autowired
    private AuthRepo repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired(required = false)
    private com.example.demo.repo.PasswordHistoryRepo passwordHistoryRepo;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,}$");

    public AuthModel register(AuthModel auth) {
        // Name Validation per SRS Appendix C
        if (auth.getName() == null || auth.getName().trim().isEmpty()) {
            throw new InvalidNameException("Name is required");
        }
        String cleanName = auth.getName().trim();
        if (!cleanName.matches("^[a-zA-Z\\s]{2,100}$")) {
            throw new InvalidNameException("Name must not contain numbers or special characters");
        }
        auth.setName(cleanName);

        // Phone Number Validation per SRS Appendix C
        if (auth.getPhoneNumber() != null && !auth.getPhoneNumber().trim().isEmpty()) {
            String cleanPhone = auth.getPhoneNumber().trim();
            if (!cleanPhone.matches("^[0-9]{10}$")) {
                throw new InvalidPhoneException("Phone Number must be exactly 10 digits long");
            }
            auth.setPhoneNumber(cleanPhone);
        }

        // Email Validation per SRS Appendix C
        if (auth.getEmail() == null || auth.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Please enter a valid email address");
        }
        String cleanEmail = auth.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(cleanEmail).matches()) {
            throw new IllegalArgumentException("Please enter a valid email address");
        }
        if (repo.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("This email is already registered");
        }
        auth.setEmail(cleanEmail);

        // Username Setup & Validation
        if (auth.getUsername() == null || auth.getUsername().trim().isEmpty()) {
            auth.setUsername(cleanEmail);
        } else {
            String cleanUsername = auth.getUsername().trim();
            if (repo.existsByUsername(cleanUsername)) {
                throw new IllegalArgumentException("This username is already taken");
            }
            auth.setUsername(cleanUsername);
        }

        // Password Security Validation per SRS Section 4 & Appendix C
        if (auth.getPassword() == null || auth.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password must meet security requirements");
        }
        if (!PASSWORD_PATTERN.matcher(auth.getPassword()).matches()) {
            throw new IllegalArgumentException("Password must meet security requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)");
        }

        // Encrypt password using BCrypt
        auth.setPassword(passwordEncoder.encode(auth.getPassword()));

        // Role Normalization & Supervisor Approval per SRS Section 4
        if (auth.getRole() == null || auth.getRole().trim().isEmpty()) {
            auth.setRole("FARMER");
            auth.setApprovalStatus("APPROVED");
        } else {
            String roleUpper = auth.getRole().trim().toUpperCase();
            auth.setRole(roleUpper);
            if (roleUpper.equals("FIELD_OFFICER") || roleUpper.equals("AGRICULTURAL_OFFICER") || roleUpper.equals("EXTENSION_OFFICER")) {
                auth.setApprovalStatus("PENDING_APPROVAL");
            } else {
                auth.setApprovalStatus("APPROVED");
            }
        }

        auth.setId(null);
        auth.setCreatedDate(LocalDateTime.now());
        auth.setIsActive(true);
        auth.setFailedLoginAttempts(0);

        AuthModel saved = repo.save(auth);
        try {
            auditLogService.log(saved.getId(), "REGISTER", "USER", String.valueOf(saved.getId()),
                    "New user " + saved.getUsername() + " registered with role " + saved.getRole() + " (Status: " + saved.getApprovalStatus() + ")");
        } catch (Exception ignored) {}

        if (passwordHistoryRepo != null) {
            try {
                passwordHistoryRepo.save(new com.example.demo.model.PasswordHistory(saved.getId(), saved.getPassword()));
            } catch (Exception ignored) {}
        }

        return saved;
    }

    public AuthModel authenticateUser(String identifier, String rawPassword) {
        if (identifier == null || rawPassword == null) {
            return null;
        }

        AuthModel user = repo.findByUsernameOrEmail(identifier.trim())
                .orElse(null);

        if (user == null) {
            return null;
        }

        // Check Progressive Lockout per SRS Section 4
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException("Account is temporarily locked due to multiple failed login attempts. Please try again after: " + user.getLockoutUntil().toLocalTime());
        }

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            int attempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 15) {
                user.setLockoutUntil(LocalDateTime.now().plusHours(24));
                repo.save(user);
                try {
                    auditLogService.log(user.getId(), "SECURITY_ALERT", "USER", String.valueOf(user.getId()),
                            "Account locked for 24 hours due to 15 consecutive failed login attempts");
                } catch (Exception ignored) {}
                throw new IllegalStateException("Account locked for 24 hours due to 15 consecutive failed login attempts.");
            } else if (attempts >= 10) {
                user.setLockoutUntil(LocalDateTime.now().plusMinutes(30));
                repo.save(user);
                try {
                    auditLogService.log(user.getId(), "SECURITY_ALERT", "USER", String.valueOf(user.getId()),
                            "Account locked for 30 minutes due to 10 consecutive failed login attempts");
                } catch (Exception ignored) {}
                throw new IllegalStateException("Account locked for 30 minutes due to 10 consecutive failed login attempts.");
            } else if (attempts >= 5) {
                user.setLockoutUntil(LocalDateTime.now().plusMinutes(15));
                repo.save(user);
                try {
                    auditLogService.log(user.getId(), "SECURITY_ALERT", "USER", String.valueOf(user.getId()),
                            "Account locked for 15 minutes due to 5 consecutive failed login attempts");
                } catch (Exception ignored) {}
                throw new IllegalStateException("Account locked for 15 minutes due to 5 consecutive failed login attempts.");
            }
            repo.save(user);
            return null;
        }

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new IllegalStateException("Account is deactivated. Please contact administrator.");
        }

        if ("PENDING_APPROVAL".equalsIgnoreCase(user.getApprovalStatus())) {
            throw new IllegalStateException("Account is pending supervisor approval for operational role: " + user.getRole());
        }

        // Reset failed login counter and clear lockout on success
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        user.setLastLogin(LocalDateTime.now());
        repo.save(user);

        try {
            auditLogService.log(user.getId(), "LOGIN", "USER", String.valueOf(user.getId()),
                    "User " + user.getUsername() + " logged in successfully");
        } catch (Exception ignored) {}

        return user;
    }

    public java.util.Map<String, Object> generateForgotPasswordOtp(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("Email or username is required");
        }

        AuthModel user = repo.findByUsernameOrEmail(identifier.trim())
                .orElseThrow(() -> new IllegalArgumentException("No registered account found with identifier: " + identifier));

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        repo.save(user);

        try {
            auditLogService.log(user.getId(), "PASSWORD_RECOVERY_OTP", "USER", String.valueOf(user.getId()),
                    "Generated password recovery OTP for " + user.getEmail());
        } catch (Exception ignored) {}

        java.util.Map<String, Object> resp = new java.util.LinkedHashMap<>();
        resp.put("message", "Verification OTP dispatched successfully (Valid for 10 minutes)");
        resp.put("email", user.getEmail());
        resp.put("devOtpStub", otp); // For testing / development evaluation per SRS guidelines
        return resp;
    }

    public java.util.Map<String, Object> resetPasswordWithOtp(String identifier, String otp, String newPassword) {
        if (identifier == null || otp == null || newPassword == null) {
            throw new IllegalArgumentException("Identifier, OTP, and new password are required");
        }

        AuthModel user = repo.findByUsernameOrEmail(identifier.trim())
                .orElseThrow(() -> new IllegalArgumentException("No registered account found with identifier: " + identifier));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp.trim())) {
            throw new IllegalArgumentException("Invalid verification OTP");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification OTP has expired. Please request a new one.");
        }

        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            throw new IllegalArgumentException("Password must meet security requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)");
        }

        // Enforce password history (cannot reuse any of the last 3 passwords)
        if (passwordHistoryRepo != null) {
            java.util.List<com.example.demo.model.PasswordHistory> history = passwordHistoryRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
            for (int i = 0; i < Math.min(3, history.size()); i++) {
                if (passwordEncoder.matches(newPassword, history.get(i).getPasswordHash())) {
                    throw new IllegalArgumentException("Cannot reuse any of your last 3 passwords");
                }
            }
        }

        String encodedNewPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedNewPassword);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        repo.save(user);

        if (passwordHistoryRepo != null) {
            try {
                passwordHistoryRepo.save(new com.example.demo.model.PasswordHistory(user.getId(), encodedNewPassword));
            } catch (Exception ignored) {}
        }

        try {
            auditLogService.log(user.getId(), "PASSWORD_RESET_SUCCESS", "USER", String.valueOf(user.getId()),
                    "Password successfully reset via OTP for " + user.getUsername());
        } catch (Exception ignored) {}

        java.util.Map<String, Object> resp = new java.util.LinkedHashMap<>();
        resp.put("message", "Password reset successfully. You can now log in with your new password.");
        return resp;
    }

    public List<AuthModel> getAll() {
        return repo.findAll();
    }

    public AuthModel getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public AuthModel update(Integer id, AuthModel auth) {
        AuthModel data = repo.findById(id).orElse(null);

        if (data != null) {
            if (auth.getName() != null) data.setName(auth.getName().trim());
            if (auth.getPhoneNumber() != null) data.setPhoneNumber(auth.getPhoneNumber().trim());
            if (auth.getRole() != null) data.setRole(auth.getRole().trim().toUpperCase());
            if (auth.getIsActive() != null) data.setIsActive(auth.getIsActive());

            // Only change password if a new valid password is provided
            if (auth.getPassword() != null && !auth.getPassword().isEmpty()) {
                if (PASSWORD_PATTERN.matcher(auth.getPassword()).matches()) {
                    data.setPassword(passwordEncoder.encode(auth.getPassword()));
                }
            }

            return repo.save(data);
        }

        return null;
    }

    public java.util.Map<String, Object> generateTwoFactorOtp(Integer userId) {
        AuthModel user = repo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        repo.save(user);
        return java.util.Map.of(
                "message", "2FA OTP generated successfully",
                "userId", userId,
                "devNotice", "For testing/evaluation: 2FA OTP is " + otp
        );
    }

    public boolean verifyTwoFactorOtp(Integer userId, String otp) {
        if (userId == null || otp == null) return false;
        AuthModel user = repo.findById(userId).orElse(null);
        if (user == null) return false;
        if (user.getOtpCode() == null || user.getOtpExpiry() == null) return false;
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) return false;
        boolean matches = user.getOtpCode().trim().equals(otp.trim());
        if (matches) {
            user.setOtpCode(null);
            user.setOtpExpiry(null);
            repo.save(user);
        }
        return matches;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Authentication Record Deleted Successfully";
    }
}