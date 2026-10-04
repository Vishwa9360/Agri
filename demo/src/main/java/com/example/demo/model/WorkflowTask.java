package com.example.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "workflow_tasks")
public class WorkflowTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String workflowType; // FARM_REGISTRATION, DOCUMENT_VERIFICATION, DRONE_APPROVAL

    private String entityType; // FARM, DOCUMENT, DRONE_MISSION

    private Integer entityId;

    private String title;

    private String currentStage; // INITIATED, VERIFICATION, FIELD_INSPECTION, SIGN_OFF, COMPLETED, REJECTED

    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, ESCALATED

    private String assignedRole; // FIELD_OFFICER, AGRICULTURAL_OFFICER, EXTENSION_OFFICER, ADMIN

    private String assignedTo;

    private LocalDateTime slaDueDate;

    private Boolean isSlaBreached = false;

    private String comments;

    @Column(columnDefinition = "TEXT")
    private String historyJson;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}
