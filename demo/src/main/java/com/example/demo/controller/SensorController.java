package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Sensor;
import com.example.demo.service.SensorService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "IoT Sensors", description = "IoT soil telemetry and environmental sensor monitoring per SRS FR6")
@RestController
public class SensorController {

    @Autowired
    private SensorService service;

    @Autowired
    private com.example.demo.service.IrrigationAutomationService irrigationAutomationService;

    @Autowired
    private com.example.demo.repo.SensorRepo sensorRepo;

    @Operation(summary = "Ingest new sensor reading")
    @PostMapping({"/api/sensor/reading", "/sensor/create", "/sensor/add"})
    public Sensor create(@RequestBody Sensor sensor) {
        Sensor saved = service.add(sensor);
        if (saved.getSoilMoisture() > 0 && saved.getSoilMoisture() < 30.0) {
            irrigationAutomationService.evaluateAndTriggerIrrigation(saved.getFarmId(), saved.getSoilMoisture(), 30.0);
        }
        return saved;
    }

    @Operation(summary = "Get all sensor readings")
    @GetMapping({"/api/sensor/live", "/sensor/getAll"})
    public List<Sensor> getAll() {
        return service.getAll();
    }

    @Operation(summary = "Get sensor data for a specific farm (SRS Appendix H)")
    @GetMapping({"/api/sensor-data/{farmId}", "/sensor/get/{farmId}"})
    public Object getByFarmId(@PathVariable Integer farmId) {
        List<Sensor> byFarm = sensorRepo.findByFarmId(farmId);
        if (byFarm != null && !byFarm.isEmpty()) {
            return byFarm;
        }
        return service.getAll();
    }

    @Operation(summary = "Update sensor threshold configuration")
    @PutMapping({"/api/sensor/{id}", "/sensor/update/{id}"})
    public Sensor update(
            @PathVariable Integer id,
            @RequestBody Sensor sensor) {
        return service.update(id, sensor);
    }

    @Operation(summary = "Delete sensor registration")
    @DeleteMapping({"/api/sensor/{id}", "/sensor/delete/{id}"})
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }

    @Operation(summary = "Simulate live telemetry reading for a farm parcel (SRS §7 Simulation Mode)")
    @PostMapping({"/api/sensor/simulate/{farmId}", "/sensor/simulate/{farmId}"})
    public Sensor simulate(@PathVariable Integer farmId) {
        Sensor simulated = service.simulateReadingForFarm(farmId);
        if (simulated.getSoilMoisture() > 0 && simulated.getSoilMoisture() < 30.0) {
            irrigationAutomationService.evaluateAndTriggerIrrigation(simulated.getFarmId(), simulated.getSoilMoisture(), 30.0);
        }
        return simulated;
    }

    @Operation(summary = "Get current IoT sensor operational mode")
    @GetMapping({"/api/sensor/mode", "/sensor/mode"})
    public java.util.Map<String, String> getMode() {
        return java.util.Map.of("sensorMode", service.getSensorMode());
    }
}