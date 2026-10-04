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
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // SENSOR_ALERT, IRRIGATION_REMINDER, CROP_ACTIVITY, PEST_ALERT, APPROVAL, SYSTEM
    private String notificationType;

    private String recipient; // username, role, or "ALL"

    @Column(length = 1000)
    private String message;

    private String status; // ACTIVE, RESOLVED, DISMISSED

    private Boolean isRead = false;

    private String channel = "IN_APP"; // IN_APP, EMAIL, SMS, PUSH

    private String deliveryStatus = "DELIVERED"; // PENDING, DELIVERED, FAILED

    private LocalDateTime createdTime;

    public Notification(String notificationType, String recipient, String message, String status) {
        this.notificationType = notificationType;
        this.recipient = recipient;
        this.message = message;
        this.status = status;
        this.isRead = false;
        this.createdTime = LocalDateTime.now();
    }
}
