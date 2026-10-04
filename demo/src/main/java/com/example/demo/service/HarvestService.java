package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Harvest;
import com.example.demo.repo.HarvestRepo;

@Service
public class HarvestService {

    @Autowired
    private HarvestRepo repo;

    public Harvest add(Harvest harvest) {
        harvest.setId(null);
        return repo.save(harvest);
    }

    public List<Harvest> getAll() {
        return repo.findAll();
    }

    public Harvest getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public Harvest update(Integer id, Harvest harvest) {
        Harvest data = repo.findById(id).orElse(null);

        if (data != null) {
            data.setCropName(harvest.getCropName());
            data.setFieldName(harvest.getFieldName());
            data.setQuantity(harvest.getQuantity());
            data.setHarvestDate(harvest.getHarvestDate());
            data.setQuality(harvest.getQuality());

            return repo.save(data);
        }

        return null;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Harvest Deleted Successfully";
    }
}