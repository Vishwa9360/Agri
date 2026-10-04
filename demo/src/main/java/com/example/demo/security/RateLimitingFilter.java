package com.example.demo.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitingFilter extends OncePerRequestFilter {

    @Autowired
    private RateLimitingService rateLimiter;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = extractClientIp(request);

        // 1. Login endpoint rate limit: 5 attempts / 15 minutes / IP
        if ((uri.endsWith("/auth/login") || uri.endsWith("/api/auth/login")) && "POST".equalsIgnoreCase(method)) {
            if (!rateLimiter.allowLogin(clientIp)) {
                sendRateLimitError(response, "Too many login attempts. Rate limit is 5 attempts per 15 minutes.", rateLimiter.getRetryAfterSeconds("LOGIN", clientIp));
                return;
            }
        }

        // 2. Registration endpoint rate limit: 3 accounts / day / IP
        if ((uri.endsWith("/auth/register") || uri.endsWith("/api/auth/register")) && "POST".equalsIgnoreCase(method)) {
            if (!rateLimiter.allowRegistration(clientIp)) {
                sendRateLimitError(response, "Registration limit exceeded. Maximum 3 accounts per day per IP.", rateLimiter.getRetryAfterSeconds("REGISTER", clientIp));
                return;
            }
        }

        // 3. Search endpoint rate limit: 1000 queries / hour
        if (uri.contains("/search") && "GET".equalsIgnoreCase(method)) {
            if (!rateLimiter.allowSearch(clientIp)) {
                sendRateLimitError(response, "Search query limit exceeded (1000 queries/hour).", rateLimiter.getRetryAfterSeconds("SEARCH", clientIp));
                return;
            }
        }

        // 4. Data writes: 100 operations / hour (excluding public auth/login endpoints)
        if (("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method))
                && !uri.contains("/auth/") && !uri.contains("/ws")) {
            if (!rateLimiter.allowDataWrite(clientIp)) {
                sendRateLimitError(response, "Write operation limit exceeded (100 operations/hour).", rateLimiter.getRetryAfterSeconds("WRITE", clientIp));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private void sendRateLimitError(HttpServletResponse response, String message, long retryAfterSeconds) throws IOException {
        response.setStatus(429); // 429 Too Many Requests
        response.setContentType("application/json");
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"" + message + "\",\"retryAfterSeconds\":" + retryAfterSeconds + "}");
    }
}
