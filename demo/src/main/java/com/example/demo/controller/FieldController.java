package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Field;
import com.example.demo.service.FieldService;

@RestController
public class FieldController {

    @Autowired
    private FieldService service;

    @PostMapping("/field/create")
    public Field create(@RequestBody Field field) {
        return service.add(field);
    }

    @GetMapping("/field/getAll")
    public List<Field> getAll() {
        return service.getAll();
    }

    @GetMapping("/field/get/{id}")
    public Field getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PutMapping("/field/update/{id}")
    public Field update(
            @PathVariable Integer id,
            @RequestBody Field field) {
        return service.update(id, field);
    }

    @DeleteMapping("/field/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}