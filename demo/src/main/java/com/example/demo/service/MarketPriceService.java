package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.MarketPrice;
import com.example.demo.repo.MarketPriceRepo;

import jakarta.annotation.PostConstruct;

@Service
public class MarketPriceService {

    @Autowired
    private MarketPriceRepo repo;

    @PostConstruct
    public void seedInitialData() {
        if (repo.count() == 0) {
            repo.save(new MarketPrice(null, "Wheat", "Nashik Mandi", "Maharashtra", 2050.0, 2250.0, 2150.0, "+2.4%", "2026-09-04"));
            repo.save(new MarketPrice(null, "Basmati Rice", "Karnal APMC", "Haryana", 3600.0, 4100.0, 3850.0, "+1.8%", "2026-09-04"));
            repo.save(new MarketPrice(null, "Cotton", "Rajkot Mandi", "Gujarat", 6500.0, 7100.0, 6800.0, "-0.8%", "2026-09-04"));
            repo.save(new MarketPrice(null, "Soybean", "Indore APMC", "Madhya Pradesh", 4450.0, 4800.0, 4650.0, "+3.2%", "2026-09-04"));
            repo.save(new MarketPrice(null, "Maize", "Davangere Mandi", "Karnataka", 1950.0, 2180.0, 2050.0, "+0.5%", "2026-09-04"));
            repo.save(new MarketPrice(null, "Tomato", "Coimbatore Mandi", "Tamil Nadu", 1600.0, 2100.0, 1800.0, "+4.1%", "2026-09-04"));
        }
    }

    public MarketPrice add(MarketPrice price) {
        price.setId(null);
        return repo.save(price);
    }

    public List<MarketPrice> getAll() {
        return repo.findAll();
    }

    public MarketPrice getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public MarketPrice update(Integer id, MarketPrice price) {
        MarketPrice data = repo.findById(id).orElse(null);

        if (data != null) {
            data.setCommodityName(price.getCommodityName());
            data.setMandiName(price.getMandiName());
            data.setState(price.getState());
            data.setMinPrice(price.getMinPrice());
            data.setMaxPrice(price.getMaxPrice());
            data.setModalPrice(price.getModalPrice());
            data.setPriceTrend(price.getPriceTrend());
            data.setPriceDate(price.getPriceDate());

            return repo.save(data);
        }

        return null;
    }

    public String delete(Integer id) {
        repo.deleteById(id);
        return "Market Price Record Deleted Successfully";
    }
}
