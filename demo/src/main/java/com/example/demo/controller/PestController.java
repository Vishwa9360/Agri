package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.PestAlert;
import com.example.demo.service.PestDiagnosisService;
import com.example.demo.service.PestService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Pest & Disease Advisory", description = "Early warning outbreak bulletins, foliar disease diagnosis, and dual chemical/organic treatment guidelines")
@RestController
public class PestController {

    @Autowired
    private PestService service;

    @Autowired
    private PestDiagnosisService diagnosisService;

    @Operation(summary = "Report or log a new pest outbreak alert (SRS Appendix H)")
    @PostMapping({"/api/pest-alerts", "/pest/create"})
    public PestAlert create(@RequestBody PestAlert alert) {
        return service.add(alert);
    }

    @Operation(summary = "Diagnose foliar symptoms & crop scan image (SRS Section 7)")
    @PostMapping({"/api/pest/diagnose", "/pest/diagnose"})
    public java.util.Map<String, Object> diagnose(@RequestBody java.util.Map<String, Object> payload) {
        Integer farmId = payload.get("farmId") != null ? Integer.valueOf(payload.get("farmId").toString()) : 1;
        String cropName = payload.get("cropName") != null ? payload.get("cropName").toString() : "Wheat";
        String symptoms = payload.get("symptoms") != null ? payload.get("symptoms").toString() : "";
        String imageMeta = payload.get("imageMeta") != null ? payload.get("imageMeta").toString() : "";
        return diagnosisService.analyzeCropImageAndSymptoms(farmId, cropName, symptoms, imageMeta);
    }

    @GetMapping("/pest/getAll")
    public List<PestAlert> getAll() {
        return service.getAll();
    }

    @GetMapping("/pest/get/{id}")
    public PestAlert getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PutMapping("/pest/update/{id}")
    public PestAlert update(
            @PathVariable Integer id,
            @RequestBody PestAlert alert) {
        return service.update(id, alert);
    }

    @DeleteMapping("/pest/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
