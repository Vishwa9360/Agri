package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.FarmDocument;
import com.example.demo.repo.DocumentRepo;

import jakarta.annotation.PostConstruct;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepo repo;

    @PostConstruct
    public void seedInitialDocuments() {
        if (repo.count() == 0) {
            repo.save(new FarmDocument(
                    "Soil Health Card - Kharif 2026",
                    "Soil Health Card",
                    "soil_health_card_kharif_2026.pdf",
                    "PDF",
                    2457600L,
                    "Ramesh Patel",
                    "v1.0",
                    LocalDate.now().plusMonths(6),
                    "Comprehensive N-P-K and micronutrient profile analyzed by ICAR Labs."
            ));

            repo.save(new FarmDocument(
                    "APEDA Organic Farm Certification",
                    "Organic Certification",
                    "apeda_organic_cert_2026.pdf",
                    "PDF",
                    1843200L,
                    "Ramesh Patel",
                    "v2.1",
                    LocalDate.now().plusDays(15),
                    "Export compliance certificate under NPOP India guidelines. Requires renewal soon."
            ));

            repo.save(new FarmDocument(
                    "PM Fasal Bima Yojana Policy",
                    "Crop Insurance Policy",
                    "pmfby_crop_insurance_policy.pdf",
                    "PDF",
                    3145728L,
                    "Ramesh Patel",
                    "v1.0",
                    LocalDate.now().plusYears(1),
                    "Comprehensive risk coverage for drought, flood, and localized calamities."
            ));

            repo.save(new FarmDocument(
                    "Land Registry 7/12 Record Extract",
                    "Land Registry / 7/12",
                    "land_registry_7_12_nashik.pdf",
                    "PDF",
                    983040L,
                    "Ramesh Patel",
                    "v1.0",
                    null,
                    "Certified government land title for Survey No. 44/2, 15.5 Hectares."
            ));

            repo.save(new FarmDocument(
                    "Bio-Pesticide Storage License",
                    "Pesticide License",
                    "pesticide_handling_license.pdf",
                    "PDF",
                    1258291L,
                    "Ramesh Patel",
                    "v1.0",
                    LocalDate.now().minusDays(10),
                    "Annual storage and application safety license. Renewal overdue."
            ));
        }
    }

    public List<FarmDocument> getAll() {
        List<FarmDocument> docs = repo.findAllByOrderByUploadDateDesc();
        // Dynamically recheck status based on current date
        for (FarmDocument doc : docs) {
            doc.updateStatus();
        }
        return repo.saveAll(docs);
    }

    public FarmDocument getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public FarmDocument saveDocument(FarmDocument doc) {
        doc.updateStatus();
        return repo.save(doc);
    }

    public void deleteDocument(Integer id) {
        repo.deleteById(id);
    }
}
