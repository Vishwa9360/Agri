package com.example.demo.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.WorkflowTask;

@Repository
public interface WorkflowTaskRepo extends JpaRepository<WorkflowTask, Integer> {
    List<WorkflowTask> findByStatus(String status);
    List<WorkflowTask> findByAssignedRole(String assignedRole);
    List<WorkflowTask> findByEntityTypeAndEntityId(String entityType, Integer entityId);
}
