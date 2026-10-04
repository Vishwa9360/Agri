package com.example.demo.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Notification;
import com.example.demo.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Notifications", description = "In-app notifications for sensor alerts, irrigation schedules, pest warnings, and system events")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @Operation(summary = "Get all notifications ordered by newest first")
    @GetMapping({"/api/notifications", "/notifications"})
    public List<Notification> getAllNotifications() {
        return service.getAll();
    }

    @Operation(summary = "Get unread notifications")
    @GetMapping({"/api/notifications/unread", "/notifications/unread"})
    public List<Notification> getUnreadNotifications() {
        return service.getUnread();
    }

    @Operation(summary = "Get unread notifications count")
    @GetMapping({"/api/notifications/unread-count", "/notifications/unread-count"})
    public Map<String, Object> getUnreadCount() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("unreadCount", service.getUnreadCount());
        return resp;
    }

    @Operation(summary = "Mark a notification as read")
    @PutMapping({"/api/notifications/{id}/read", "/notifications/{id}/read"})
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        Notification updated = service.markAsRead(id);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Mark all notifications as read")
    @PutMapping({"/api/notifications/read-all", "/notifications/read-all"})
    public ResponseEntity<?> markAllAsRead() {
        service.markAllAsRead();
        Map<String, String> resp = new LinkedHashMap<>();
        resp.put("message", "All notifications marked as read");
        return ResponseEntity.ok(resp);
    }

    @Operation(summary = "Create/dispatch a new notification")
    @PostMapping({"/api/notifications", "/notifications"})
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification created = service.sendNotification(
                notification.getNotificationType(),
                notification.getRecipient(),
                notification.getMessage()
        );
        return ResponseEntity.ok(created);
    }
}
