package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Sensor;

@Repository
public interface SensorRepo extends JpaRepository<Sensor, Integer> {
    java.util.List<Sensor> findByFarmId(Integer farmId);
}