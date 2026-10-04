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
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String cropName;

    private String cropType;

    private String season;

    private String soilType;

    private Integer quantity = 1;

    private Integer farmId;

    private String variety;

    private String sowingDate;

    private String expectedHarvestDate;

    private Double areaAcres;

    private String status = "Sown";

    private Double targetYield;

    private Double actualYield;
}