package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Irrigation;
import com.example.demo.repo.IrrigationRepo;

@Service
public class IrrigationService {

    @Autowired
    private IrrigationRepo repo;

    public Irrigation add(Irrigation irrigation) {
        irrigation.setId(null);
        return repo.save(irrigation);
    }

    public List<Irrigation> getAll() {
        return repo.findAll();
    }

    public Irrigation getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public Irrigation update(Integer id, Irrigation irrigation) {
        Irrigation data = repo.findById(id).orElse(null);

        if (data != null) {
            data.setIrrigationType(irrigation.getIrrigationType());
            data.setFieldName(irrigation.getFieldName());
            data.setWaterAmount(irrigation.getWaterAmount());
            data.setIrrigationDate(irrigation.getIrrigationDate());
            data.setStatus(irrigation.getStatus());

            return repo.save(data);
        }

        return null;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Irrigation Record Deleted Successfully";
    }

    public Irrigation cancel(Integer id) {
        Irrigation data = repo.findById(id)
                .orElseThrow(() -> new com.example.demo.exception.ResourceNotFoundException("Irrigation record not found with id: " + id));
        data.setStatus("CANCELLED");
        return repo.save(data);
    }

    public Irrigation reschedule(Integer id, String newDate, Integer durationMinutes) {
        Irrigation data = repo.findById(id)
                .orElseThrow(() -> new com.example.demo.exception.ResourceNotFoundException("Irrigation record not found with id: " + id));
        if (newDate != null && !newDate.trim().isEmpty()) {
            data.setIrrigationDate(newDate);
        }
        if (durationMinutes != null && durationMinutes > 0) {
            data.setDurationMinutes(durationMinutes);
        }
        data.setStatus("RESCHEDULED");
        return repo.save(data);
    }
}