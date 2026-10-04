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
public class Fertilizer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String fertilizerName;

    private String fertilizerType;

    private String cropName;

    private Double quantity = 0.0;

    private String applicationDate;

    private String status;

    private Integer farmId;

    private Integer seasonId;

    private String recommendationType = "FERTILIZER";

    private String targetNutrient = "Nitrogen";

    private Double recommendedDose = 50.0;

    private String unit = "kg/acre";

    private String appliedDate;

    private Integer phiDays = 14;

    private String safeHarvestDate;
}
