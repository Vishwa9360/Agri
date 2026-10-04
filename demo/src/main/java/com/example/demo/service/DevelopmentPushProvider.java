package com.example.demo.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("developmentPushProvider")
public class DevelopmentPushProvider implements PushProvider {

    @Override
    public boolean sendPush(String recipientToken, String title, String body) {
        log.info("[DEVELOPMENT PUSH PROVIDER] Mode: SIMULATED | Recipient: {} | Title: {} | Body: {}", recipientToken, title, body);
        return true;
    }

    @Override
    public String getMode() {
        return "DEVELOPMENT_MOCK";
    }
}
