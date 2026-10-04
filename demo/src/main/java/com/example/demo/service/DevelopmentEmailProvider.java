package com.example.demo.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("developmentEmailProvider")
public class DevelopmentEmailProvider implements EmailProvider {

    @Override
    public boolean sendEmail(String to, String subject, String body) {
        log.info("[DEVELOPMENT EMAIL PROVIDER] Mode: SIMULATED | To: {} | Subject: {} | Body:\n{}", to, subject, body);
        return true;
    }

    @Override
    public String getMode() {
        return "DEVELOPMENT_MOCK";
    }
}
