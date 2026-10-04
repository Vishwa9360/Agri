package com.example.demo.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.NotificationPreference;

@Repository
public interface NotificationPreferenceRepo extends JpaRepository<NotificationPreference, Integer> {
    Optional<NotificationPreference> findByUserId(Integer userId);
}
