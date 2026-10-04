package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.SmartModel;
import com.example.demo.service.SmartService;


@RestController
public class SmartController {

    @Autowired
    private SmartService service;

    @PostMapping("/create")
    public SmartModel create(@RequestBody SmartModel smart) {

        return service.add(smart);
    }

    @GetMapping("/getAll")
    public List<SmartModel> getAll() {

        return service.getAll();
    }

    @GetMapping("/get/{id}")
    public SmartModel getById(@PathVariable Integer id) {

        return service.getById(id);
    }

    @PutMapping("/update/{id}")
    public SmartModel update(
            @PathVariable Integer id,
            @RequestBody SmartModel smart) {

        return service.update(id, smart);
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Integer id) {

        return service.delete(id);
    }
}