package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.demo.exception.DuplicateFarmException;
import com.example.demo.exception.InvalidNameException;
import com.example.demo.exception.InvalidPhoneException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Farmer;
import com.example.demo.repo.FarmerRepo;

@Service
public class FarmerService {

    @Autowired
    private FarmerRepo repo;

    private Integer getLoggedInUserId() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (Integer) authentication.getPrincipal();
    }

    private void validateFarmer(Farmer farmer) {
        // Name validation per SRS Appendix C & E
        if (farmer.getFarmerName() == null || farmer.getFarmerName().trim().isEmpty()) {
            throw new InvalidNameException("Name is required");
        }
        String name = farmer.getFarmerName().trim();
        if (!name.matches("^[a-zA-Z\\s]{2,100}$")) {
            throw new InvalidNameException("Name must not contain numbers or special characters");
        }

        // Phone validation per SRS Appendix C & E
        if (farmer.getPhoneNumber() == null || farmer.getPhoneNumber().trim().isEmpty()) {
            throw new InvalidPhoneException("Phone Number is required");
        }
        String phone = farmer.getPhoneNumber().trim();
        if (!phone.matches("^[0-9]{10}$")) {
            throw new InvalidPhoneException("Phone Number must be exactly 10 digits long");
        }
    }

    public Farmer add(Farmer farmer) {
        validateFarmer(farmer);

        Integer userId = getLoggedInUserId();

        // Duplicate Farm Check per SRS Appendix E
        if (farmer.getFarmName() != null && !farmer.getFarmName().trim().isEmpty()) {
            String cleanFarmName = farmer.getFarmName().trim();
            if (repo.existsByUserIdAndFarmName(userId, cleanFarmName)) {
                throw new DuplicateFarmException("Farm record already exists with name: " + cleanFarmName);
            }
        }

        farmer.setId(null);
        farmer.setUserId(userId);

        return repo.save(farmer);
    }

    public List<Farmer> getAll() {
        Integer userId = getLoggedInUserId();
        return repo.findByUserId(userId);
    }

    public Farmer getById(Integer id) {
        Integer userId = getLoggedInUserId();

        return repo.findById(id)
                .filter(farmer -> farmer.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Farm record not found with id: " + id));
    }

    public Farmer update(Integer id, Farmer farmer) {
        validateFarmer(farmer);

        Integer userId = getLoggedInUserId();

        Farmer data = repo.findById(id)
                .filter(existing -> existing.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Farm record not found with id: " + id));

        data.setFarmerName(farmer.getFarmerName().trim());
        data.setPhoneNumber(farmer.getPhoneNumber().trim());
        data.setLocation(farmer.getLocation());
        data.setFarmName(farmer.getFarmName());
        if (farmer.getFarmCode() != null) data.setFarmCode(farmer.getFarmCode());
        if (farmer.getAreaAcres() != null) data.setAreaAcres(farmer.getAreaAcres());
        if (farmer.getSoilType() != null) data.setSoilType(farmer.getSoilType());
        if (farmer.getWaterSource() != null) data.setWaterSource(farmer.getWaterSource());
        if (farmer.getSurveyNumber() != null) data.setSurveyNumber(farmer.getSurveyNumber());
        if (farmer.getLatitude() != null) data.setLatitude(farmer.getLatitude());
        if (farmer.getLongitude() != null) data.setLongitude(farmer.getLongitude());
        if (farmer.getStatus() != null) data.setStatus(farmer.getStatus());

        return repo.save(data);
    }

    public String delete(Integer id) {
        Integer userId = getLoggedInUserId();

        Farmer data = repo.findById(id)
                .filter(farmer -> farmer.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Farm record not found with id: " + id));

        repo.delete(data);
        return "Farmer Deleted Successfully";
    }

    public java.util.Map<String, Object> importCsv(String csvContent) {
        Integer userId = getLoggedInUserId();
        String[] lines = csvContent.split("\\r?\\n");
        int totalRows = 0;
        int successful = 0;
        java.util.List<java.util.Map<String, Object>> errors = new java.util.ArrayList<>();
        java.util.List<Farmer> savedFarms = new java.util.ArrayList<>();

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;
            String lowerNoSpace = line.toLowerCase().replaceAll("[\\s_]", "");
            if (i == 0 && (lowerNoSpace.contains("farmname") || lowerNoSpace.contains("farmername") || lowerNoSpace.contains("farmer") || lowerNoSpace.contains("id"))) {
                continue; // skip header
            }
            totalRows++;
            String[] cols = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"); // CSV split respecting quotes

            try {
                if (cols.length < 3) {
                    throw new IllegalArgumentException("Insufficient columns (expected at least FarmName, FarmerName, Phone)");
                }

                String farmName = cols[0].replace("\"", "").trim();
                String farmerName = cols[1].replace("\"", "").trim();
                String phone = cols[2].replace("\"", "").trim();
                String location = cols.length > 3 ? cols[3].replace("\"", "").trim() : "Default Cluster";
                double area = 5.0;
                if (cols.length > 4 && !cols[4].trim().isEmpty()) {
                    area = Double.parseDouble(cols[4].replace("\"", "").trim());
                    if (area <= 0) throw new IllegalArgumentException("Area must be greater than 0");
                }
                String soilType = cols.length > 5 ? cols[5].replace("\"", "").trim() : "Alluvial Loam";
                String waterSource = cols.length > 6 ? cols[6].replace("\"", "").trim() : "Borewell";
                String surveyNumber = cols.length > 7 ? cols[7].replace("\"", "").trim() : "SRV-" + (100 + totalRows);

                // Validation
                if (!farmerName.matches("^[a-zA-Z\\s]{2,100}$")) {
                    throw new InvalidNameException("Invalid Farmer Name: alphabetic and spaces only");
                }
                if (!phone.matches("^[0-9]{10}$")) {
                    throw new InvalidPhoneException("Invalid Phone Number: must be exactly 10 digits");
                }
                if (repo.existsByUserIdAndFarmName(userId, farmName)) {
                    throw new DuplicateFarmException("Farm '" + farmName + "' already exists for this user");
                }

                Farmer f = new Farmer();
                f.setUserId(userId);
                f.setFarmName(farmName);
                f.setFarmerName(farmerName);
                f.setPhoneNumber(phone);
                f.setLocation(location);
                f.setAreaAcres(area);
                f.setSoilType(soilType);
                f.setWaterSource(waterSource);
                f.setSurveyNumber(surveyNumber);
                f.setFarmCode("FRM-" + String.format("%04d", new java.util.Random().nextInt(9999)));
                f.setStatus("VERIFIED");
                f.setLatitude(19.9975);
                f.setLongitude(73.7898);

                Farmer saved = repo.save(f);
                savedFarms.add(saved);
                successful++;

            } catch (Exception ex) {
                java.util.Map<String, Object> err = new java.util.LinkedHashMap<>();
                err.put("row", i + 1);
                err.put("rawLine", line);
                err.put("reason", ex.getMessage());
                errors.add(err);
            }
        }

        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("totalRowsProcessed", totalRows);
        result.put("successfulImports", successful);
        result.put("failedRowsCount", errors.size());
        result.put("errors", errors);
        result.put("importedFarmsCount", savedFarms.size());
        return result;
    }

    public List<Farmer> search(String district, String soilType, String waterSource, String status) {
        List<Farmer> all = getAll();
        return all.stream()
                .filter(f -> district == null || district.trim().isEmpty() || (f.getLocation() != null && f.getLocation().toLowerCase().contains(district.toLowerCase())))
                .filter(f -> soilType == null || soilType.trim().isEmpty() || (f.getSoilType() != null && f.getSoilType().equalsIgnoreCase(soilType)))
                .filter(f -> waterSource == null || waterSource.trim().isEmpty() || (f.getWaterSource() != null && f.getWaterSource().equalsIgnoreCase(waterSource)))
                .filter(f -> status == null || status.trim().isEmpty() || (f.getStatus() != null && f.getStatus().equalsIgnoreCase(status)))
                .toList();
    }
}