package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Crop;
import com.example.demo.repo.CropRepo;

@Service
public class CropService {

    @Autowired
    private CropRepo repo;

    public Crop add(Crop crop) {
        crop.setId(null);
        return repo.save(crop);
    }

    public List<Crop> getAll() {
        return repo.findAll();
    }

    public Crop getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public Crop update(Integer id, Crop crop) {
        Crop data = repo.findById(id).orElse(null);

        if (data != null) {
            data.setCropName(crop.getCropName());
            data.setCropType(crop.getCropType());
            data.setSeason(crop.getSeason());
            data.setSoilType(crop.getSoilType());
            data.setQuantity(crop.getQuantity());
            if (crop.getFarmId() != null) data.setFarmId(crop.getFarmId());
            if (crop.getVariety() != null) data.setVariety(crop.getVariety());
            if (crop.getSowingDate() != null) data.setSowingDate(crop.getSowingDate());
            if (crop.getExpectedHarvestDate() != null) data.setExpectedHarvestDate(crop.getExpectedHarvestDate());
            if (crop.getAreaAcres() != null) data.setAreaAcres(crop.getAreaAcres());
            if (crop.getStatus() != null) data.setStatus(crop.getStatus());
            if (crop.getTargetYield() != null) data.setTargetYield(crop.getTargetYield());
            if (crop.getActualYield() != null) data.setActualYield(crop.getActualYield());

            return repo.save(data);
        }

        return null;
    }

    public Crop updateStage(Integer id, String newStage) {
        Crop data = repo.findById(id).orElse(null);
        if (data != null && newStage != null) {
            data.setStatus(newStage);
            return repo.save(data);
        }
        return data;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Crop Deleted Successfully";
    }
}