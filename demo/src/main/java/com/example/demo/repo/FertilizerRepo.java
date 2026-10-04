package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Fertilizer;

@Repository
public interface FertilizerRepo extends JpaRepository<Fertilizer, Integer> {
    java.util.List<Fertilizer> findBySeasonId(Integer seasonId);
    java.util.List<Fertilizer> findByFarmId(Integer farmId);
}
