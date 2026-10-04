package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.DroneMission;

@Repository
public interface DroneRepo extends JpaRepository<DroneMission, Integer> {
    java.util.List<DroneMission> findByFarmId(Integer farmId);
}
