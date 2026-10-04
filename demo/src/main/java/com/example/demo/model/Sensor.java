package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String sensorName;

    private String sensorType;

    private Double temperature = 25.0;

    private Double humidity = 60.0;

    private Double soilMoisture = 35.0;

    private String status;

    private Integer farmId = 1;

    private Double phLevel = 6.8;

    private Double nitrogen = 140.0;

    private Double phosphorus = 28.0;

    private Double potassium = 180.0;

    private Double batteryLevel = 94.0;

    private java.time.LocalDateTime timestamp = java.time.LocalDateTime.now();
}