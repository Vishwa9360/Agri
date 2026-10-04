package com.example.demo.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Farmer;

@Repository
public interface FarmerRepo extends JpaRepository<Farmer, Integer> {

    List<Farmer> findByUserId(Integer userId);

    boolean existsByUserIdAndFarmName(Integer userId, String farmName);
}