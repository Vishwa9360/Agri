package com.example.demo.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.DeadLetterMessage;

@Repository
public interface DeadLetterMessageRepo extends JpaRepository<DeadLetterMessage, Integer> {
    List<DeadLetterMessage> findByStatus(String status);
    List<DeadLetterMessage> findByMessageType(String messageType);
}
