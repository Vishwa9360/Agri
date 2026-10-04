package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.DroneMission;
import com.example.demo.service.DroneService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Drone Operations", description = "Autonomous aerial surveys, multispectral NDVI imagery processing, and crop canopy health scoring")
@RestController
public class DroneController {

    @Autowired
    private DroneService service;

    @Autowired
    private com.example.demo.repo.DroneRepo droneRepo;

    @Operation(summary = "Schedule new drone flight mission (SRS Section 8)")
    @PostMapping({"/api/drone/missions", "/drone/create"})
    public DroneMission create(@RequestBody DroneMission mission) {
        return service.add(mission);
    }

    @Operation(summary = "Get all drone missions")
    @GetMapping({"/api/drone/missions", "/drone/getAll"})
    public List<DroneMission> getAll() {
        return service.getAll();
    }

    @Operation(summary = "Get drone missions by farm ID")
    @GetMapping({"/api/drone/missions/farm/{farmId}", "/drone/farm/{farmId}"})
    public List<DroneMission> getByFarm(@PathVariable Integer farmId) {
        List<DroneMission> list = droneRepo.findByFarmId(farmId);
        if (list != null && !list.isEmpty()) return list;
        return service.getAll();
    }

    @Operation(summary = "Upload aerial orthomosaic imagery & calculate NDVI matrix (SRS Section 8)")
    @PostMapping("/api/drone/upload-orthomosaic")
    public java.util.Map<String, Object> uploadOrthomosaic(@RequestBody java.util.Map<String, Object> payload) {
        Integer farmId = payload.get("farmId") != null ? Integer.valueOf(payload.get("farmId").toString()) : 1;
        String missionName = payload.get("missionName") != null ? payload.get("missionName").toString() : "Canopy Survey";
        return service.processOrthomosaic(farmId, missionName);
    }

    @GetMapping("/drone/get/{id}")
    public DroneMission getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PutMapping("/drone/update/{id}")
    public DroneMission update(
            @PathVariable Integer id,
            @RequestBody DroneMission mission) {
        return service.update(id, mission);
    }

    @DeleteMapping("/drone/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }

    @Operation(summary = "Get current Drone operational mode")
    @GetMapping({"/api/drone/mode", "/drone/mode"})
    public java.util.Map<String, String> getMode() {
        return java.util.Map.of("droneMode", service.getDroneMode());
    }
}
