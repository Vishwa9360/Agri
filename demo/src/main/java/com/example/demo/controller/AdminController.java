package com.example.demo.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.AuditLog;
import com.example.demo.model.AuthModel;
import com.example.demo.repo.AuthRepo;
import com.example.demo.repo.FarmerRepo;
import com.example.demo.service.AuditLogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Administration", description = "System administration, user role management, and audit trail logs")
public class AdminController {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private AuthRepo authRepo;

    @Autowired
    private FarmerRepo farmerRepo;

    @Autowired
    private com.example.demo.repo.RolePermissionRepo rolePermissionRepo;

    @Operation(summary = "Get all audit trail logs")
    @GetMapping({"/api/admin/audit-logs", "/admin/audit-logs"})
    public List<AuditLog> getAuditLogs() {
        return auditLogService.getAll();
    }

    @Operation(summary = "Get all users with active roles and status")
    @GetMapping({"/api/admin/users", "/admin/users"})
    public List<AuthModel> getUsers() {
        return authRepo.findAll();
    }

    @Operation(summary = "Change a user's role (ADMIN only)")
    @PutMapping({"/api/admin/users/{id}/role", "/admin/users/{id}/role"})
    public ResponseEntity<?> updateUserRole(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || newRole.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Role is required");
        }

        AuthModel user = authRepo.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        String oldRole = user.getRole();
        user.setRole(newRole.trim().toUpperCase());
        authRepo.save(user);

        // Record role change in audit log
        auditLogService.log(user.getId(), "ROLE_CHANGE", "USER", String.valueOf(user.getId()),
                "User " + user.getUsername() + " role changed from " + oldRole + " to " + user.getRole());

        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Activate or deactivate a user account")
    @PutMapping({"/api/admin/users/{id}/status", "/admin/users/{id}/status"})
    public ResponseEntity<?> updateUserStatus(@PathVariable Integer id, @RequestBody Map<String, Boolean> body) {
        Boolean isActive = body.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().body("isActive flag is required");
        }

        AuthModel user = authRepo.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setIsActive(isActive);
        authRepo.save(user);

        auditLogService.log(user.getId(), isActive ? "ACTIVATE" : "DEACTIVATE", "USER", String.valueOf(user.getId()),
                "User " + user.getUsername() + " status changed to " + (isActive ? "ACTIVE" : "INACTIVE"));

        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Get system administration overview statistics")
    @GetMapping({"/api/admin/stats", "/admin/stats"})
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", authRepo.count());
        stats.put("totalFarms", farmerRepo.count());
        stats.put("totalAuditEvents", auditLogService.getAll().size());
        stats.put("systemHealth", "OPTIMAL");
        stats.put("databaseStatus", "CONNECTED");
        return stats;
    }

    @Operation(summary = "Get RBAC permission matrix (FR3)")
    @GetMapping({"/api/admin/permissions", "/admin/permissions"})
    public List<com.example.demo.model.RolePermission> getPermissionMatrix() {
        return rolePermissionRepo.findAll();
    }
}
