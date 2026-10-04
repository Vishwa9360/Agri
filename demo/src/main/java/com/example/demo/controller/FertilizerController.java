package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Fertilizer;
import com.example.demo.service.FertilizerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Recommendations & Fertilizer", description = "Input recommendations and soil nutrition dosage engine per SRS FR6")
@RestController
public class FertilizerController {

    @Autowired
    private FertilizerService service;

    @Autowired
    private com.example.demo.repo.FertilizerRepo fertilizerRepo;

    @Operation(summary = "Create input recommendation")
    @PostMapping({"/api/fertilizer/create", "/fertilizer/create", "/fertilizer/add"})
    public Fertilizer create(@RequestBody Fertilizer fertilizer) {
        return service.add(fertilizer);
    }

    @Operation(summary = "Get all input recommendations")
    @GetMapping({"/api/fertilizer/plans", "/fertilizer/getAll"})
    public List<Fertilizer> getAll() {
        return service.getAll();
    }

    @Operation(summary = "Get input recommendations for a crop season (SRS Appendix H)")
    @GetMapping({"/api/recommendations/{seasonId}", "/fertilizer/get/{seasonId}"})
    public List<Fertilizer> getBySeasonId(@PathVariable Integer seasonId) {
        List<Fertilizer> list = fertilizerRepo.findBySeasonId(seasonId);
        if (list != null && !list.isEmpty()) return list;
        return service.getAll();
    }

    @Operation(summary = "Calculate precision NPK nutrient deficit & commercial dosage (SRS Section 6)")
    @PostMapping("/api/fertilizer/calculate-npk")
    public java.util.Map<String, Object> calculateNpk(@RequestBody java.util.Map<String, Object> payload) {
        double currentN = payload.get("currentN") != null ? Double.parseDouble(payload.get("currentN").toString()) : 140.0;
        double currentP = payload.get("currentP") != null ? Double.parseDouble(payload.get("currentP").toString()) : 28.0;
        double currentK = payload.get("currentK") != null ? Double.parseDouble(payload.get("currentK").toString()) : 180.0;
        double acres = payload.get("acres") != null ? Double.parseDouble(payload.get("acres").toString()) : 5.0;

        // Standard optimal thresholds (kg/ha): N: 280, P: 60, K: 240
        double targetN = 280.0;
        double targetP = 60.0;
        double targetK = 240.0;

        double deficitN = Math.max(0, targetN - currentN);
        double deficitP = Math.max(0, targetP - currentP);
        double deficitK = Math.max(0, targetK - currentK);

        // Commercial grade bag equivalents (50kg bags)
        double ureaBags = Math.round((deficitN / 0.46 / 50.0 * (acres / 2.47)) * 10.0) / 10.0;
        double dapBags = Math.round((deficitP / 0.46 / 50.0 * (acres / 2.47)) * 10.0) / 10.0;
        double mopBags = Math.round((deficitK / 0.60 / 50.0 * (acres / 2.47)) * 10.0) / 10.0;

        java.util.Map<String, Object> resp = new java.util.LinkedHashMap<>();
        resp.put("currentSoilNutrients", java.util.Map.of("nitrogen", currentN, "phosphorus", currentP, "potassium", currentK));
        resp.put("targetNutrients", java.util.Map.of("nitrogen", targetN, "phosphorus", targetP, "potassium", targetK));
        resp.put("nutrientDeficitKgHa", java.util.Map.of("nitrogenDeficit", deficitN, "phosphorusDeficit", deficitP, "potassiumDeficit", deficitK));
        resp.put("commercialRecommendations", java.util.List.of(
            java.util.Map.of("fertilizer", "Urea (46% N)", "quantityBags50kg", ureaBags, "schedule", "Split 50% Basal + 50% Top dressing at 30 DAS"),
            java.util.Map.of("fertilizer", "DAP (18-46-0)", "quantityBags50kg", dapBags, "schedule", "100% Basal at sowing"),
            java.util.Map.of("fertilizer", "MOP (60% K2O)", "quantityBags50kg", mopBags, "schedule", "100% Basal at land preparation")
        ));
        resp.put("applicationNotes", "Incorporate organic vermicompost @ 2 tons/acre to enhance nutrient retention and microbial activity.");
        return resp;
    }

    @Operation(summary = "Update input recommendation")
    @PutMapping({"/api/fertilizer/{id}", "/fertilizer/update/{id}"})
    public Fertilizer update(
            @PathVariable Integer id,
            @RequestBody Fertilizer fertilizer) {
        return service.update(id, fertilizer);
    }

    @Operation(summary = "Delete recommendation record")
    @DeleteMapping({"/api/fertilizer/{id}", "/fertilizer/delete/{id}"})
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
