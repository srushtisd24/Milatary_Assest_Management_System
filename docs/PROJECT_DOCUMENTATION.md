# Project Overview

## Description
The Military Asset Management System is a full-stack web application designed for tracking and managing fictional military assets, including utility vehicles, communication equipment, and field gear across multiple bases.

## Objectives
- Provide secure RBAC authentication for Admin, Base Commanders, and Logistics Officers.
- Track real-time net movement and available balances for various asset types.
- Provide a clean, robust frontend dashboard for visualizing current logistics data.

## Assumptions
- Demo application using fictional data only. No classified operational data is processed.
- Base Commanders can only view/manage assets corresponding to their assigned bases.

## Limitations
- This is a localized demo, without horizontal scaling capabilities out of the box.

# Tech Stack & Architecture
- **React, Vite, Bootstrap, Recharts**: Fast and modern responsive frontend.
- **Spring Boot, Spring Security, JWT**: Robust, standardized backend with token-based stateless authentication.
- **MySQL, JPA/Hibernate**: Relational schema ideal for robust transactional logistics tracking.

# Data Models / Schema
Important entities include: `User`, `Base`, `EquipmentType`, `Asset`, `Purchase`, `Transfer`, `Assignment`, `Expenditure`, and `AuditLog`. These are linked via relational keys (e.g. `base_id`).

# RBAC Explanation
- **Admin**: Full system access (ROLE_ADMIN).
- **Base Commander**: Restricted to viewing/editing entities linked to their specific base (ROLE_BASE_COMMANDER).
- **Logistics Officer**: Has view/create permissions across all bases for transactions but cannot manage users (ROLE_LOGISTICS_OFFICER).

# API Logging
All asset movements create an `audit_log` entry including the timestamp, action type, IP address, and user ID.

# Setup Instructions
1. Run the database script `database/military_asset_management.sql` in MySQL.
2. Build and run the Spring Boot app.
3. Build and run the React frontend.
4. Login with sample credentials.

# Login Credentials
- Admin: admin / Admin@123
- Base Commander: commander / Commander@123
- Logistics Officer: logistics / Logistics@123
