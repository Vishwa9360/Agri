package com.example.demo.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("developmentSmsProvider")
public class DevelopmentSmsProvider implements SmsProvider {

    @Override
    public boolean sendSms(String phoneNumber, String message) {
        log.info("[DEVELOPMENT SMS PROVIDER] Mode: SIMULATED | To Phone: {} | SMS Body: {}", phoneNumber, message);
        return true;
    }

    @Override
    public String getMode() {
        return "DEVELOPMENT_MOCK";
    }
}
