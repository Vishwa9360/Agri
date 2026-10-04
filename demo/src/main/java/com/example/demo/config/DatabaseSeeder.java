package com.example.demo.config;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.model.*;
import com.example.demo.repo.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private AuthRepo authRepo;

    @Autowired
    private FarmerRepo farmerRepo;

    @Autowired
    private CropRepo cropRepo;

    @Autowired
    private SensorRepo sensorRepo;

    @Autowired
    private IrrigationRepo irrigationRepo;

    @Autowired
    private FertilizerRepo fertilizerRepo;

    @Autowired
    private PestRepo pestRepo;

    @Autowired
    private DroneRepo droneRepo;

    @Autowired
    private RolePermissionRepo rolePermissionRepo;

    @Autowired(required = false)
    private com.example.demo.repo.NotificationTemplateRepo notificationTemplateRepo;

    @Autowired(required = false)
    private com.example.demo.repo.WorkflowTaskRepo workflowTaskRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedRolePermissions();
        seedFarms();
        seedCrops();
        seedSensors();
        seedIrrigation();
        seedFertilizerAndPesticide();
        seedPestAlerts();
        seedDroneMissions();
        seedNotificationTemplates();
        seedWorkflowTasks();
    }

    private void seedUsers() {
        createUserIfAbsent("Vishwaboopathi", "vishwa", "vishwa@gmail.com", "9876543201", "Vishwa@123", "ADMIN", "HQ-CENTRAL", "APPROVED");
        createUserIfAbsent("System Administrator", "admin", "admin@farming.com", "9876543200", "Admin@123", "ADMIN", "HQ-CENTRAL", "APPROVED");
        createUserIfAbsent("Ramesh Kumar (Farmer)", "farmer", "farmer@farming.com", "9876543210", "Farmer@123", "FARMER", "CLUSTER-NORTH-A", "APPROVED");
        createUserIfAbsent("Suresh Patil (Field Officer)", "field_officer", "field_officer@farming.com", "9876543220", "Officer@123", "FIELD_OFFICER", "CLUSTER-NORTH-A", "APPROVED");
        createUserIfAbsent("Dr. Anita Rao (Agri Officer)", "agri_officer", "agri_officer@farming.com", "9876543230", "Officer@123", "AGRICULTURAL_OFFICER", "ZONE-MAHARASHTRA", "APPROVED");
        createUserIfAbsent("Kavita Deshmukh (Extension)", "extension_officer", "extension_officer@farming.com", "9876543240", "Officer@123", "EXTENSION_OFFICER", "CLUSTER-SOUTH-B", "APPROVED");
        createUserIfAbsent("Guest Observer", "guest", "guest@farming.com", "9876543250", "Guest@123", "GUEST", "PUBLIC", "APPROVED");
    }

    private void createUserIfAbsent(String name, String username, String email, String phone, String password, String role, String cluster, String approvalStatus) {
        if (!authRepo.existsByEmail(email)) {
            AuthModel user = new AuthModel();
            user.setName(name);
            user.setUsername(username);
            user.setEmail(email);
            user.setPhoneNumber(phone);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setClusterCode(cluster);
            user.setApprovalStatus(approvalStatus);
            user.setIsActive(true);
            user.setCreatedDate(LocalDateTime.now());
            user.setFailedLoginAttempts(0);
            authRepo.save(user);
        }
    }

    private void seedFarms() {
        if (farmerRepo.count() == 0) {
            AuthModel farmerUser = authRepo.findByUsernameOrEmail("farmer@farming.com").orElse(null);
            Integer uid = farmerUser != null ? farmerUser.getId() : 1;

            Farmer f1 = new Farmer();
            f1.setUserId(uid);
            f1.setFarmerName("Ramesh Kumar");
            f1.setPhoneNumber("9876543210");
            f1.setLocation("Nashik, Maharashtra");
            f1.setFarmName("Green Valley Parcel A");
            f1.setFarmCode("FARM-001");
            f1.setAreaAcres(6.5);
            f1.setSoilType("Loamy");
            f1.setWaterSource("Canal & Drip");
            f1.setLatitude(19.9975);
            f1.setLongitude(73.7898);
            f1.setSurveyNumber("SY-102/3A");
            f1.setStatus("Active");
            f1.setCreatedDate(LocalDateTime.now().minusDays(90));
            farmerRepo.save(f1);

            Farmer f2 = new Farmer();
            f2.setUserId(uid);
            f2.setFarmerName("Ramesh Kumar");
            f2.setPhoneNumber("9876543210");
            f2.setLocation("Nashik, Maharashtra");
            f2.setFarmName("Sunrise Organic Orchard");
            f2.setFarmCode("FARM-002");
            f2.setAreaAcres(4.2);
            f2.setSoilType("Black Soil");
            f2.setWaterSource("Borewell");
            f2.setLatitude(20.0120);
            f2.setLongitude(73.8150);
            f2.setSurveyNumber("SY-88/1B");
            f2.setStatus("Active");
            f2.setCreatedDate(LocalDateTime.now().minusDays(60));
            farmerRepo.save(f2);
        }
    }

    private void seedCrops() {
        if (cropRepo.count() == 0) {
            Farmer f1 = farmerRepo.findAll().stream().findFirst().orElse(null);
            Integer farmId = f1 != null ? f1.getId() : 1;

            Crop c1 = new Crop();
            c1.setFarmId(farmId);
            c1.setCropName("Wheat");
            c1.setCropType("Cereal");
            c1.setVariety("HD-2967");
            c1.setSeason("Rabi");
            c1.setSoilType("Loamy");
            c1.setQuantity(6);
            c1.setAreaAcres(6.0);
            c1.setSowingDate("2025-11-10");
            c1.setExpectedHarvestDate("2026-03-25");
            c1.setStatus("Maturity");
            c1.setTargetYield(7800.0);
            c1.setActualYield(7200.0);
            cropRepo.save(c1);

            Crop c2 = new Crop();
            c2.setFarmId(farmId);
            c2.setCropName("Soybean");
            c2.setCropType("Legume");
            c2.setVariety("JS-335");
            c2.setSeason("Kharif");
            c2.setSoilType("Black Soil");
            c2.setQuantity(5);
            c2.setAreaAcres(5.0);
            c2.setSowingDate("2026-06-20");
            c2.setExpectedHarvestDate("2026-10-15");
            c2.setStatus("Vegetative");
            c2.setTargetYield(5200.0);
            c2.setActualYield(4800.0);
            cropRepo.save(c2);

            Crop c3 = new Crop();
            c3.setFarmId(farmId);
            c3.setCropName("Tomato");
            c3.setCropType("Horticulture");
            c3.setVariety("Abhinav F1");
            c3.setSeason("Zaid");
            c3.setSoilType("Loamy");
            c3.setQuantity(3);
            c3.setAreaAcres(3.0);
            c3.setSowingDate("2026-01-15");
            c3.setExpectedHarvestDate("2026-05-10");
            c3.setStatus("Flowering");
            c3.setTargetYield(12000.0);
            c3.setActualYield(11400.0);
            cropRepo.save(c3);
        }
    }

    private void seedSensors() {
        if (sensorRepo.count() == 0) {
            Farmer f1 = farmerRepo.findAll().stream().findFirst().orElse(null);
            Integer farmId = f1 != null ? f1.getId() : 1;

            Sensor s1 = new Sensor();
            s1.setFarmId(farmId);
            s1.setSensorName("Soil Node North (Moisture/NPK)");
            s1.setSensorType("FMCW Ground Probe");
            s1.setSoilMoisture(34.5);
            s1.setTemperature(26.8);
            s1.setHumidity(68.2);
            s1.setPhLevel(6.8);
            s1.setNitrogen(142.0);
            s1.setPhosphorus(29.0);
            s1.setPotassium(185.0);
            s1.setBatteryLevel(96.0);
            s1.setStatus("ONLINE");
            s1.setTimestamp(LocalDateTime.now());
            sensorRepo.save(s1);

            Sensor s2 = new Sensor();
            s2.setFarmId(farmId);
            s2.setSensorName("Canopy Weather Station South");
            s2.setSensorType("Micro-Climate Station");
            s2.setSoilMoisture(28.0); // Sub-threshold to test automated irrigation
            s2.setTemperature(31.2);
            s2.setHumidity(55.0);
            s2.setPhLevel(6.6);
            s2.setNitrogen(118.0);
            s2.setPhosphorus(24.0);
            s2.setPotassium(160.0);
            s2.setBatteryLevel(88.0);
            s2.setStatus("ONLINE");
            s2.setTimestamp(LocalDateTime.now());
            sensorRepo.save(s2);
        }
    }

    private void seedIrrigation() {
        if (irrigationRepo.count() == 0) {
            Farmer f1 = farmerRepo.findAll().stream().findFirst().orElse(null);
            Integer farmId = f1 != null ? f1.getId() : 1;

            Irrigation i1 = new Irrigation();
            i1.setFarmId(farmId);
            i1.setCropId(1);
            i1.setIrrigationType("Precision Drip");
            i1.setFieldName("Green Valley Parcel A - Sector 1");
            i1.setWaterAmount(450.0);
            i1.setDurationMinutes(45);
            i1.setMoistureThreshold(30.0);
            i1.setWaterSavedM3(14.8);
            i1.setPumpValveId("PUMP-VALVE-01");
            i1.setConflictStatus("NO_CONFLICT");
            i1.setIrrigationDate("2026-09-04 06:00");
            i1.setStatus("Completed");
            irrigationRepo.save(i1);

            Irrigation i2 = new Irrigation();
            i2.setFarmId(farmId);
            i2.setCropId(2);
            i2.setIrrigationType("Smart Micro-Sprinkler");
            i2.setFieldName("Sunrise Organic Orchard - Block B");
            i2.setWaterAmount(320.0);
            i2.setDurationMinutes(30);
            i2.setMoistureThreshold(32.0);
            i2.setWaterSavedM3(9.5);
            i2.setPumpValveId("PUMP-VALVE-02");
            i2.setConflictStatus("NO_CONFLICT");
            i2.setIrrigationDate("2026-09-05 18:30");
            i2.setStatus("Scheduled");
            irrigationRepo.save(i2);
        }
    }

    private void seedFertilizerAndPesticide() {
        if (fertilizerRepo.count() == 0) {
            Farmer f1 = farmerRepo.findAll().stream().findFirst().orElse(null);
            Integer farmId = f1 != null ? f1.getId() : 1;

            Fertilizer fert1 = new Fertilizer();
            fert1.setFarmId(farmId);
            fert1.setSeasonId(1);
            fert1.setFertilizerName("Urea (46% N) Commercial Grade");
            fert1.setFertilizerType("Synthetic Nitrogen");
            fert1.setRecommendationType("FERTILIZER");
            fert1.setCropName("Wheat");
            fert1.setTargetNutrient("Nitrogen");
            fert1.setRecommendedDose(55.0);
            fert1.setUnit("kg/acre");
            fert1.setQuantity(330.0);
            fert1.setApplicationDate("2026-09-10");
            fert1.setStatus("Recommended");
            fertilizerRepo.save(fert1);

            Fertilizer pest1 = new Fertilizer();
            pest1.setFarmId(farmId);
            pest1.setSeasonId(1);
            pest1.setFertilizerName("NeemAzal T/S (Bio-Pesticide Azadirachtin)");
            pest1.setFertilizerType("Organic Bio-Control");
            pest1.setRecommendationType("PESTICIDE");
            pest1.setCropName("Wheat");
            pest1.setTargetNutrient("Foliar Aphid Control");
            pest1.setRecommendedDose(3.0);
            pest1.setUnit("ml/L water");
            pest1.setQuantity(15.0);
            pest1.setApplicationDate("2026-09-12");
            pest1.setStatus("Recommended");
            fertilizerRepo.save(pest1);
        }
    }

    private void seedPestAlerts() {
        if (pestRepo.count() == 0) {
            Farmer f1 = farmerRepo.findAll().stream().findFirst().orElse(null);
            Integer farmId = f1 != null ? f1.getId() : 1;

            PestAlert p1 = new PestAlert();
            p1.setFarmId(farmId);
            p1.setCropName("Wheat");
            p1.setPestName("Yellow Rust (Puccinia striiformis)");
            p1.setSeverity("High");
            p1.setAffectedArea("1.5 Acres");
            p1.setSymptoms("Parallel yellow-orange pustules on leaf surface, chlorosis");
            p1.setOrganicRemedy("Foliar spray of Trichoderma harzianum @ 5g/L + fermented butter milk solution.");
            p1.setChemicalRemedy("Propiconazole 25% EC (Tilt) @ 1 ml/L water with 15-day pre-harvest interval.");
            p1.setConfidenceScore(0.92);
            p1.setDiagnosisSource("AI_VISION_ADVISORY");
            p1.setDetectionDate("2026-09-03");
            p1.setStatus("Active");
            pestRepo.save(p1);

            PestAlert p2 = new PestAlert();
            p2.setFarmId(farmId);
            p2.setCropName("Soybean");
            p2.setPestName("Stem Fly (Melanagromyza sojae)");
            p2.setSeverity("Medium");
            p2.setAffectedArea("0.8 Acres");
            p2.setSymptoms("Wilting of growing tips, zigzag red tunneling in split stems");
            p2.setOrganicRemedy("Install yellow sticky traps (15/acre) + 5% Neem Seed Kernel Extract (NSKE).");
            p2.setChemicalRemedy("Thiamethoxam 25% WG @ 0.3g/L or Chlorantraniliprole 18.5% SC @ 0.3 ml/L.");
            p2.setConfidenceScore(0.87);
            p2.setDiagnosisSource("AI_VISION_ADVISORY");
            p2.setDetectionDate("2026-09-04");
            p2.setStatus("Investigating");
            pestRepo.save(p2);
        }
    }

    private void seedDroneMissions() {
        if (droneRepo.count() == 0) {
            Farmer f1 = farmerRepo.findAll().stream().findFirst().orElse(null);
            Integer farmId = f1 != null ? f1.getId() : 1;

            DroneMission d1 = new DroneMission();
            d1.setFarmId(farmId);
            d1.setDroneId("AGRO-DRONE-X4");
            d1.setFieldName("Green Valley Parcel A");
            d1.setMissionType("Multispectral NDVI Canopy Survey");
            d1.setCoverageArea(6.5);
            d1.setAltitudeMeters(45.0);
            d1.setBatteryLevelPercent(84.0);
            d1.setNdviMean(0.74);
            d1.setHealthIndex(91.2);
            d1.setCanopyHealthStatus("EXCELLENT");
            d1.setWaypointsCount(16);
            d1.setFlightDate("2026-09-04 07:15");
            d1.setStatus("Completed");
            droneRepo.save(d1);
        }
    }

    private void seedRolePermissions() {
        if (rolePermissionRepo.count() == 0) {
            String[] modules = {"FARMS", "CROPS", "SENSORS", "IRRIGATION", "FERTILIZERS", "PESTS", "DRONES", "MARKET", "WEATHER", "ANALYTICS", "DOCUMENTS", "ADMIN"};

            // ADMIN has full rights on all modules
            for (String mod : modules) {
                rolePermissionRepo.save(new RolePermission("ADMIN", mod, true, true, true, true, "ALL"));
            }

            // FARMER has CRUD on own operational data
            for (String mod : modules) {
                if (mod.equals("ADMIN")) {
                    rolePermissionRepo.save(new RolePermission("FARMER", mod, false, false, false, false, "NONE"));
                } else if (mod.equals("MARKET") || mod.equals("WEATHER")) {
                    rolePermissionRepo.save(new RolePermission("FARMER", mod, false, true, false, false, "ALL"));
                } else {
                    rolePermissionRepo.save(new RolePermission("FARMER", mod, true, true, true, false, "OWN"));
                }
            }

            // AGRICULTURAL_OFFICER has full advisory/read-write access
            for (String mod : modules) {
                if (mod.equals("ADMIN")) {
                    rolePermissionRepo.save(new RolePermission("AGRICULTURAL_OFFICER", mod, false, false, false, false, "NONE"));
                } else {
                    rolePermissionRepo.save(new RolePermission("AGRICULTURAL_OFFICER", mod, true, true, true, false, "ALL"));
                }
            }

            // FIELD_OFFICER has assigned cluster operations
            for (String mod : modules) {
                if (mod.equals("ADMIN")) {
                    rolePermissionRepo.save(new RolePermission("FIELD_OFFICER", mod, false, false, false, false, "NONE"));
                } else {
                    rolePermissionRepo.save(new RolePermission("FIELD_OFFICER", mod, true, true, true, false, "ASSIGNED"));
                }
            }

            // EXTENSION_OFFICER has farmer management and outreach access
            for (String mod : modules) {
                if (mod.equals("ADMIN")) {
                    rolePermissionRepo.save(new RolePermission("EXTENSION_OFFICER", mod, false, false, false, false, "NONE"));
                } else {
                    rolePermissionRepo.save(new RolePermission("EXTENSION_OFFICER", mod, true, true, true, false, "ASSIGNED"));
                }
            }

            // GUEST has read-only access to public info
            for (String mod : modules) {
                boolean isPublic = mod.equals("MARKET") || mod.equals("WEATHER") || mod.equals("ANALYTICS");
                rolePermissionRepo.save(new RolePermission("GUEST", mod, false, isPublic, false, false, isPublic ? "ALL" : "NONE"));
            }
        }
    }

    private void seedNotificationTemplates() {
        if (notificationTemplateRepo != null && notificationTemplateRepo.count() == 0) {
            notificationTemplateRepo.save(new com.example.demo.model.NotificationTemplate(null, "SOIL_MOISTURE_CRITICAL", "IN_APP", "Critical Soil Moisture Deficit", "Soil moisture in {{fieldName}} has dropped to {{value}}% (below {{threshold}}% threshold). Immediate irrigation cycle recommended.", true));
            notificationTemplateRepo.save(new com.example.demo.model.NotificationTemplate(null, "SOIL_MOISTURE_CRITICAL", "SMS", "AgroSense Alert", "ALERT: Field {{fieldName}} soil moisture is {{value}}% (threshold: {{threshold}}%). Start irrigation now.", true));
            notificationTemplateRepo.save(new com.example.demo.model.NotificationTemplate(null, "PEST_OUTBREAK_ALERT", "IN_APP", "Pest & Disease Advisory", "Advisory: {{pestName}} identified in {{cropName}} with {{severity}} severity. Recommended remedy: {{remedy}}.", true));
            notificationTemplateRepo.save(new com.example.demo.model.NotificationTemplate(null, "IRRIGATION_CYCLE_COMPLETED", "IN_APP", "Irrigation Cycle Finished", "Precision irrigation cycle completed in {{fieldName}}. {{waterSaved}} m³ water conserved.", true));
            notificationTemplateRepo.save(new com.example.demo.model.NotificationTemplate(null, "APPROVAL_REQUIRED", "IN_APP", "Action Required: Officer Approval", "Workflow task '{{taskTitle}}' requires approval by {{role}} before deadline {{deadline}}.", true));
        }
    }

    private void seedWorkflowTasks() {
        if (workflowTaskRepo != null && workflowTaskRepo.count() == 0) {
            com.example.demo.model.WorkflowTask task1 = new com.example.demo.model.WorkflowTask(
                    null,
                    "FARM_REGISTRATION",
                    "FARM",
                    1,
                    "Verify Green Valley Farm Survey & Land Deed",
                    "DOCUMENT_VERIFICATION",
                    "PENDING",
                    "FIELD_OFFICER",
                    "vishwa@gmail.com",
                    java.time.LocalDateTime.now().plusHours(36),
                    false,
                    "Documents submitted. Survey number verification pending.",
                    "[{\"stage\":\"INITIATED\",\"status\":\"PENDING\",\"timestamp\":\"" + java.time.LocalDateTime.now().minusHours(4) + "\",\"actor\":\"vishwa\",\"comment\":\"Application submitted\"}]",
                    java.time.LocalDateTime.now().minusHours(4),
                    java.time.LocalDateTime.now().minusHours(4)
            );
            workflowTaskRepo.save(task1);

            com.example.demo.model.WorkflowTask task2 = new com.example.demo.model.WorkflowTask(
                    null,
                    "DRONE_APPROVAL",
                    "DRONE_MISSION",
                    1,
                    "Airspace Clearance & Subsidized Spraying Approval",
                    "SIGN_OFF",
                    "APPROVED",
                    "AGRICULTURAL_OFFICER",
                    "admin@agrosense.com",
                    java.time.LocalDateTime.now().minusHours(2),
                    false,
                    "Airspace cleared for AgroDrone-X4 autonomous survey.",
                    "[{\"stage\":\"INITIATED\",\"status\":\"PENDING\",\"timestamp\":\"" + java.time.LocalDateTime.now().minusHours(24) + "\",\"actor\":\"SYSTEM\",\"comment\":\"Flight plan filed\"},{\"stage\":\"SIGN_OFF\",\"status\":\"APPROVED\",\"timestamp\":\"" + java.time.LocalDateTime.now().minusHours(2) + "\",\"actor\":\"admin@agrosense.com\",\"comment\":\"Approved\"}]",
                    java.time.LocalDateTime.now().minusHours(24),
                    java.time.LocalDateTime.now().minusHours(2)
            );
            workflowTaskRepo.save(task2);
        }
    }
}
