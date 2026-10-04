package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Irrigation;

@Repository
public interface IrrigationRepo extends JpaRepository<Irrigation, Integer> {
    java.util.List<Irrigation> findByFarmId(Integer farmId);
}