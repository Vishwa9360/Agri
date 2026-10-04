package com.example.demo.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.FarmDocument;

@Repository
public interface DocumentRepo extends JpaRepository<FarmDocument, Integer> {

    List<FarmDocument> findAllByOrderByUploadDateDesc();

    List<FarmDocument> findByCategory(String category);

    List<FarmDocument> findByStatus(String status);
}
