package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.MarketPrice;
import com.example.demo.service.MarketPriceService;

@RestController
public class MarketPriceController {

    @Autowired
    private MarketPriceService service;

    @Autowired
    private com.example.demo.service.ExternalMarketPriceService externalMarketPriceService;

    @PostMapping("/market/create")
    public MarketPrice create(@RequestBody MarketPrice price) {
        return service.add(price);
    }

    @GetMapping({"/api/market-prices", "/market/getAll"})
    public List<MarketPrice> getAll() {
        return service.getAll();
    }

    @GetMapping("/api/market-prices/live")
    public java.util.Map<String, Object> getLivePrices(
            @RequestParam(required = false) String commodity,
            @RequestParam(required = false) String state) {
        return externalMarketPriceService.getLiveMarketPrices(commodity, state);
    }

    @GetMapping("/market/get/{id}")
    public MarketPrice getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PutMapping("/market/update/{id}")
    public MarketPrice update(
            @PathVariable Integer id,
            @RequestBody MarketPrice price) {
        return service.update(id, price);
    }

    @DeleteMapping("/market/delete/{id}")
    public String delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
