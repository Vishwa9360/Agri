package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Irrigation;
import com.example.demo.service.IrrigationAutomationService;
import com.example.demo.service.IrrigationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Precision Irrigation", description = "Threshold-triggered irrigation schedules, pump valve assignment, conflict detection, and water conservation telemetry")
@RestController
public class IrrigationController {

    @Autowired
    private IrrigationService service;

    @Autowired
    private IrrigationAutomationService automationService;

    @Autowired
    private com.example.demo.repo.IrrigationRepo irrigationRepo;

    @Operation(summary = "Schedule irrigation run with conflict verification (SRS Section 5)")
    @PostMapping({"/api/irrigation/schedules", "/irrigation/create"})
    public Irrigation create(@RequestBody Irrigation irrigation) {
        if (irrigation.getId() != null && irrigation.getId() <= 0) {
            irrigation.setId(null);
        }
        if (irrigation.getPumpValveId() != null) {
            boolean conflict = automationService.checkPumpConflict(irrigation.getPumpValveId());
            irrigation.setConflictStatus(conflict ? "CONFLICT_DETECTED" : "NO_CONFLICT");
        }
        return service.add(irrigation);
    }

    @Operation(summary = "Get all irrigation schedules")
    @GetMapping({"/api/irrigation/schedules", "/irrigation/getAll"})
    public List<Irrigation> getAll() {
        return service.getAll();
    }

    @Operation(summary = "Get irrigation schedules for a specific farm")
    @GetMapping({"/api/irrigation/farm/{farmId}", "/irrigation/farm/{farmId}"})
    public List<Irrigation> getByFarm(@PathVariable Integer farmId) {
        List<Irrigation> list = irrigationRepo.findByFarmId(farmId);
        if (list != null && !list.isEmpty()) return list;
        return service.getAll();
    }

    @Operation(summary = "Get total water conservation telemetry (m³ saved)")
    @GetMapping("/api/irrigation/water-saved-telemetry")
    public java.util.Map<String, Object> getWaterSaved() {
        double totalSaved = automationService.calculateTotalWaterSaved();
        return java.util.Map.of(
            "totalWaterSavedM3", totalSaved,
            "equivalentLiters", totalSaved * 1000.0,
            "powerSavedKwh", Math.round(totalSaved * 1.8 * 10.0) / 10.0,
            "carbonOffsetKg", Math.round(totalSaved * 0.9 * 10.0) / 10.0
        );
    }

    @GetMapping("/irrigation/get/{id}")
    public Irrigation getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PutMapping("/irrigation/update/{id}")
    public Irrigation update(
            @PathVariable Integer id,
            @RequestBody Irrigation irrigation) {
        return service.update(id, irrigation);
    }

    @DeleteMapping("/irrigation/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }

    @Operation(summary = "Cancel an irrigation schedule (SRS §8)")
    @PutMapping({"/api/irrigation/{id}/cancel", "/irrigation/{id}/cancel"})
    public Irrigation cancel(@PathVariable Integer id) {
        return service.cancel(id);
    }

    @Operation(summary = "Reschedule an irrigation run (SRS §8)")
    @PutMapping({"/api/irrigation/{id}/reschedule", "/irrigation/{id}/reschedule"})
    public Irrigation reschedule(
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, Object> payload) {
        String newDate = payload.get("irrigationDate") != null ? payload.get("irrigationDate").toString() : null;
        Integer duration = payload.get("durationMinutes") != null ? Integer.valueOf(payload.get("durationMinutes").toString()) : null;
        return service.reschedule(id, newDate, duration);
    }
}