package com.example.demo.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.NotificationTemplate;

@Repository
public interface NotificationTemplateRepo extends JpaRepository<NotificationTemplate, Integer> {
    Optional<NotificationTemplate> findByTemplateCodeAndChannel(String templateCode, String channel);
    List<NotificationTemplate> findByTemplateCode(String templateCode);
}
