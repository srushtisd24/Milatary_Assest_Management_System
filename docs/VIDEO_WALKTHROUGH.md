# Video Walkthrough Script
**Target Duration:** 3-5 minutes

## 0:00–0:30: Introduction
* **Action**: Show the project architecture diagram and tech stack slide.
* **Script**: "Welcome to the Military Asset Management System. This is a full-stack application built using React and Vite on the frontend, and Java Spring Boot with Spring Security on the backend. Data is persisted in a normalized MySQL database. Our system tracks logistics across multiple bases with strict Role-Based Access Control."

## 0:30–1:00: Admin Login & Dashboard
* **Action**: Open `http://localhost:5173/login`. Log in with username `admin`, password `Admin@123`.
* **Script**: "Let's log in as the System Admin. Upon successful JWT authentication, we are routed to the Dashboard. Here, we can see the top-level metric cards: Opening Balance, Net Movement, Closing Balance, Assigned, and Expended. As an admin, I can see data across all bases."

## 1:00–1:30: Dashboard Filters & Net Movement Popup
* **Action**: Change the 'Base' filter to 'Alpha Base'. Click on the 'Net Movement' metric card.
* **Script**: "The dashboard is highly interactive. Filtering by 'Alpha Base' updates the charts instantly. Clicking the 'Net Movement' card opens a modal detailing the exact calculations: Purchases + Transfers In - Transfers Out. All this data is calculated dynamically on the Spring Boot backend."

## 1:30–2:00: Creating a Purchase
* **Action**: Navigate to `/purchases`. Fill out the 'Add Purchase' form for 'Utility Vehicles' at 'Alpha Base'.
* **Script**: "Let's record a new purchase of Utility Vehicles. Once submitted, the backend validates the request, updates the overall asset balance for Alpha Base, and logs the transaction. If we return to the Dashboard, we can see the 'Closing Balance' has increased accordingly."

## 2:00–2:30: Transfer Workflow
* **Action**: Navigate to `/transfers`. Create a transfer of 5 Utility Vehicles from 'Alpha Base' to 'Bravo Base'.
* **Script**: "Now, let's transfer equipment between bases. The backend validates that Alpha Base has sufficient balance. Upon completion, the system executes an atomic database transaction: deducting from Alpha, adding to Bravo, and recording an audit log."

## 2:30–3:00: Assignments & Expenditures
* **Action**: Navigate to `/assignments`. Assign 1 Utility Vehicle to personnel.
* **Script**: "Equipment can also be assigned to specific personnel or expended. Both actions strictly validate against the available balance to prevent overdrafts. Here, we assign a vehicle, decreasing our net available balance temporarily."

## 3:00–3:30: Base Commander RBAC Demo
* **Action**: Log out. Log in with `commander` / `Commander@123`.
* **Script**: "Let's demonstrate Role-Based Access Control. I am now logged in as a Base Commander assigned to Alpha Base. Notice that the UI restricts my view to Alpha Base only. If I attempt to modify Bravo Base, the server will block the request and return a 403 Forbidden."

## 3:30–4:00: Logistics Officer RBAC Demo
* **Action**: Log out. Log in with `logistics` / `Logistics@123`.
* **Script**: "As a Logistics Officer, I have broad visibility over purchases and transfers across all bases, but notice that the 'User Management' and 'Audit Logs' menu items are hidden. My permissions are strictly limited to logistics operations."

## 4:00–4:30: Audit Logs (Admin)
* **Action**: Log out. Log back in as `admin`. Navigate to `/audit-logs`.
* **Script**: "Logging back in as Admin, we can access the Audit Logs. Every critical action we just performed—Logins, Purchases, Transfers, and Assignments—was captured by our backend `AuditService`, ensuring full accountability and traceability."

## 4:30–5:00: Technical Deep-Dive
* **Action**: Show code snippet of the `TransferService.java` or `JwtUtil.java`.
* **Script**: "A key implementation detail is our server-side balance validation during transfers. To prevent race conditions and data corruption, the transfer completion method is wrapped in a `@Transactional` annotation. If any step fails, the entire transfer is rolled back. Thank you for watching!"
