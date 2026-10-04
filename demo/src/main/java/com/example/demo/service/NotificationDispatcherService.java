package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.example.demo.model.DeadLetterMessage;
import com.example.demo.model.Notification;
import com.example.demo.model.NotificationPreference;
import com.example.demo.model.NotificationTemplate;
import com.example.demo.repo.DeadLetterMessageRepo;
import com.example.demo.repo.NotificationPreferenceRepo;
import com.example.demo.repo.NotificationRepo;
import com.example.demo.repo.NotificationTemplateRepo;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NotificationDispatcherService {

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private NotificationTemplateRepo templateRepo;

    @Autowired
    private NotificationPreferenceRepo preferenceRepo;

    @Autowired
    private DeadLetterMessageRepo dlqRepo;

    @Autowired(required = false)
    @Qualifier("developmentEmailProvider")
    private EmailProvider emailProvider;

    @Autowired(required = false)
    @Qualifier("developmentSmsProvider")
    private SmsProvider smsProvider;

    @Autowired(required = false)
    @Qualifier("developmentPushProvider")
    private PushProvider pushProvider;

    @Autowired(required = false)
    private WebSocketTelemetryService webSocketService;

    public Notification dispatchNotification(
            String templateCode,
            String channel,
            String recipient,
            String recipientContact,
            Integer userId,
            Map<String, String> variables) {

        // 1. Check user notification preferences in MySQL
        if (userId != null) {
            Optional<NotificationPreference> prefOpt = preferenceRepo.findByUserId(userId);
            if (prefOpt.isPresent()) {
                NotificationPreference pref = prefOpt.get();
                if ("EMAIL".equalsIgnoreCase(channel) && Boolean.FALSE.equals(pref.getEmailEnabled())) {
                    log.info("Email notifications disabled for user ID {}", userId);
                    return null;
                }
                if ("SMS".equalsIgnoreCase(channel) && Boolean.FALSE.equals(pref.getSmsEnabled())) {
                    log.info("SMS notifications disabled for user ID {}", userId);
                    return null;
                }
                if ("PUSH".equalsIgnoreCase(channel) && Boolean.FALSE.equals(pref.getPushEnabled())) {
                    log.info("Push notifications disabled for user ID {}", userId);
                    return null;
                }
                if ("IN_APP".equalsIgnoreCase(channel) && Boolean.FALSE.equals(pref.getInAppEnabled())) {
                    log.info("In-App notifications disabled for user ID {}", userId);
                    return null;
                }
            }
        }

        // 2. Fetch template from MySQL or fallback
        String messageBody = "Notification alert for " + recipient;
        Optional<NotificationTemplate> tplOpt = templateRepo.findByTemplateCodeAndChannel(templateCode, channel);
        if (tplOpt.isPresent()) {
            messageBody = substituteVariables(tplOpt.get().getBodyTemplate(), variables);
        } else if (variables != null && variables.containsKey("message")) {
            messageBody = variables.get("message");
        }

        // 3. Persist notification record in MySQL
        Notification notification = new Notification();
        notification.setNotificationType(templateCode != null ? templateCode : "SYSTEM");
        notification.setRecipient(recipient != null ? recipient : "ALL");
        notification.setMessage(messageBody);
        notification.setStatus("ACTIVE");
        notification.setIsRead(false);
        notification.setChannel(channel != null ? channel.toUpperCase() : "IN_APP");
        notification.setDeliveryStatus("DELIVERED");
        notification.setCreatedTime(LocalDateTime.now());

        Notification saved = notificationRepo.save(notification);

        // 4. Broadcast in real time over WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastNotification(saved);
        }

        // 5. Channel-specific provider dispatch
        try {
            boolean delivered = true;
            if ("EMAIL".equalsIgnoreCase(channel) && emailProvider != null && recipientContact != null) {
                delivered = emailProvider.sendEmail(recipientContact, "AgroSense Alert: " + templateCode, messageBody);
            } else if ("SMS".equalsIgnoreCase(channel) && smsProvider != null && recipientContact != null) {
                delivered = smsProvider.sendSms(recipientContact, messageBody);
            } else if ("PUSH".equalsIgnoreCase(channel) && pushProvider != null && recipientContact != null) {
                delivered = pushProvider.sendPush(recipientContact, "AgroSense Alert: " + templateCode, messageBody);
            }

            if (!delivered) {
                saved.setDeliveryStatus("FAILED");
                notificationRepo.save(saved);
                routeToDlq("NOTIFICATION_" + channel.toUpperCase(), recipientContact, messageBody, "Provider delivery returned false");
            }
        } catch (Exception ex) {
            log.error("Failed to deliver notification via {}: {}", channel, ex.getMessage());
            saved.setDeliveryStatus("FAILED");
            notificationRepo.save(saved);
            routeToDlq("NOTIFICATION_" + channel.toUpperCase(), recipientContact, messageBody, ex.getMessage());
        }

        return saved;
    }

    private void routeToDlq(String type, String destination, String payload, String error) {
        DeadLetterMessage dlq = new DeadLetterMessage();
        dlq.setMessageType(type);
        dlq.setDestination(destination != null ? destination : "UNKNOWN");
        dlq.setPayload(payload);
        dlq.setErrorMessage(error);
        dlq.setStatus("PENDING");
        dlq.setCreatedAt(LocalDateTime.now());
        dlqRepo.save(dlq);
        log.warn("Routed failed dispatch to MySQL Dead-Letter Queue (DLQ ID {})", dlq.getId());
    }

    private String substituteVariables(String template, Map<String, String> variables) {
        if (template == null || variables == null) return template;
        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue() != null ? entry.getValue() : "");
        }
        return result;
    }
}
