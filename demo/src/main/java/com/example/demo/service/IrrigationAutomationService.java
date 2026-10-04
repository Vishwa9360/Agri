package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Irrigation;
import com.example.demo.repo.IrrigationRepo;

@Service
public class IrrigationAutomationService {

    @Autowired
    private IrrigationRepo irrigationRepo;

    @Autowired
    private NotificationService notificationService;

    /**
     * SRS FR7 / FR8: Automated sensor-based trigger decision
     * Evaluates soil moisture against critical threshold (default 30%)
     */
    public boolean evaluateAndTriggerIrrigation(Integer farmId, double currentMoisture, double threshold) {
        if (currentMoisture < threshold) {
            String pumpId = "PUMP-VALVE-AUTO-" + (farmId != null ? farmId : "01");

            // Conflict detection: verify if another active run is scheduled on this pump
            boolean conflict = checkPumpConflict(pumpId);

            Irrigation autoRun = new Irrigation();
            autoRun.setFarmId(farmId);
            autoRun.setCropId(1);
            autoRun.setIrrigationType("Sensor-Triggered Drip");
            autoRun.setFieldName("Farm " + farmId + " - Sector North");
            autoRun.setWaterAmount(350.0);
            autoRun.setDurationMinutes(35);
            autoRun.setMoistureThreshold(threshold);
            autoRun.setWaterSavedM3(11.2);
            autoRun.setPumpValveId(pumpId);
            autoRun.setConflictStatus(conflict ? "CONFLICT_DETECTED" : "NO_CONFLICT");
            autoRun.setIrrigationDate(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            autoRun.setStatus(conflict ? "Pending Conflict Resolution" : "Triggered Automatically");

            irrigationRepo.save(autoRun);

            // Notify user
            try {
                notificationService.notifyEvent("PRECISION_IRRIGATION",
                        "Automated irrigation triggered for Farm #" + farmId + " (Soil Moisture dropped to " + currentMoisture + "%, below " + threshold + "% threshold). Pump: " + pumpId);
            } catch (Exception ignored) {}

            return true;
        }
        return false;
    }

    /**
     * Checks if a pump/valve has an overlapping active or scheduled run
     */
    public boolean checkPumpConflict(String pumpValveId) {
        if (pumpValveId == null) return false;
        List<Irrigation> all = irrigationRepo.findAll();
        for (Irrigation i : all) {
            if (pumpValveId.equalsIgnoreCase(i.getPumpValveId())
                    && ("In Progress".equalsIgnoreCase(i.getStatus()) || "Scheduled".equalsIgnoreCase(i.getStatus()))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Calculates total water conservation telemetry
     */
    public double calculateTotalWaterSaved() {
        return irrigationRepo.findAll().stream()
                .mapToDouble(i -> i.getWaterSavedM3() != null ? i.getWaterSavedM3() : 0.0)
                .sum();
    }
}
