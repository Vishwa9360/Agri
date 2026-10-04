package com.example.demo.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.model.RolePermission;

@Repository
public interface RolePermissionRepo extends JpaRepository<RolePermission, Integer> {
    List<RolePermission> findByRole(String role);
}
