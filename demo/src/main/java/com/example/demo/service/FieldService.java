package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Field;
import com.example.demo.repo.FieldRepo;

@Service
public class FieldService {

    @Autowired
    private FieldRepo repo;

    public Field add(Field field) {
        field.setId(null);
        return repo.save(field);
    }

    public List<Field> getAll() {
        return repo.findAll();
    }

    public Field getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public Field update(Integer id, Field field) {
        Field data = repo.findById(id).orElse(null);

        if (data != null) {
            data.setFieldName(field.getFieldName());
            data.setLocation(field.getLocation());
            data.setArea(field.getArea());
            data.setSoilType(field.getSoilType());
            data.setCropName(field.getCropName());

            return repo.save(data);
        }

        return null;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Field Deleted Successfully";
    }
}