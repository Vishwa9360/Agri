package com.example.demo.security;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RateLimitingService {

    // Key -> RequestBucket (counter, resetTimeEpochSeconds)
    private final Map<String, WindowBucket> buckets = new ConcurrentHashMap<>();

    private static class WindowBucket {
        final AtomicInteger count = new AtomicInteger(0);
        volatile long resetTimeEpochSeconds;

        WindowBucket(long windowSeconds) {
            this.resetTimeEpochSeconds = Instant.now().getEpochSecond() + windowSeconds;
        }

        boolean allowRequest(int maxAllowed, long windowSeconds) {
            long now = Instant.now().getEpochSecond();
            if (now > resetTimeEpochSeconds) {
                synchronized (this) {
                    if (now > resetTimeEpochSeconds) {
                        count.set(0);
                        resetTimeEpochSeconds = now + windowSeconds;
                    }
                }
            }
            return count.incrementAndGet() <= maxAllowed;
        }

        long getSecondsUntilReset() {
            return Math.max(0, resetTimeEpochSeconds - Instant.now().getEpochSecond());
        }
    }

    public boolean allowLogin(String clientIp) {
        // 5 attempts per 15 minutes (900 seconds)
        String key = "LOGIN:" + clientIp;
        WindowBucket bucket = buckets.computeIfAbsent(key, k -> new WindowBucket(900));
        return bucket.allowRequest(5, 900);
    }

    public boolean allowRegistration(String clientIp) {
        // 3 accounts per day (86400 seconds)
        String key = "REGISTER:" + clientIp;
        WindowBucket bucket = buckets.computeIfAbsent(key, k -> new WindowBucket(86400));
        return bucket.allowRequest(3, 86400);
    }

    public boolean allowSearch(String userOrIp) {
        // 1000 queries per hour (3600 seconds)
        String key = "SEARCH:" + userOrIp;
        WindowBucket bucket = buckets.computeIfAbsent(key, k -> new WindowBucket(3600));
        return bucket.allowRequest(1000, 3600);
    }

    public boolean allowDataWrite(String userOrIp) {
        // 100 operations per hour (3600 seconds)
        String key = "WRITE:" + userOrIp;
        WindowBucket bucket = buckets.computeIfAbsent(key, k -> new WindowBucket(3600));
        return bucket.allowRequest(100, 3600);
    }

    public boolean allowPasswordReset(String email) {
        // 3 emails per hour (3600 seconds)
        String key = "RESET:" + email.toLowerCase().trim();
        WindowBucket bucket = buckets.computeIfAbsent(key, k -> new WindowBucket(3600));
        return bucket.allowRequest(3, 3600);
    }

    public long getRetryAfterSeconds(String prefix, String identifier) {
        WindowBucket bucket = buckets.get(prefix + ":" + identifier);
        return bucket != null ? bucket.getSecondsUntilReset() : 60;
    }
}
