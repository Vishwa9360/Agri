package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.MarketPrice;

@Repository
public interface MarketPriceRepo extends JpaRepository<MarketPrice, Integer> {
}
