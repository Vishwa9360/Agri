package com.example.demo.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.PasswordHistory;

@Repository
public interface PasswordHistoryRepo extends JpaRepository<PasswordHistory, Integer> {
    List<PasswordHistory> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
