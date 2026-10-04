package com.example.demo.service;

import java.util.Map;

/**
 * Interface defining the pest & disease diagnostic capability.
 * Enables clean separation between academic heuristic engines and deep-learning CV microservices.
 * Compliant with SRS §10, FR11, FR12.
 */
public interface PestDiagnosisProvider {
    Map<String, Object> diagnose(Integer farmId, String cropName, String symptoms, String imageMeta);
    String getProviderName();
    boolean isAvailable();
}
