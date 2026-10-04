package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Harvest;
import com.example.demo.service.HarvestService;

@RestController
public class HarvestController {

    @Autowired
    private HarvestService service;

    @PostMapping("/harvest/create")
    public Harvest create(@RequestBody Harvest harvest) {
        return service.add(harvest);
    }

    @GetMapping("/harvest/getAll")
    public List<Harvest> getAll() {
        return service.getAll();
    }

    @GetMapping("/harvest/get/{id}")
    public Harvest getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PutMapping("/harvest/update/{id}")
    public Harvest update(
            @PathVariable Integer id,
            @RequestBody Harvest harvest) {
        return service.update(id, harvest);
    }

    @DeleteMapping("/harvest/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
