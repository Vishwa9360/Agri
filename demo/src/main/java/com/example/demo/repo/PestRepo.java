package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.PestAlert;

@Repository
public interface PestRepo extends JpaRepository<PestAlert, Integer> {
    java.util.List<PestAlert> findByFarmId(Integer farmId);
}
