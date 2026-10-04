package com.example.demo.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Notification;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Integer> {

    List<Notification> findAllByOrderByCreatedTimeDesc();

    List<Notification> findByRecipientOrderByCreatedTimeDesc(String recipient);

    List<Notification> findByIsReadFalseOrderByCreatedTimeDesc();

    long countByIsReadFalse();
}
