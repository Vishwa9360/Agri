package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Irrigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String irrigationType;

    private String fieldName;

    private Double waterAmount = 0.0;

    private String irrigationDate;

    private String status;

    private Integer farmId = 1;

    private Integer cropId = 1;

    private Integer durationMinutes = 45;

    private Double moistureThreshold = 30.0;

    @Column(name = "water_saved_m3")
    private Double waterSavedM3 = 12.5;

    private String pumpValveId = "PUMP-VALVE-01";

    private String conflictStatus = "NO_CONFLICT";
 
    private String frequency = "ONCE";
}