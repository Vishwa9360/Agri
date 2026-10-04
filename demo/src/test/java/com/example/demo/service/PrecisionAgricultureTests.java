package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.model.Fertilizer;
import com.example.demo.model.Irrigation;
import com.example.demo.model.Sensor;
import com.example.demo.repo.FertilizerRepo;
import com.example.demo.repo.IrrigationRepo;
import com.example.demo.repo.SensorRepo;

@ExtendWith(MockitoExtension.class)
public class PrecisionAgricultureTests {

    @Mock
    private SensorRepo sensorRepo;

    @Mock
    private IrrigationRepo irrigationRepo;

    @Mock
    private FertilizerRepo fertilizerRepo;

    @InjectMocks
    private SensorService sensorService;

    @InjectMocks
    private IrrigationService irrigationService;

    @InjectMocks
    private FertilizerService fertilizerService;

    @Test
    @DisplayName("Should reject sensor reading with impossible soil moisture (>100%)")
    void testSensorMoistureRangeValidation() {
        Sensor s = new Sensor();
        s.setSoilMoisture(105.0);
        s.setTemperature(25.0);
        s.setHumidity(60.0);
        s.setPhLevel(6.5);
        s.setNitrogen(100.0);
        s.setPhosphorus(30.0);
        s.setPotassium(150.0);
        s.setBatteryLevel(90.0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            sensorService.validateReading(s);
        });
        assertTrue(ex.getMessage().contains("Soil moisture must be between"));
    }

    @Test
    @DisplayName("Should reject sensor reading with extreme temperature (>60C or <-10C)")
    void testSensorTemperatureRangeValidation() {
        Sensor s = new Sensor();
        s.setSoilMoisture(45.0);
        s.setTemperature(75.0);
        s.setHumidity(60.0);
        s.setPhLevel(6.5);
        s.setNitrogen(100.0);
        s.setPhosphorus(30.0);
        s.setPotassium(150.0);
        s.setBatteryLevel(90.0);

        assertThrows(IllegalArgumentException.class, () -> {
            sensorService.validateReading(s);
        });
    }

    @Test
    @DisplayName("Should cancel irrigation schedule successfully")
    void testCancelIrrigation() {
        Irrigation irr = new Irrigation();
        irr.setId(5);
        irr.setStatus("PENDING");

        when(irrigationRepo.findById(5)).thenReturn(Optional.of(irr));
        when(irrigationRepo.save(any(Irrigation.class))).thenAnswer(i -> i.getArgument(0));

        Irrigation cancelled = irrigationService.cancel(5);
        assertEquals("CANCELLED", cancelled.getStatus());
        verify(irrigationRepo, times(1)).save(irr);
    }

    @Test
    @DisplayName("Should reschedule irrigation with updated date and duration")
    void testRescheduleIrrigation() {
        Irrigation irr = new Irrigation();
        irr.setId(6);
        irr.setStatus("PENDING");
        irr.setIrrigationDate("2026-09-10");
        irr.setDurationMinutes(30);

        when(irrigationRepo.findById(6)).thenReturn(Optional.of(irr));
        when(irrigationRepo.save(any(Irrigation.class))).thenAnswer(i -> i.getArgument(0));

        Irrigation rescheduled = irrigationService.reschedule(6, "2026-09-12", 60);
        assertEquals("RESCHEDULED", rescheduled.getStatus());
        assertEquals("2026-09-12", rescheduled.getIrrigationDate());
        assertEquals(60, rescheduled.getDurationMinutes());
    }

    @Test
    @DisplayName("Should calculate pre-harvest interval (PHI) safe harvest date on fertilizer application")
    void testFertilizerPhiCalculation() {
        Fertilizer f = new Fertilizer();
        f.setApplicationDate("2026-09-01");
        f.setPhiDays(14);

        when(fertilizerRepo.save(any(Fertilizer.class))).thenAnswer(i -> i.getArgument(0));

        Fertilizer saved = fertilizerService.add(f);
        assertEquals("2026-09-15", saved.getSafeHarvestDate());
    }

    @Test
    @DisplayName("Should execute heuristic pest diagnosis with dual remedy output")
    void testHeuristicPestDiagnosis() {
        HeuristicPestDiagnosisProvider provider = new HeuristicPestDiagnosisProvider();
        Map<String, Object> diag = provider.diagnose(1, "Wheat", "yellow rust pustules on leaf blade", null);

        assertNotNull(diag);
        assertTrue(diag.get("detectedPest").toString().contains("Yellow Rust"));
        assertNotNull(diag.get("organicRemedy"));
        assertNotNull(diag.get("chemicalRemedy"));
        assertTrue((double) diag.get("confidenceScore") >= 0.85);
    }
}