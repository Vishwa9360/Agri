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
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer userId;

    private String farmerName;

    private String phoneNumber;

    private String location;

    private String farmName;

    private String farmCode;

    private Double areaAcres = 5.0;

    private String soilType = "Loamy";

    private String waterSource = "Canal & Borewell";

    private Double latitude = 12.9716;

    private Double longitude = 77.5946;

    private String surveyNumber;

    private String status = "Active";

    private java.time.LocalDateTime createdDate = java.time.LocalDateTime.now();
}