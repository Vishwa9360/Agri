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
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer userId;

    private String action; // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, ROLE_CHANGE

    private String entity; // USER, FARM, CROP, SENSOR, IRRIGATION, PEST, FERTILIZER

    private String entityId;

    private LocalDateTime timestamp;

    @Column(length = 1000)
    private String details;

    public AuditLog(Integer userId, String action, String entity, String entityId, String details) {
        this.userId = userId;
        this.action = action;
        this.entity = entity;
        this.entityId = entityId;
        this.timestamp = LocalDateTime.now();
        this.details = details;
    }
}
