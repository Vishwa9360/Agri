package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.SmartModel;
import com.example.demo.repo.SmartRepo;

@Service
public class SmartService {

    @Autowired
    private SmartRepo repo;

    public SmartModel add(SmartModel smart) {

        smart.setId(null);

        return repo.save(smart);
    }

    public List<SmartModel> getAll() {

        return repo.findAll();
    }

    public SmartModel getById(Integer id) {

        return repo.findById(id).orElse(null);
    }

    public SmartModel update(Integer id, SmartModel smart) {

        SmartModel data = repo.findById(id).orElse(null);

        if (data != null) {

            data.setName(smart.getName());
            data.setNum(smart.getNum());

            return repo.save(data);
        }

        return null;
    }

    public String delete(Integer id) {

        repo.deleteById(id);

        return "Smart Farming Record Deleted Successfully";
    }
}