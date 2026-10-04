# Smart Farming and Precision Agriculture Management System (AgroSense)

An enterprise-grade, IoT-driven Smart Agriculture Management platform built with **Spring Boot 3.x (Java 17+)**, **React.js (Vite)**, and **MySQL 8.0**, adhering strictly to the official Software Requirements Specification (SRS).

---

## 1. Project Overview
Modern agriculture requires data-driven decision making to manage water scarcity, volatile fertilizer prices, pest outbreaks, and climate change. The **AgroSense Smart Farming Platform** bridges traditional farm practices and precision agriculture by integrating:
- **GIS Farm Parcel Registration** with duplicate farm prevention and strict format validation.
- **Crop Season Life-Cycle Planning** with variety benchmarks and harvest yield tracking.
- **IoT Soil & Weather Telemetry** for real-time monitoring of Soil Moisture, Ambient Temperature, Humidity, pH, and N-P-K concentrations.
- **Automated Precision Irrigation** with scheduled drip cycles and moisture-triggered automation.
- **Soil Nutrition & Fertilizer Advisory Engine** calculating crop-stage specific N-P-K dosage.
- **Predictive Pest & Disease Alerts** with bio-fungicide and pesticide recommendations.
- **Drone Aerial Surveillance** missions tracking multispectral NDVI vegetation indexes.
- **APMC Mandi Wholesale Rates** with daily modal price tracking across agricultural commodities.
- **Farm Financial & Yield Analytics** with profitability calculations, cost breakdowns, and instant CSV report export.
- **Digital Document Vault** archiving Soil Health Cards, Organic Certifications, and Land 7/12 extracts with automated expiry tracking (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`).
- **In-App Notification Center** with real-time topbar alerts and mark-as-read workflows.
- **Role-Based Access Control (RBAC)** across 5 user roles (`Farmer`, `Field Officer`, `Agricultural Officer`, `Admin`, `Guest`).
- **Cryptographic Security** utilizing BCrypt password hashing, HMAC-SHA256 JWT tokens, and immutable database audit trails.

---

## 2. Technology Stack
| Layer | Technologies |
| :--- | :--- |
| **Backend** | Spring Boot 3.x / 4.x, Java 17 LTS, Spring Security 6.x, Spring Data JPA / Hibernate |
| **Frontend** | React 18 / 19, Vite, React Router DOM v6, Axios |
| **Database** | MySQL 8.0 Community Server (with PostgreSQL 14+ JPA portability) |
| **Authentication**| JSON Web Tokens (io.jsonwebtoken:jjwt 0.12.6, HMAC-SHA256) + BCrypt |
| **API Documentation**| SpringDoc OpenAPI 3.0 / Swagger UI (v3.2.0) with JWT Bearer Security Scheme |
| **Testing** | JUnit 5, Mockito 5, Spring Boot Test |
| **DevOps / Deployment**| Docker, Docker Compose, Nginx Alpine |
| **Ports** | Backend: `8080`, Frontend: `8081` (Vite) / `5173` (Docker), MySQL: `3306` |

---

## 3. Project Folder Structure
```
Smart-Farming/
├── docker-compose.yml              # Multi-container orchestration (MySQL, Backend, Frontend)
├── README.md                       # Complete technical & setup documentation
├── PROJECT_REPORT.md               # 24-chapter SRS architectural compliance report
├── demo/                           # Spring Boot 3.x Backend (Port 8080)
│   ├── Dockerfile                  # Multi-stage Eclipse Temurin JDK 17 build
│   ├── pom.xml                     # Maven dependencies (Security, JWT, SpringDoc, JPA)
│   ├── mvnw.cmd / mvnw             # Maven Wrappers
│   └── src/
│       ├── main/
│       │   ├── java/com/example/demo/
│       │   │   ├── config/         # SwaggerConfig.java, CorsConfig.java
│       │   │   ├── controller/     # 16 REST Controllers (Auth, Farmer, Crop, Sensor, etc.)
│       │   │   ├── exception/      # Custom Exceptions & GlobalExceptionHandler
│       │   │   ├── model/          # 15 JPA Entities (Farmer, Crop, Sensor, AuditLog, etc.)
│       │   │   ├── repo/           # 15 Spring Data JPA Repositories
│       │   │   ├── security/       # JwtService, JwtAuthenticationFilter, SecurityConfig
│       │   │   └── service/        # 12 Business logic & calculation services
│       │   └── resources/
│       │       └── application.properties  # Database URL, Hibernate, and JWT Secret
│       └── test/java/com/example/demo/     # JUnit 5 & Mockito test suites (14 tests)
└── frontend/                       # React.js Frontend (Port 8081)
    ├── Dockerfile                  # Multi-stage Node build + Nginx Alpine
    ├── nginx.conf                  # Nginx reverse proxy configuration
    ├── package.json                # React, Vite, Axios, React-Router-DOM
    ├── vite.config.js              # Vite server port configured to 8081
    └── src/
        ├── components/             # Layout.jsx (Collapsible Sidebar, Notifications Dropdown)
        ├── pages/                  # 13 Views (Dashboard, Farms, Crops, Admin, Documents, etc.)
        └── services/               # api.js (Axios instance with Bearer JWT Interceptor)
```

---

## 4. Requirements & Prerequisites
- **Java Development Kit**: JDK 17 LTS or higher
- **Node.js**: Node.js v18+ or v20+ with `npm`
- **Database**: MySQL 8.0+ running on `localhost:3306`
- **Docker** (Optional for containerized run): Docker Desktop 4.x+

---

## 5. Database Setup (MySQL 8)
1. Ensure your MySQL 8 server is running on `localhost:3306`.
2. Connect to MySQL and create the database `demo`:
   ```sql
   CREATE DATABASE IF NOT EXISTS demo;
   ```
3. Default credentials configured in `application.properties`:
   - Username: `root`
   - Password: `root`
   - Database: `demo`
4. The backend uses `spring.jpa.hibernate.ddl-auto=update`, which automatically generates and updates all required tables upon starting.

---

## 6. Environment Variables
The application supports environment variable overrides with secure fallbacks:
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `localhost` (in Docker: `mysql`) | MySQL hostname |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `demo` | Database name |
| `DB_USERNAME` | `root` | MySQL user |
| `DB_PASSWORD` | `root` | MySQL password |
| `JWT_SECRET` | `SmartFarmingProjectSecretKeyForJwtAuthentication2026With256BitsMinimum` | 256-bit HS256 JWT key |

---

## 7. Local Backend Startup
Navigate to the `demo` directory and run the Maven wrapper:

**Windows (PowerShell / Command Prompt):**
```powershell
cd demo
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**
```bash
cd demo
chmod +x ./mvnw
./mvnw spring-boot:run
```
The backend starts on `http://localhost:8080`.

---

## 8. Local Frontend Startup
Navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```
The frontend dev server launches on `http://localhost:8081` (per SRS Section 2).

---

## 9. Docker Containerized Startup
To launch the entire platform (MySQL 8 + Spring Boot Backend + React/Nginx Frontend) in Docker:

```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- MySQL: Port `3306`

To shut down:
```bash
docker-compose down
```

---

## 10. Default Demo Accounts & Roles
The system auto-seeds realistic users and operational records into MySQL. You can use the topbar Role Switcher or log in with these roles:

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `Admin@123` | Full system access, user role changes, account activate/deactivate, audit log |
| **Farmer** | `farmer_ramesh` | `Password@123` | Farm registration, crop planning, sensors, irrigation, yield analytics |
| **Agricultural Officer** | `officer_sharma` | `Password@123` | Full yield analytics, crop scheduling, disease advisories, farmer inspections |
| **Field Officer** | `field_kumar` | `Password@123` | Field surveillance, sensor verification, drone scouting, farmer assistance |
| **Guest** | `guest` | `Guest@123` | Read-only public agricultural, mandi, and weather information |

---

## 11. API Documentation (Swagger / OpenAPI 3.0)
Interactive Swagger UI is accessible at:
```
http://localhost:8080/swagger-ui/index.html
```
- OpenAPI JSON Spec: `http://localhost:8080/v3/api-docs`
- **Testing Protected APIs**: Click the **"Authorize"** button at the top-right of the Swagger page, enter `Bearer <your_jwt_token>`, and test any secured API directly!

---

## 12. Testing Commands

### Backend Automated Test Suite (JUnit 5 + Mockito):
```powershell
cd demo
.\mvnw.cmd test
```
**Results**: 14 tests run, 0 failures, 0 errors, 100% passing (`BUILD SUCCESS`).
- `AuthServiceTest`: Validates registration, BCrypt password hashing, invalid name/phone/email validation, duplicate detection.
- `JwtServiceTest`: Validates HS256 signature generation, payload claim decoding, role extraction.
- `FarmerServiceTest`: Validates farm registration, SecurityContext principal injection, duplicate farm conflict detection.
- `DemoApplicationTests`: Verifies Spring Boot application context startup and Hibernate schema creation.

### Frontend ESLint & Build Verification:
```bash
cd frontend
npm run lint
npm run build
```
**Results**: 0 errors, production bundle compiled cleanly in `< 250ms`.

---

## 13. Important Features & SRS Mapping
1. **Multi-Step User Registration (`Register.jsx`)**: Step 1 (Identity), Step 2 (Role & Scope), Step 3 (Security & real-time password strength meter).
2. **Strict Format Validation (SRS Appendix C & E)**:
   - Name: Alphabetic characters and spaces only (`^[a-zA-Z\s]{2,100}$`) $\rightarrow$ `InvalidNameException` (HTTP 400).
   - Phone: Exactly 10 digits (`^[0-9]{10}$`) $\rightarrow$ `InvalidPhoneException` (HTTP 400).
   - Duplicate Farm: Duplicate unique farm name prevention $\rightarrow$ `DuplicateFarmException` (HTTP 409).
   - Role Security: Access outside role permissions $\rightarrow$ `UnauthorisedAccessException` (HTTP 403).
   - Not Found: Record not found $\rightarrow$ `ResourceNotFoundException` (HTTP 404).
3. **Collapsible Responsive Navigation**: Smooth `270px` $\leftrightarrow$ `70px` transition, topbar hamburger toggle, mobile off-canvas drawer overlay on screens $\le 800\text{px}$.
4. **Interactive In-App Notification Center**: Topbar 🔔 bell with unread badge counter, alert popover, and mark-as-read actions.
5. **Farm Document Repository (`Documents.jsx`)**: Digital storage for Soil Health Cards, APEDA Organic Certifications, PM Fasal Bima policies, and Land 7/12 extracts with automated expiry calculation (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`) and direct text-stream download.
6. **System Administration & Audit Control (`AdminPanel.jsx`)**: Admin dashboard displaying user management table with instant role dropdowns, account activation/deactivation buttons, and searchable audit logs.
7. **Farm Profitability Analytics (`Analytics.jsx`)**: Real-time yield benchmarks, input cost allocation bars, crop profitability table, and one-click instant CSV report export.

---

## 14. Known Limitations & Development Classifications (Honesty Rule)
Per SRS Section 45, real-world hardware and external commercial infrastructure are classified as:
- **IoT Sensors**: High-fidelity simulator generating real-world physiological ranges (physical hardware probes not included in software repo).
- **Agricultural Drones**: Simulated multispectral NDVI flight telemetry generator.
- **APMC Mandi Wholesale Rates**: Simulated daily modal wholesale price dataset modeled on Agmarknet India.
- **SMS / Email Gateway**: Handled through working in-app notifications and simulated email verification (external Twilio/SendGrid API keys not hardcoded).

---

## 15. Future Enhancement Roadmap (SRS Appendix G)
- **Phase 2**: Native iOS & Android applications with offline SQLite sync for rural field workers.
- **Phase 3**: Computer vision convolutional neural network (CNN) for automated crop disease diagnosis from camera photos.
- **Phase 4**: Hyper-local satellite multispectral NDVI vegetation indexing and weather radar integration.
- **Phase 5**: Blockchain-enabled supply chain provenance tracking from farm harvest to consumer retail.

---

## License
© 2024–2026 Smart Farming and Precision Agriculture Management System (*AgroSense*). All rights reserved.
Developed for academic examination and precision agriculture research.
