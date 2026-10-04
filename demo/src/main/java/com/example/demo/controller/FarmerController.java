package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Farmer;
import com.example.demo.service.FarmerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Farmers", description = "Farm parcel registration and farmer holding management per SRS FR4")
@RestController
public class FarmerController {

    @Autowired
    private FarmerService service;

    @Operation(summary = "Register a new farm parcel (SRS FR4)")
    @PostMapping({"/api/farms", "/farmer/create", "/farmer/add"})
    public Farmer create(@RequestBody Farmer farmer) {
        return service.add(farmer);
    }

    @Operation(summary = "Get all farms owned by authenticated user")
    @GetMapping({"/api/farms", "/farmer/getAll"})
    public List<Farmer> getAll() {
        return service.getAll();
    }

    @Operation(summary = "Get farm by ID")
    @GetMapping({"/api/farms/{id}", "/farmer/get/{id}"})
    public Farmer getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @Operation(summary = "Update farm details")
    @PutMapping({"/api/farms/{id}", "/farmer/update/{id}"})
    public Farmer update(
            @PathVariable Integer id,
            @RequestBody Farmer farmer) {
        return service.update(id, farmer);
    }

    @Operation(summary = "Delete farm record")
    @DeleteMapping({"/api/farms/{id}", "/farmer/delete/{id}"})
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }

    @Operation(summary = "Export all farm holdings as CSV (SRS Step 3-B)")
    @GetMapping(value = {"/api/farms/export/csv", "/farmer/export/csv"}, produces = "text/csv")
    public org.springframework.http.ResponseEntity<String> exportCsv() {
        List<Farmer> list = service.getAll();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Farm Code,Farm Name,Farmer Name,Phone Number,Location,Area (Acres),Soil Type,Water Source,Survey Number,Latitude,Longitude,Status\n");
        for (Farmer f : list) {
            sb.append(f.getId()).append(",")
                    .append(f.getFarmCode() != null ? f.getFarmCode() : "").append(",")
                    .append("\"").append(f.getFarmName() != null ? f.getFarmName() : "").append("\",")
                    .append("\"").append(f.getFarmerName() != null ? f.getFarmerName() : "").append("\",")
                    .append(f.getPhoneNumber() != null ? f.getPhoneNumber() : "").append(",")
                    .append("\"").append(f.getLocation() != null ? f.getLocation() : "").append("\",")
                    .append(f.getAreaAcres() != null ? f.getAreaAcres() : 5.0).append(",")
                    .append(f.getSoilType() != null ? f.getSoilType() : "Loamy").append(",")
                    .append("\"").append(f.getWaterSource() != null ? f.getWaterSource() : "").append("\",")
                    .append(f.getSurveyNumber() != null ? f.getSurveyNumber() : "").append(",")
                    .append(f.getLatitude() != null ? f.getLatitude() : "").append(",")
                    .append(f.getLongitude() != null ? f.getLongitude() : "").append(",")
                    .append(f.getStatus() != null ? f.getStatus() : "Active").append("\n");
        }
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"farm_holdings.csv\"")
                .body(sb.toString());
    }

    @Operation(summary = "Import farm records from CSV with field validation")
    @PostMapping(value = {"/api/farms/import/csv", "/farmer/import/csv"}, consumes = {org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE, org.springframework.http.MediaType.TEXT_PLAIN_VALUE, "*/*"})
    public org.springframework.http.ResponseEntity<?> importCsv(
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestBody(required = false) String rawBody) {
        String csvContent = "";
        try {
            if (file != null && !file.isEmpty()) {
                csvContent = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            } else if (rawBody != null && !rawBody.trim().isEmpty()) {
                csvContent = rawBody;
            } else {
                return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("error", "No CSV file or body provided"));
            }
            java.util.Map<String, Object> report = service.importCsv(csvContent);
            return org.springframework.http.ResponseEntity.ok(report);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("error", "Failed to parse CSV: " + e.getMessage()));
        }
    }

    @Operation(summary = "Search farm records by multiple attributes")
    @GetMapping({"/api/farms/search", "/farmer/search"})
    public List<Farmer> search(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String soilType,
            @RequestParam(required = false) String waterSource,
            @RequestParam(required = false) String status) {
        return service.search(district, soilType, waterSource, status);
    }
}