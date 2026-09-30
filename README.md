# Military Asset Management System

A full-stack, enterprise-grade software engineering project focused on asset and accountability logistics for a fictional military context.

## Overview
This system provides secure, role-based tracking of military logistics across multiple bases. It ensures precise accountability of equipment inventory via Purchases, Transfers, Assignments, and Expenditures. All critical actions are recorded in a read-only Audit Log.

## Features
- **Stateless JWT Authentication** with BCrypt password hashing.
- **Role-Based Access Control (RBAC)**: Admin, Base Commander, and Logistics Officer roles enforcing data isolation.
- **Dynamic Dashboard**: Real-time Opening Balance, Net Movement, and Closing Balance calculations.
- **Asset Logistics Workflows**: Track Purchases, Base-to-Base Transfers, Personnel Assignments, and Expenditures.
- **Audit Logging**: Comprehensive traceability for every transaction.

## Architecture
- **Frontend**: React (Vite), React Router, Axios, Bootstrap, Recharts.
- **Backend**: Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, JWT.
- **Database**: MySQL 8+ with a normalized relational schema.

## Prerequisites
- Node.js (v18+)
- Java JDK 17+
- Maven
- MySQL 8+

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client.
2. Run the provided database dump:
```bash
mysql -u root -p < database/military_asset_management.sql
```
This will create the schema and populate the demo data.

### 2. Backend Setup
1. Navigate to the `backend/` directory.
2. Ensure `application.properties` (in `src/main/resources/`) points to your MySQL instance.
   *(Default uses DB_USERNAME: root, DB_PASSWORD: root)*
3. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

### 3. Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies:
```bash
npm install
```
3. Start the Vite development server:
```bash
npm run dev
```

## Demo Credentials
All users share the same password pattern:
- **Admin**: `admin` / `Admin@123`
- **Base Commander**: `commander` / `Commander@123`
- **Logistics Officer**: `logistics` / `Logistics@123`

## Environment Variables
If running in a production-like environment, configure the following environment variables:
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

## Known Limitations
- Fictional setup designed strictly for a local software engineering demonstration.
- Does not currently support horizontal scaling due to in-memory JWT key caching (unless keys are centralized).

## API Documentation
Once the backend is running, the OpenAPI/Swagger documentation can be accessed at:
- `http://localhost:8080/swagger-ui.html`
