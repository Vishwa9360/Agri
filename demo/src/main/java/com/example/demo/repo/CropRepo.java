package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Crop;

@Repository
public interface CropRepo extends JpaRepository<Crop, Integer> {
    java.util.List<Crop> findByFarmId(Integer farmId);
}