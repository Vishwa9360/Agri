package com.example.demo.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "AgroSense - Smart Farming & Precision Agriculture API",
        version = "3.2.0",
        description = "Enterprise-grade REST API for IoT-driven Precision Agriculture, Multi-Role RBAC, Farm Management, Crop Life-Cycle Planning, Soil Telemetry, Drone Missions, Mandi Market Rates, In-App Notifications, Digital Document Vault, and System Audit Logging.",
        contact = @Contact(
            name = "AgroSense Engineering Team",
            email = "support@agrosense-farming.com"
        ),
        license = @License(
            name = "Apache 2.0",
            url = "https://www.apache.org/licenses/LICENSE-2.0"
        )
    ),
    security = {
        @SecurityRequirement(name = "bearerAuth")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer",
    description = "Enter JWT Bearer token obtained from /api/auth/login or /auth/login"
)
public class SwaggerConfig {

}