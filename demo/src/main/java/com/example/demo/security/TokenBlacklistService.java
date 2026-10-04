package com.example.demo.security;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public void blacklistToken(String token) {
        if (token != null && !token.trim().isEmpty()) {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            blacklistedTokens.add(token.trim());
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null) {
            return false;
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return blacklistedTokens.contains(token.trim());
    }
}
