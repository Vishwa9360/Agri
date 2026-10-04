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
public class PestAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String cropName;

    private String pestName;

    private String severity;

    private String affectedArea;

    private String symptoms;

    private String recommendation;

    private String detectionDate;

    private String status;

    private Integer farmId = 1;

    private String imageUrl;

    private String organicRemedy;

    private String chemicalRemedy;

    private Double confidenceScore = 0.88;

    private String diagnosisSource = "AI_VISION_ADVISORY";
}
