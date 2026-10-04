package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.AuditLog;
import com.example.demo.repo.AuditLogRepo;

import jakarta.annotation.PostConstruct;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepo repo;

    @PostConstruct
    public void seedInitialLogs() {
        if (repo.count() == 0) {
            repo.save(new AuditLog(1, "LOGIN", "USER", "1", "Farmer logged in successfully"));
            repo.save(new AuditLog(1, "CREATE", "FARM", "1", "Farm 'Green Valley Farm' registered"));
            repo.save(new AuditLog(1, "CREATE", "CROP", "1", "Crop season for 'Basmati Rice' initialized"));
            repo.save(new AuditLog(1, "UPDATE", "SENSOR", "1", "Soil Moisture threshold configured"));
            repo.save(new AuditLog(1, "CREATE", "IRRIGATION", "1", "Drip irrigation scheduled for North Field"));
        }
    }

    public AuditLog log(Integer userId, String action, String entity, String entityId, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId != null ? userId : 0);
        auditLog.setAction(action);
        auditLog.setEntity(entity);
        auditLog.setEntityId(entityId);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLog.setDetails(details);
        return repo.save(auditLog);
    }

    public List<AuditLog> getAll() {
        return repo.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getByUserId(Integer userId) {
        return repo.findByUserIdOrderByTimestampDesc(userId);
    }
}
