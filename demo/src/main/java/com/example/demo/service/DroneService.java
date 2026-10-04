package com.example.demo.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.example.demo.model.DroneMission;
import com.example.demo.repo.DroneRepo;

@Service
public class DroneService {

    @Autowired
    private DroneRepo repo;

    @Autowired
    @Qualifier("simulatedDroneProvider")
    private DroneFlightProvider flightProvider;

    @Autowired(required = false)
    private WebSocketTelemetryService webSocketService;

    public DroneMission add(DroneMission mission) {
        mission.setId(null);
        DroneMission saved = repo.save(mission);
        if (webSocketService != null) {
            webSocketService.broadcastDroneUpdate(saved);
        }
        return saved;
    }

    public List<DroneMission> getAll() {
        return repo.findAll();
    }

    public DroneMission getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public DroneMission update(Integer id, DroneMission mission) {
        DroneMission data = repo.findById(id).orElse(null);

        if (data != null) {
            data.setDroneId(mission.getDroneId());
            data.setFieldName(mission.getFieldName());
            data.setMissionType(mission.getMissionType());
            data.setCoverageArea(mission.getCoverageArea());
            data.setHealthIndex(mission.getHealthIndex());
            data.setFlightDate(mission.getFlightDate());
            data.setStatus(mission.getStatus());

            return repo.save(data);
        }

        return null;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Drone Mission Deleted Successfully";
    }

    public Map<String, Object> executeFlightMission(DroneMission mission) {
        return flightProvider.executeFlightMission(mission);
    }

    public Map<String, Object> processOrthomosaic(Integer farmId, String missionName) {
        return flightProvider.processOrthomosaic(farmId, missionName);
    }

    public String getDroneMode() {
        return flightProvider.getProviderMode();
    }
}
