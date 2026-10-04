package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.WorkflowTask;
import com.example.demo.service.WorkflowService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Workflow & Approvals", description = "Configurable multi-stage workflows, multi-step approvals, SLA tracking, and chronological history (SRS Section 7)")
@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {

    @Autowired
    private WorkflowService service;

    @Operation(summary = "Get all workflow tasks")
    @GetMapping("/tasks")
    public List<WorkflowTask> getAll() {
        return service.getAll();
    }

    @Operation(summary = "Get workflow task by ID")
    @GetMapping("/tasks/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        WorkflowTask task = service.getById(id);
        if (task != null) return ResponseEntity.ok(task);
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Get tasks assigned to a specific role")
    @GetMapping("/tasks/role/{role}")
    public List<WorkflowTask> getByRole(@PathVariable String role) {
        return service.getByRole(role);
    }

    @Operation(summary = "Initiate a new workflow task")
    @PostMapping("/create")
    public WorkflowTask create(@RequestBody WorkflowTask task) {
        return service.createTask(task);
    }

    @Operation(summary = "Transition a workflow task to next stage or decision")
    @PutMapping("/tasks/{id}/transition")
    public ResponseEntity<?> transition(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        try {
            String nextStage = payload.getOrDefault("nextStage", "VERIFICATION");
            String status = payload.getOrDefault("status", "APPROVED");
            String actor = payload.getOrDefault("actor", "OFFICER");
            String comment = payload.getOrDefault("comment", "Stage approved");
            return ResponseEntity.ok(service.transitionStage(id, nextStage, status, actor, comment));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @Operation(summary = "Get workflow SLA completion analytics and cycle time metrics")
    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        return service.getWorkflowAnalytics();
    }
}
