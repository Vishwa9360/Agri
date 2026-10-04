package com.example.demo.service;

public interface EmailProvider {
    boolean sendEmail(String to, String subject, String body);
    String getMode();
}
