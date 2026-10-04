package com.example.demo.service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.PestAlert;
import com.example.demo.repo.PestRepo;

@Service
public class PestDiagnosisService {

    @Autowired
    private PestRepo pestRepo;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("heuristicPestDiagnosisProvider")
    private PestDiagnosisProvider primaryProvider;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("deepLearningPestDiagnosisProvider")
    private PestDiagnosisProvider fallbackProvider;

    /**
     * SRS Section 7 / FR11 / FR12:
     * Computer Vision / Heuristic Advisory diagnostic engine
     * Analyzes foliar visual symptoms & crop metadata to identify pest/disease outbreaks
     */
    public Map<String, Object> analyzeCropImageAndSymptoms(Integer farmId, String cropName, String symptoms, String imageMeta) {
        String crop = cropName != null ? cropName.trim() : "Wheat";

        PestDiagnosisProvider activeProvider = primaryProvider.isAvailable() ? primaryProvider : fallbackProvider;
        Map<String, Object> diag = activeProvider.diagnose(farmId, crop, symptoms, imageMeta);

        String detectedPest = (String) diag.get("detectedPest");
        String severity = (String) diag.get("severity");
        String detectedSymptoms = (String) diag.get("detectedSymptoms");
        String organicRemedy = (String) diag.get("organicRemedy");
        String chemicalRemedy = (String) diag.get("chemicalRemedy");
        double confidence = (double) diag.get("confidenceScore");

        // Persist diagnosis into database
        PestAlert alert = new PestAlert();
        alert.setFarmId(farmId != null ? farmId : 1);
        alert.setCropName(crop);
        alert.setPestName(detectedPest);
        alert.setSeverity(severity);
        alert.setAffectedArea("1.2 Acres");
        alert.setSymptoms(detectedSymptoms);
        alert.setOrganicRemedy(organicRemedy);
        alert.setChemicalRemedy(chemicalRemedy);
        alert.setConfidenceScore(confidence);
        alert.setDiagnosisSource(activeProvider.getProviderName());
        alert.setDetectionDate(LocalDate.now().toString());
        alert.setStatus("Active");
        alert.setImageUrl(imageMeta != null && !imageMeta.isEmpty() ? imageMeta : "sample-crop-leaf-scan.jpg");

        PestAlert saved = pestRepo.save(alert);

        try {
            notificationService.notifyEvent("PEST_OUTBREAK_ALERT",
                    "Critical Pest Detected: " + detectedPest + " on " + crop + " (Severity: " + severity + "). View dual treatment recommendations.");
        } catch (Exception ignored) {}

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("alertId", saved.getId());
        result.put("detectedPest", detectedPest);
        result.put("severity", severity);
        result.put("confidenceScore", Math.round(confidence * 100.0) + "%");
        result.put("symptomsSummary", detectedSymptoms);
        result.put("organicRemedy", organicRemedy);
        result.put("chemicalRemedy", chemicalRemedy);
        result.put("advisoryNotes", "Follow integrated pest management (IPM) guidelines. Wear protective gear when applying chemical treatments.");
        result.put("provider", activeProvider.getProviderName());
        result.put("detectionDate", saved.getDetectionDate());
        return result;
    }
}
