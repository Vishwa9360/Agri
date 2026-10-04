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
public class MarketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String commodityName;

    private String mandiName;

    private String state;

    private Double minPrice = 0.0;

    private Double maxPrice = 0.0;

    private Double modalPrice = 0.0;

    private String priceTrend;

    private String priceDate;
}
