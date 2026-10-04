package com.example.demo.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.model.AuthModel;

@Repository
public interface AuthRepo extends JpaRepository<AuthModel, Integer> {

    Optional<AuthModel> findByUsername(String username);

    Optional<AuthModel> findByEmail(String email);

    @Query("SELECT u FROM AuthModel u WHERE u.username = :identifier OR u.email = :identifier")
    Optional<AuthModel> findByUsernameOrEmail(@Param("identifier") String identifier);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}