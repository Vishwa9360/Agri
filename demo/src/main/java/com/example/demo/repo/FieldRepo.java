package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Field;

@Repository
public interface FieldRepo extends JpaRepository<Field, Integer> {

}