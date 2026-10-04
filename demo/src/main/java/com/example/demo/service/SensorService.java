package com.example.demo.service;

import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.model.Sensor;
import com.example.demo.repo.SensorRepo;

@Service
public class SensorService {

    @Autowired
    private SensorRepo repo;

    @Autowired(required = false)
    private WebSocketTelemetryService webSocketService;

    @Value("${smartfarming.sensor.mode:SIMULATED}")
    private String sensorMode;

    private static final Random RANDOM = new Random();

    public void validateReading(Sensor sensor) {
        if (sensor.getSoilMoisture() < 0.0 || sensor.getSoilMoisture() > 100.0) {
            throw new IllegalArgumentException("Soil moisture must be between 0.0% and 100.0%");
        }
        if (sensor.getTemperature() < -10.0 || sensor.getTemperature() > 60.0) {
            throw new IllegalArgumentException("Temperature must be between -10.0°C and 60.0°C");
        }
        if (sensor.getHumidity() < 0.0 || sensor.getHumidity() > 100.0) {
            throw new IllegalArgumentException("Humidity must be between 0.0% and 100.0%");
        }
        if (sensor.getPhLevel() < 0.0 || sensor.getPhLevel() > 14.0) {
            throw new IllegalArgumentException("pH level must be between 0.0 and 14.0");
        }
        if (sensor.getNitrogen() < 0.0 || sensor.getNitrogen() > 500.0) {
            throw new IllegalArgumentException("Nitrogen (N) must be between 0.0 and 500.0 mg/kg");
        }
        if (sensor.getPhosphorus() < 0.0 || sensor.getPhosphorus() > 500.0) {
            throw new IllegalArgumentException("Phosphorus (P) must be between 0.0 and 500.0 mg/kg");
        }
        if (sensor.getPotassium() < 0.0 || sensor.getPotassium() > 500.0) {
            throw new IllegalArgumentException("Potassium (K) must be between 0.0 and 500.0 mg/kg");
        }
        if (sensor.getBatteryLevel() < 0.0 || sensor.getBatteryLevel() > 100.0) {
            throw new IllegalArgumentException("Battery level must be between 0.0% and 100.0%");
        }
    }

    public Sensor add(Sensor sensor) {
        validateReading(sensor);
        sensor.setId(null);
        if (sensor.getTimestamp() == null) {
            sensor.setTimestamp(java.time.LocalDateTime.now());
        }
        Sensor saved = repo.save(sensor);
        if (webSocketService != null) {
            webSocketService.broadcastTelemetry(saved);
        }
        return saved;
    }

    public List<Sensor> getAll() {
        return repo.findAll();
    }

    public Sensor getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public Sensor update(Integer id, Sensor sensor) {
        validateReading(sensor);
        Sensor data = repo.findById(id).orElse(null);

        if (data != null) {
            data.setSensorName(sensor.getSensorName());
            data.setSensorType(sensor.getSensorType());
            data.setTemperature(sensor.getTemperature());
            data.setHumidity(sensor.getHumidity());
            data.setSoilMoisture(sensor.getSoilMoisture());
            data.setStatus(sensor.getStatus());
            data.setPhLevel(sensor.getPhLevel());
            data.setNitrogen(sensor.getNitrogen());
            data.setPhosphorus(sensor.getPhosphorus());
            data.setPotassium(sensor.getPotassium());
            data.setBatteryLevel(sensor.getBatteryLevel());
            data.setTimestamp(java.time.LocalDateTime.now());

            return repo.save(data);
        }

        return null;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Sensor Deleted Successfully";
    }

    public Sensor simulateReadingForFarm(Integer farmId) {
        Sensor s = new Sensor();
        s.setFarmId(farmId);
        s.setSensorName("Field Probe Alpha-" + farmId);
        s.setSensorType("FDR Multi-Depth Soil Probe");
        // Realistic fluctuating values
        double temp = 24.0 + (RANDOM.nextDouble() * 8.0); // 24 to 32 C
        double hum = 55.0 + (RANDOM.nextDouble() * 25.0); // 55 to 80 %
        double moist = 22.0 + (RANDOM.nextDouble() * 25.0); // 22 to 47 %
        double ph = 6.2 + (RANDOM.nextDouble() * 1.2); // 6.2 to 7.4
        double n = 120.0 + (RANDOM.nextDouble() * 40.0);
        double p = 22.0 + (RANDOM.nextDouble() * 12.0);
        double k = 160.0 + (RANDOM.nextDouble() * 40.0);
        double batt = 88.0 + (RANDOM.nextDouble() * 12.0);

        s.setTemperature(Math.round(temp * 10.0) / 10.0);
        s.setHumidity(Math.round(hum * 10.0) / 10.0);
        s.setSoilMoisture(Math.round(moist * 10.0) / 10.0);
        s.setPhLevel(Math.round(ph * 10.0) / 10.0);
        s.setNitrogen(Math.round(n * 10.0) / 10.0);
        s.setPhosphorus(Math.round(p * 10.0) / 10.0);
        s.setPotassium(Math.round(k * 10.0) / 10.0);
        s.setBatteryLevel(Math.round(batt * 10.0) / 10.0);
        s.setStatus("ONLINE (" + sensorMode + ")");
        s.setTimestamp(java.time.LocalDateTime.now());

        Sensor saved = repo.save(s);
        if (webSocketService != null) {
            webSocketService.broadcastTelemetry(saved);
        }
        return saved;
    }

    public String getSensorMode() {
        return sensorMode;
    }
}