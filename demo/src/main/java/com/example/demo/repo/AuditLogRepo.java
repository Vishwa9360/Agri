package com.example.demo.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.AuditLog;

@Repository
public interface AuditLogRepo extends JpaRepository<AuditLog, Integer> {

    List<AuditLog> findAllByOrderByTimestampDesc();

    List<AuditLog> findByUserIdOrderByTimestampDesc(Integer userId);

    List<AuditLog> findByEntityOrderByTimestampDesc(String entity);
}
