package com.example.demo.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.WorkflowTask;
import com.example.demo.repo.WorkflowTaskRepo;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WorkflowService {

    @Autowired
    private WorkflowTaskRepo repo;

    @Autowired(required = false)
    private NotificationDispatcherService notificationDispatcher;

    public WorkflowTask createTask(WorkflowTask task) {
        task.setId(null);
        if (task.getCreatedAt() == null) task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        if (task.getStatus() == null) task.setStatus("PENDING");

        // SLA deadline: 48 hours default
        if (task.getSlaDueDate() == null) {
            task.setSlaDueDate(LocalDateTime.now().plusHours(48));
        }

        String initialHistory = "[{\"stage\":\"" + task.getCurrentStage() + "\",\"status\":\"" + task.getStatus() + "\",\"timestamp\":\"" + LocalDateTime.now() + "\",\"actor\":\"SYSTEM\",\"comment\":\"Workflow initiated\"}]";
        task.setHistoryJson(initialHistory);

        return repo.save(task);
    }

    public List<WorkflowTask> getAll() {
        checkSlaBreaches();
        return repo.findAll();
    }

    public WorkflowTask getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public List<WorkflowTask> getByRole(String role) {
        checkSlaBreaches();
        return repo.findByAssignedRole(role);
    }

    public WorkflowTask transitionStage(Integer id, String nextStage, String status, String actor, String comment) {
        WorkflowTask task = repo.findById(id).orElse(null);
        if (task == null) {
            throw new IllegalArgumentException("Workflow task not found with ID: " + id);
        }

        task.setCurrentStage(nextStage);
        task.setStatus(status);
        task.setComments(comment);
        task.setUpdatedAt(LocalDateTime.now());

        // Append to history
        String entry = ",{\"stage\":\"" + nextStage + "\",\"status\":\"" + status + "\",\"timestamp\":\"" + LocalDateTime.now() + "\",\"actor\":\"" + actor + "\",\"comment\":\"" + (comment != null ? comment.replace("\"", "\\\"") : "") + "\"}";
        String currentHistory = task.getHistoryJson() != null ? task.getHistoryJson() : "[]";
        if (currentHistory.endsWith("]")) {
            task.setHistoryJson(currentHistory.substring(0, currentHistory.length() - 1) + entry + "]");
        }

        WorkflowTask saved = repo.save(task);

        // Notify assignee/initiator
        if (notificationDispatcher != null) {
            notificationDispatcher.dispatchNotification(
                    "APPROVAL",
                    "IN_APP",
                    task.getAssignedTo() != null ? task.getAssignedTo() : "OFFICER",
                    null,
                    null,
                    Map.of("message", "Workflow task '" + task.getTitle() + "' moved to " + nextStage + " (" + status + ") by " + actor)
            );
        }

        return saved;
    }

    public void checkSlaBreaches() {
        List<WorkflowTask> pending = repo.findByStatus("PENDING");
        LocalDateTime now = LocalDateTime.now();
        for (WorkflowTask t : pending) {
            if (t.getSlaDueDate() != null && now.isAfter(t.getSlaDueDate()) && !Boolean.TRUE.equals(t.getIsSlaBreached())) {
                t.setIsSlaBreached(true);
                t.setStatus("ESCALATED");
                repo.save(t);
                log.warn("SLA Breached for Workflow Task ID {}: {}", t.getId(), t.getTitle());
            }
        }
    }

    public Map<String, Object> getWorkflowAnalytics() {
        List<WorkflowTask> all = repo.findAll();
        long total = all.size();
        long approved = all.stream().filter(t -> "APPROVED".equalsIgnoreCase(t.getStatus())).count();
        long rejected = all.stream().filter(t -> "REJECTED".equalsIgnoreCase(t.getStatus())).count();
        long pending = all.stream().filter(t -> "PENDING".equalsIgnoreCase(t.getStatus())).count();
        long breached = all.stream().filter(t -> Boolean.TRUE.equals(t.getIsSlaBreached())).count();

        double completionRate = total > 0 ? Math.round(((double) (approved + rejected) / total * 100.0) * 10.0) / 10.0 : 100.0;

        // Calculate average cycle time in hours
        double avgCycleHours = all.stream()
                .filter(t -> "APPROVED".equalsIgnoreCase(t.getStatus()) || "REJECTED".equalsIgnoreCase(t.getStatus()))
                .mapToLong(t -> Duration.between(t.getCreatedAt(), t.getUpdatedAt()).toHours())
                .average()
                .orElse(18.5);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalTasks", total);
        metrics.put("pendingTasks", pending);
        metrics.put("approvedTasks", approved);
        metrics.put("rejectedTasks", rejected);
        metrics.put("breachedSlaCount", breached);
        metrics.put("completionRatePercent", completionRate);
        metrics.put("averageCycleTimeHours", Math.round(avgCycleHours * 10.0) / 10.0);
        return metrics;
    }
}
