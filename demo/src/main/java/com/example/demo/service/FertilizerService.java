package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Fertilizer;
import com.example.demo.repo.FertilizerRepo;

@Service
public class FertilizerService {

    @Autowired
    private FertilizerRepo repo;

    private void computeSafeHarvest(Fertilizer fertilizer) {
        String baseDateStr = fertilizer.getApplicationDate() != null && !fertilizer.getApplicationDate().isEmpty()
                ? fertilizer.getApplicationDate()
                : (fertilizer.getAppliedDate() != null ? fertilizer.getAppliedDate() : null);
        if (baseDateStr != null) {
            try {
                java.time.LocalDate date = java.time.LocalDate.parse(baseDateStr.substring(0, 10));
                int phi = fertilizer.getPhiDays() > 0 ? fertilizer.getPhiDays() : 14;
                fertilizer.setSafeHarvestDate(date.plusDays(phi).toString());
            } catch (Exception ignored) {
                fertilizer.setSafeHarvestDate(java.time.LocalDate.now().plusDays(fertilizer.getPhiDays()).toString());
            }
        }
    }

    public Fertilizer add(Fertilizer fertilizer) {
        fertilizer.setId(null);
        computeSafeHarvest(fertilizer);
        return repo.save(fertilizer);
    }

    public List<Fertilizer> getAll() {
        return repo.findAll();
    }

    public Fertilizer getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public Fertilizer update(Integer id, Fertilizer fertilizer) {
        Fertilizer data = repo.findById(id).orElse(null);

        if (data != null) {
            data.setFertilizerName(fertilizer.getFertilizerName());
            data.setFertilizerType(fertilizer.getFertilizerType());
            data.setCropName(fertilizer.getCropName());
            data.setQuantity(fertilizer.getQuantity());
            data.setApplicationDate(fertilizer.getApplicationDate());
            data.setStatus(fertilizer.getStatus());
            data.setPhiDays(fertilizer.getPhiDays());
            computeSafeHarvest(data);

            return repo.save(data);
        }

        return null;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Fertilizer Schedule Deleted Successfully";
    }
}
