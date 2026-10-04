package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Notification;
import com.example.demo.repo.NotificationRepo;

import jakarta.annotation.PostConstruct;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepo repo;

    @PostConstruct
    public void seedInitialNotifications() {
        if (repo.count() == 0) {
            repo.save(new Notification("SENSOR_ALERT", "ALL",
                    "Soil moisture dropped below 30% in North Field. Automated drip irrigation triggered.", "ACTIVE"));

            repo.save(new Notification("PEST_ALERT", "ALL",
                    "High humidity detected. Preventive bio-fungicide recommended for Basmati Rice plot.", "ACTIVE"));

            repo.save(new Notification("IRRIGATION_REMINDER", "ALL",
                    "Evening precision irrigation cycle scheduled for Sector 3 at 18:30.", "ACTIVE"));

            repo.save(new Notification("CROP_ACTIVITY", "ALL",
                    "Basmati Rice has entered the vegetative tillering phase (Day 35). Target yield benchmark active.", "RESOLVED"));

            repo.save(new Notification("SYSTEM", "ALL",
                    "AgroSense telemetry gateway connected and synchronized with satellite feeds.", "ACTIVE"));
        }
    }

    public List<Notification> getAll() {
        return repo.findAllByOrderByCreatedTimeDesc();
    }

    public List<Notification> getUnread() {
        return repo.findByIsReadFalseOrderByCreatedTimeDesc();
    }

    public long getUnreadCount() {
        return repo.countByIsReadFalse();
    }

    public Notification sendNotification(String type, String recipient, String message) {
        Notification notification = new Notification();
        notification.setNotificationType(type != null ? type : "SYSTEM");
        notification.setRecipient(recipient != null ? recipient : "ALL");
        notification.setMessage(message);
        notification.setStatus("ACTIVE");
        notification.setIsRead(false);
        notification.setCreatedTime(LocalDateTime.now());
        return repo.save(notification);
    }

    public Notification notifyEvent(String type, String message) {
        return sendNotification(type, "ALL", message);
    }

    public Notification markAsRead(Integer id) {
        Notification notification = repo.findById(id).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notification.setStatus("RESOLVED");
            return repo.save(notification);
        }
        return null;
    }

    public void markAllAsRead() {
        List<Notification> all = repo.findAll();
        for (Notification n : all) {
            n.setIsRead(true);
            n.setStatus("RESOLVED");
        }
        repo.saveAll(all);
    }
}
