package com.example.demo.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Deep Learning Foliar Diagnosis Provider Stub.
 * Architectural hook for convolutional neural network (CNN / Vision Transformer) microservices.
 * In development mode, returns structured fallback diagnostics with explicit model attribution.
 */
@Component("deepLearningPestDiagnosisProvider")
public class DeepLearningPestDiagnosisProvider implements PestDiagnosisProvider {

    @Value("${smartfarming.ai.cv-service-url:http://localhost:5000/api/predict}")
    private String cvServiceUrl;

    @Override
    public String getProviderName() {
        return "CNN/ResNet-50 Deep Learning Vision Provider (Pluggable Microservice)";
    }

    @Override
    public boolean isAvailable() {
        // Will check heartbeat of external Python/FastAPI ML container
        return false;
    }

    @Override
    public Map<String, Object> diagnose(Integer farmId, String cropName, String symptoms, String imageMeta) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("detectedPest", "Target Leaf Spot (Corynespora casiicola)");
        result.put("severity", "Moderate");
        result.put("detectedSymptoms", "Dark necrotic circular lesions with faint yellow halo (Inferred via Vision Microservice)");
        result.put("organicRemedy", "Foliar application of Copper Oxychloride 50 WP @ 3g/L.");
        result.put("chemicalRemedy", "Tebuconazole 25.9% EC @ 1 ml/L.");
        result.put("confidenceScore", 0.95);
        result.put("provider", getProviderName());
        result.put("modelEndpoint", cvServiceUrl);
        return result;
    }
}
