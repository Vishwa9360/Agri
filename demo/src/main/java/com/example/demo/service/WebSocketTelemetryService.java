package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.model.DroneMission;
import com.example.demo.model.Notification;
import com.example.demo.model.Sensor;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WebSocketTelemetryService {

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public void broadcastTelemetry(Sensor sensor) {
        if (messagingTemplate != null && sensor != null) {
            try {
                messagingTemplate.convertAndSend("/topic/telemetry", sensor);
                log.info("WebSocket: Broadcasted sensor telemetry for farm ID {}", sensor.getFarmId());
            } catch (Exception e) {
                log.warn("WebSocket telemetry broadcast error: {}", e.getMessage());
            }
        }
    }

    public void broadcastNotification(Notification notification) {
        if (messagingTemplate != null && notification != null) {
            try {
                messagingTemplate.convertAndSend("/topic/notifications", notification);
                log.info("WebSocket: Broadcasted live notification ID {}", notification.getId());
            } catch (Exception e) {
                log.warn("WebSocket notification broadcast error: {}", e.getMessage());
            }
        }
    }

    public void broadcastDroneUpdate(DroneMission mission) {
        if (messagingTemplate != null && mission != null) {
            try {
                messagingTemplate.convertAndSend("/topic/drone", mission);
                log.info("WebSocket: Broadcasted drone telemetry for drone {}", mission.getDroneId());
            } catch (Exception e) {
                log.warn("WebSocket drone broadcast error: {}", e.getMessage());
            }
        }
    }
}
