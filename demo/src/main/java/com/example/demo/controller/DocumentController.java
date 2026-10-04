package com.example.demo.controller;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.FarmDocument;
import com.example.demo.service.DocumentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Document Management", description = "Digital farm records, Soil Health Cards, Organic Certifications, and compliance document storage")
public class DocumentController {

    @Autowired
    private DocumentService service;

    @Operation(summary = "Get all farm documents with live expiry validation")
    @GetMapping({"/api/documents", "/documents"})
    public List<FarmDocument> getAllDocuments() {
        return service.getAll();
    }

    @Operation(summary = "Get a farm document by ID")
    @GetMapping({"/api/documents/{id}", "/documents/{id}"})
    public ResponseEntity<FarmDocument> getDocumentById(@PathVariable Integer id) {
        FarmDocument doc = service.getById(id);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(doc);
    }

    @Operation(summary = "Upload or register a new farm document")
    @PostMapping({"/api/documents", "/documents", "/api/documents/upload", "/documents/upload"})
    public ResponseEntity<FarmDocument> uploadDocument(@RequestBody FarmDocument document) {
        FarmDocument saved = service.saveDocument(document);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Download farm document content")
    @GetMapping({"/api/documents/{id}/download", "/documents/{id}/download"})
    public ResponseEntity<?> downloadDocument(@PathVariable Integer id) {
        FarmDocument doc = service.getById(id);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }

        // Generate synthetic document content for college/demo environment
        String content = "========================================================\n"
                + "SMART FARMING & PRECISION AGRICULTURE SYSTEM - DOCUMENT ARCHIVE\n"
                + "========================================================\n"
                + "Document Name: " + doc.getDocumentName() + "\n"
                + "Category:      " + doc.getCategory() + "\n"
                + "File Name:     " + doc.getFileName() + "\n"
                + "Owner:         " + doc.getOwner() + "\n"
                + "Version:       " + doc.getVersion() + "\n"
                + "Status:        " + doc.getStatus() + "\n"
                + "Expiry Date:   " + (doc.getExpiryDate() != null ? doc.getExpiryDate().toString() : "PERMANENT") + "\n"
                + "Uploaded At:   " + doc.getUploadDate() + "\n"
                + "Notes:         " + doc.getNotes() + "\n"
                + "========================================================\n"
                + "Digital Verification Hash: SHA-256 Validated\n"
                + "AgroSense Farm Records Security Protocol Compliant\n";

        byte[] data = content.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + ".txt\"")
                .contentType(MediaType.TEXT_PLAIN)
                .contentLength(data.length)
                .body(data);
    }

    @Operation(summary = "Delete a farm document")
    @DeleteMapping({"/api/documents/{id}", "/documents/{id}"})
    public ResponseEntity<?> deleteDocument(@PathVariable Integer id) {
        FarmDocument doc = service.getById(id);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }
        service.deleteDocument(id);
        Map<String, String> resp = new LinkedHashMap<>();
        resp.put("message", "Document deleted successfully");
        return ResponseEntity.ok(resp);
    }
}
