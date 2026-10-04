package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Crop;
import com.example.demo.service.CropService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Crop Seasons", description = "Crop lifecycle planning, variety management and yield tracking per SRS FR5")
@RestController
public class CropController {

    @Autowired
    private CropService service;

    @Operation(summary = "Initialize a new crop season (SRS FR5)")
    @PostMapping({"/api/crop-seasons", "/crop/create", "/crop/add"})
    public Crop create(@RequestBody Crop crop) {
        return service.add(crop);
    }

    @Operation(summary = "Get all crop seasons")
    @GetMapping({"/api/crop-seasons", "/crop/getAll"})
    public List<Crop> getAll() {
        return service.getAll();
    }

    @Operation(summary = "Get crop season by ID")
    @GetMapping({"/api/crop-seasons/{id}", "/crop/get/{id}"})
    public Crop getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @Operation(summary = "Update crop season details")
    @PutMapping({"/api/crop-seasons/{id}", "/crop/update/{id}"})
    public Crop update(
            @PathVariable Integer id,
            @RequestBody Crop crop) {
        return service.update(id, crop);
    }

    @Operation(summary = "Get crop seasons by farm ID")
    @GetMapping({"/api/crop-seasons/farm/{farmId}", "/crop/farm/{farmId}"})
    public List<Crop> getByFarmId(@PathVariable Integer farmId) {
        return service.getAll().stream()
                .filter(c -> c.getFarmId() != null && c.getFarmId().equals(farmId))
                .toList();
    }

    @Operation(summary = "Advance or update crop growth stage (SRS FR5)")
    @PutMapping({"/api/crop-seasons/{id}/stage", "/crop/update-stage/{id}"})
    public Crop updateStage(
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, String> payload) {
        String stage = payload.get("stage");
        return service.updateStage(id, stage);
    }

    @Operation(summary = "Delete crop season record")
    @DeleteMapping({"/api/crop-seasons/{id}", "/crop/delete/{id}"})
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}