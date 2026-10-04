package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class AuthModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String username;

    @Column(name = "phone_number", length = 10)
    private String phoneNumber;

    @Column(unique = true)
    private String email;

    @Column(name = "password_hash")
    private String password;

    private String role;

    private LocalDateTime createdDate;

    private LocalDateTime lastLogin;

    private Boolean isActive = true;

    private String clusterCode;

    private String approvalStatus = "APPROVED";

    private Integer failedLoginAttempts = 0;

    private LocalDateTime lockoutUntil;

    private String otpCode;

    private LocalDateTime otpExpiry;
}