package com.example.demo.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "farm_documents")
public class FarmDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String documentName;

    // Soil Health Card, Organic Certification, Land Registry / 7/12, Pesticide License, Crop Insurance Policy
    private String category;

    private String fileName;

    private String fileType; // PDF, JPG, PNG, DOCX

    private Long fileSize; // in bytes

    private String owner; // Farmer Name / Uploader

    private String version; // e.g. "v1.0", "v2.1"

    private String status; // ACTIVE, EXPIRING_SOON, EXPIRED

    private LocalDate expiryDate;

    private LocalDateTime uploadDate;

    @Column(length = 1000)
    private String notes;

    public FarmDocument(String documentName, String category, String fileName, String fileType,
                        Long fileSize, String owner, String version, LocalDate expiryDate, String notes) {
        this.documentName = documentName;
        this.category = category;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.owner = owner;
        this.version = version;
        this.expiryDate = expiryDate;
        this.uploadDate = LocalDateTime.now();
        this.notes = notes;
        updateStatus();
    }

    public void updateStatus() {
        if (expiryDate == null) {
            this.status = "ACTIVE";
            return;
        }
        LocalDate now = LocalDate.now();
        if (expiryDate.isBefore(now)) {
            this.status = "EXPIRED";
        } else if (expiryDate.isBefore(now.plusDays(30))) {
            this.status = "EXPIRING_SOON";
        } else {
            this.status = "ACTIVE";
        }
    }
}
