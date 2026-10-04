package com.example.demo.service;

public interface SmsProvider {
    boolean sendSms(String phoneNumber, String message);
    String getMode();
}
