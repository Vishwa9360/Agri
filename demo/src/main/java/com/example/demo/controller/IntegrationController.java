package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.DeadLetterMessage;
import com.example.demo.service.IntegrationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "External Integrations & DLQ", description = "Monitoring, SLA metrics, and MySQL-backed persistent Dead-Letter Queue (DLQ) operations (SRS Section 19)")
@RestController
@RequestMapping("/api/integrations")
public class IntegrationController {

    @Autowired
    private IntegrationService service;

    @Operation(summary = "Get all Dead-Letter Queue (DLQ) messages")
    @GetMapping("/dlq")
    public List<DeadLetterMessage> getAllDlq() {
        return service.getAllDlqMessages();
    }

    @Operation(summary = "Get pending Dead-Letter Queue messages")
    @GetMapping("/dlq/pending")
    public List<DeadLetterMessage> getPendingDlq() {
        return service.getPendingDlqMessages();
    }

    @Operation(summary = "Retry a specific DLQ message")
    @PostMapping("/dlq/{id}/retry")
    public ResponseEntity<?> retryDlq(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.retryMessage(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Mark a DLQ message as resolved")
    @PutMapping("/dlq/{id}/resolve")
    public ResponseEntity<?> resolveDlq(@PathVariable Integer id) {
        DeadLetterMessage resolved = service.resolveMessage(id);
        if (resolved != null) {
            return ResponseEntity.ok(resolved);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Get integration health, SLA metrics and failure stats")
    @GetMapping("/health")
    public Map<String, Object> getHealth() {
        return service.getIntegrationHealth();
    }
}
