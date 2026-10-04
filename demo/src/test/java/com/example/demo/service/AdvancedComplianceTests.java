package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.demo.model.DeadLetterMessage;
import com.example.demo.model.WorkflowTask;
import com.example.demo.model.Irrigation;
import com.example.demo.controller.IrrigationController;
import com.example.demo.security.AttributeEncryptor;
import com.example.demo.security.RateLimitingService;

@SpringBootTest
public class AdvancedComplianceTests {

    @Autowired
    private IrrigationController irrigationController;

    @Autowired
    private RateLimitingService rateLimiter;

    @Autowired
    private AttributeEncryptor encryptor;

    @Autowired
    private WorkflowService workflowService;

    @Autowired
    private IntegrationService integrationService;

    @Autowired
    private AnalyticsService analyticsService;

    @Test
    void testRateLimiterLoginLimit() {
        String testIp = "192.168.1.105";
        for (int i = 0; i < 5; i++) {
            assertTrue(rateLimiter.allowLogin(testIp), "Attempt " + (i + 1) + " should be allowed");
        }
        assertFalse(rateLimiter.allowLogin(testIp), "6th attempt should be blocked by rate limiter");
    }

    @Test
    void testAttributeEncryptionAtRest() {
        String rawData = "National-ID-8829-3321-9980";
        String encrypted = encryptor.convertToDatabaseColumn(rawData);
        assertNotNull(encrypted);
        assertTrue(encrypted.startsWith("ENC:"), "Encrypted value must start with prefix ENC:");
        assertNotEquals(rawData, encrypted);

        String decrypted = encryptor.convertToEntityAttribute(encrypted);
        assertEquals(rawData, decrypted, "Decrypted attribute must match original raw data");
    }

    @Test
    void testWorkflowLifecycleAndHistory() {
        WorkflowTask task = new WorkflowTask();
        task.setWorkflowType("FARM_REGISTRATION");
        task.setEntityType("FARM");
        task.setEntityId(1);
        task.setTitle("Test Audit Approval Task");
        task.setCurrentStage("INITIATED");
        task.setStatus("PENDING");
        task.setAssignedRole("FIELD_OFFICER");

        WorkflowTask created = workflowService.createTask(task);
        assertNotNull(created.getId());
        assertNotNull(created.getSlaDueDate());
        assertFalse(created.getIsSlaBreached());

        WorkflowTask transitioned = workflowService.transitionStage(
                created.getId(),
                "VERIFICATION",
                "APPROVED",
                "officer@agrosense.com",
                "Land deed documents verified against survey records"
        );

        assertEquals("VERIFICATION", transitioned.getCurrentStage());
        assertEquals("APPROVED", transitioned.getStatus());
        assertTrue(transitioned.getHistoryJson().contains("Land deed documents verified"));
    }

    @Test
    void testDeadLetterQueuePersistenceAndRetry() {
        DeadLetterMessage dlq = integrationService.recordFailedMessage(
                "WEATHER_SYNC",
                "https://api.openweathermap.org/data/2.5",
                "{\"farmId\":1}",
                "Connection timed out after 3000ms"
        );

        assertNotNull(dlq.getId(), "DLQ message must be persisted in MySQL with generated ID");
        assertEquals("PENDING", dlq.getStatus());
        assertEquals(0, dlq.getRetryCount());

        DeadLetterMessage retried = integrationService.retryMessage(dlq.getId());
        assertEquals(1, retried.getRetryCount());
        assertEquals("RESOLVED", retried.getStatus());
    }

    @Test
    void testAdvancedAnalyticsAlgorithms() {
        Map<String, Object> anomalies = analyticsService.getSensorAnomalyAnalytics();
        assertNotNull(anomalies);
        assertTrue(anomalies.containsKey("anomaliesDetected"));

        Map<String, Object> risk = analyticsService.getAgronomicRiskIndex(1);
        assertNotNull(risk);
        assertTrue(risk.containsKey("compositeRiskScore"));
        assertTrue(risk.containsKey("riskCategory"));

        Map<String, Object> forecast = analyticsService.getCropDemandForecast(1);
        assertNotNull(forecast);
        assertTrue(forecast.containsKey("cropForecasts"));
    }

    @Test
    void testIrrigationCreateEndpoint() {
        Irrigation req = new Irrigation();
        req.setId(0);
        req.setIrrigationType("stringkohli");
        req.setFieldName("stringkoh");
        req.setWaterAmount(10.0);
        req.setIrrigationDate("20-20-2026");
        req.setStatus("stkohli");
        req.setFarmId(2);
        req.setCropId(1);
        req.setDurationMinutes(10);
        req.setMoistureThreshold(1.0);
        req.setWaterSavedM3(1.0);
        req.setPumpValveId("stringkohli");
        req.setConflictStatus("stringking");
        req.setFrequency("stringcheeku");

        Irrigation saved = irrigationController.create(req);
        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertTrue(saved.getId() > 0);
        assertEquals(1.0, saved.getWaterSavedM3());
    }
}
