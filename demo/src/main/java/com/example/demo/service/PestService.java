package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.PestAlert;
import com.example.demo.repo.PestRepo;

@Service
public class PestService {

    @Autowired
    private PestRepo repo;

    public PestAlert add(PestAlert alert) {
        alert.setId(null);
        return repo.save(alert);
    }

    public List<PestAlert> getAll() {
        return repo.findAll();
    }

    public PestAlert getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public PestAlert update(Integer id, PestAlert alert) {
        PestAlert data = repo.findById(id).orElse(null);

        if (data != null) {
            data.setCropName(alert.getCropName());
            data.setPestName(alert.getPestName());
            data.setSeverity(alert.getSeverity());
            data.setAffectedArea(alert.getAffectedArea());
            data.setSymptoms(alert.getSymptoms());
            data.setRecommendation(alert.getRecommendation());
            data.setDetectionDate(alert.getDetectionDate());
            data.setStatus(alert.getStatus());

            return repo.save(data);
        }

        return null;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Pest Alert Deleted Successfully";
    }
}
