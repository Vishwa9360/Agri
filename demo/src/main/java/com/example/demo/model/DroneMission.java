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
public class DroneMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String droneId;

    private String fieldName;

    private String missionType;

    private Double coverageArea = 5.0;

    private Double healthIndex = 85.0;

    private String flightDate;

    private String status;

    private Integer farmId = 1;

    private Double altitudeMeters = 45.0;

    private Double batteryLevelPercent = 82.0;

    private Double ndviMean = 0.72;

    private String canopyHealthStatus = "GOOD";

    private Integer waypointsCount = 12;
}
