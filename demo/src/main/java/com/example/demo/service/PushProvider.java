package com.example.demo.service;

public interface PushProvider {
    boolean sendPush(String recipientToken, String title, String body);
    String getMode();
}
