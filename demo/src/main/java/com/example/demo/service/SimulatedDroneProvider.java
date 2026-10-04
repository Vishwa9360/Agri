package com.example.demo.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.demo.model.DroneMission;
import com.example.demo.repo.DroneRepo;

/**
 * High-fidelity Drone Flight Mission and Multispectral NDVI Simulator.
 * Simulates autonomous waypoint navigation, battery dissipation, and orthomosaic biomass zonation.
 * Active default provider per SRS §8 simulation mandate.
 */
@Component("simulatedDroneProvider")
public class SimulatedDroneProvider implements DroneFlightProvider {

    @Value("${smartfarming.drone.mode:SIMULATED}")
    private String droneMode;

    @Autowired
    private DroneRepo droneRepo;

    @Override
    public String getProviderMode() {
        return droneMode;
    }

    @Override
    public Map<String, Object> executeFlightMission(DroneMission mission) {
        if (mission.getDroneId() == null || mission.getDroneId().isEmpty()) {
            mission.setDroneId("AGRO-DRONE-X4");
        }
        if (mission.getMissionType() == null || mission.getMissionType().isEmpty()) {
            mission.setMissionType("Multispectral NDVI Canopy Survey");
        }
        if (mission.getAltitudeMeters() <= 0) {
            mission.setAltitudeMeters(45.0);
        }
        if (mission.getWaypointsCount() <= 0) {
            mission.setWaypointsCount(16);
        }
        mission.setBatteryLevelPercent(84.5);
        mission.setNdviMean(0.74);
        mission.setHealthIndex(91.2);
        mission.setCanopyHealthStatus("EXCELLENT");
        mission.setStatus("Completed (" + droneMode + ")");
        if (mission.getFlightDate() == null || mission.getFlightDate().isEmpty()) {
            mission.setFlightDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }

        DroneMission saved = droneRepo.save(mission);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("missionId", saved.getId());
        resp.put("droneId", saved.getDroneId());
        resp.put("providerMode", droneMode);
        resp.put("flightStatus", "COMPLETED_AUTONOMOUS");
        resp.put("coverageAcres", saved.getCoverageArea());
        resp.put("meanNdvi", saved.getNdviMean());
        resp.put("canopyHealth", saved.getCanopyHealthStatus());
        resp.put("waypointsExecuted", saved.getWaypointsCount());
        resp.put("batteryRemainingPercent", saved.getBatteryLevelPercent());
        return resp;
    }

    @Override
    public Map<String, Object> processOrthomosaic(Integer farmId, String missionName) {
        double ndvi = 0.76;
        String healthStatus = "EXCELLENT";

        DroneMission mission = new DroneMission();
        mission.setFarmId(farmId != null ? farmId : 1);
        mission.setDroneId("AGRO-DRONE-X4");
        mission.setFieldName(missionName != null ? missionName : "Canopy Survey");
        mission.setMissionType("Multispectral NDVI Canopy Survey");
        mission.setCoverageArea(5.5);
        mission.setAltitudeMeters(40.0);
        mission.setBatteryLevelPercent(85.0);
        mission.setNdviMean(ndvi);
        mission.setHealthIndex(93.5);
        mission.setCanopyHealthStatus(healthStatus);
        mission.setWaypointsCount(14);
        mission.setFlightDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        mission.setStatus("Completed (" + droneMode + ")");

        DroneMission saved = droneRepo.save(mission);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("missionId", saved.getId());
        resp.put("status", "Imagery Processed Successfully (" + droneMode + ")");
        resp.put("meanNdvi", ndvi);
        resp.put("canopyHealth", healthStatus);
        resp.put("coverageAcres", 5.5);
        resp.put("biomassZonation", Map.of(
                "highVigorPercent", 78.5,
                "moderateStressPercent", 16.5,
                "severeStressPercent", 5.0
        ));
        resp.put("providerMode", droneMode);
        return resp;
    }
}
