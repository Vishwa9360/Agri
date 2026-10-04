package com.example.demo.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.service.AnalyticsService;

@RestController
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/api/analytics/yield/{farmId}")
    public Map<String, Object> getYieldAnalytics(@PathVariable Integer farmId) {
        return analyticsService.getYieldAnalytics(farmId);
    }

    @GetMapping("/api/analytics/input-cost")
    public Map<String, Object> getInputCost() {
        return analyticsService.getInputCostAnalytics();
    }

    @GetMapping("/api/analytics/profitability")
    public Map<String, Object> getProfitability() {
        return analyticsService.getProfitabilityAnalytics();
    }

    @GetMapping("/api/weather/{farmId}")
    public Map<String, Object> getWeather(@PathVariable Integer farmId) {
        return analyticsService.getWeatherAnalytics(farmId);
    }

    @GetMapping("/api/analytics/insights")
    public Map<String, Object> getInsights() {
        return analyticsService.getWeeklyNaturalLanguageInsights();
    }

    @GetMapping(value = "/api/analytics/export/yield/{farmId}", produces = "text/csv")
    public org.springframework.http.ResponseEntity<String> exportYieldCsv(@PathVariable Integer farmId) {
        String csv = analyticsService.generateYieldReportCsv(farmId);
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"yield_report_farm_" + farmId + ".csv\"")
                .body(csv);
    }

    @GetMapping("/api/analytics/anomalies")
    public Map<String, Object> getAnomalies() {
        return analyticsService.getSensorAnomalyAnalytics();
    }

    @GetMapping("/api/analytics/risk/{farmId}")
    public Map<String, Object> getRisk(@PathVariable Integer farmId) {
        return analyticsService.getAgronomicRiskIndex(farmId);
    }

    @GetMapping("/api/analytics/forecast/{farmId}")
    public Map<String, Object> getForecast(@PathVariable Integer farmId) {
        return analyticsService.getCropDemandForecast(farmId);
    }
}
