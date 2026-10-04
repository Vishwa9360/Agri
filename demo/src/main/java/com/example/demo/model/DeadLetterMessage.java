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
@Table(name = "dead_letter_messages")
public class DeadLetterMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String messageType; // NOTIFICATION_EMAIL, NOTIFICATION_SMS, WEATHER_SYNC, MARKET_PRICE_SYNC, WEBHOOK_DISPATCH

    private String destination;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private Integer retryCount = 0;

    private Integer maxRetries = 3;

    private String status = "PENDING"; // PENDING, RETRYING, FAILED, RESOLVED

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastRetryAt;
}
