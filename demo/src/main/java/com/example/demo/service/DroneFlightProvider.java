package com.example.demo.service;

import java.util.Map;
import com.example.demo.model.DroneMission;

/**
 * Interface defining drone flight mission orchestration and orthomosaic processing.
 * Clean abstraction separating physical UAV telemetry modems from software simulators.
 * Compliant with SRS Section 8 & FR7.
 */
public interface DroneFlightProvider {
    Map<String, Object> executeFlightMission(DroneMission mission);
    Map<String, Object> processOrthomosaic(Integer farmId, String missionName);
    String getProviderMode();
}
