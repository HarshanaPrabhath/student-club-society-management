# FACULTY OF TECHNOLOGY
# UNIVERSITY OF RUHUNA

## FINAL PROJECT REPORT
### STUDENT CLUB & SOCIETY MANAGEMENT SYSTEM

**Course:** Software Engineering - ICT2232  
**Group Number:** 02  
**Academic Year:** 2026  

---

### Group Members

| Student Registration No | Student Name | Institutional Email |
| :--- | :--- | :--- |
| **TG/2023/1712** | M.V.I. Peris | induwaravishwakantha90@gmail.com |
| **TG/2023/1735** | M.D. Amandha | amandha.md@gmail.com |
| **TG/2023/1753** | U.G. Harshana | harshana.ug@gmail.com |
| **TG/2023/1733** | W.A.G.G. De Silva | desilva.wagg@gmail.com |
| **TG/2023/1695** | M.S. Weerasinghe | weerasinghe.ms@gmail.com |

---

## Table of Contents
1. [Cover Page](#faculty-of-technology)
2. [Introduction and Problem Domain](#2-introduction-and-problem-domain)
3. [Problem Statement](#3-problem-statement)
4. [Stakeholders and Realized Objectives](#4-stakeholders-and-realized-objectives)
5. [Scope, Assumptions and Constraints](#5-scope-assumptions-and-constraints)
6. [Software Process Model and Justification](#6-software-process-model-and-justification)
7. [Agile Planning and Sprint Execution](#7-agile-planning-and-sprint-execution)
8. [Requirements Engineering Deliverables](#8-requirements-engineering-deliverables)
9. [System Design Deliverables](#9-system-design-deliverables)
10. [Implementation Deliverables](#10-implementation-deliverables)
11. [Testing and Quality Assurance Deliverables](#11-testing-and-quality-assurance-deliverables)
12. [Deployment and CI/CD Automation](#12-deployment-and-cicd-automation)
13. [Maintenance and Change Request Management](#13-maintenance-and-change-request-management)
14. [Security Architecture and Controls](#14-security-architecture-and-controls)
15. [Project Management and Individual Contributions](#15-project-management-and-individual-contributions)
16. [Conclusion and Future Work](#16-conclusion-and-future-work)
17. [References](#17-references)
18. [Appendices](#18-appendices)

---

## 2. Introduction and Problem Domain

University clubs, academic societies, and student associations represent an indispensable pillar of tertiary education within the Faculty of Technology at the University of Ruhuna. These student-led organizations provide essential avenues for undergraduates to cultivate leadership qualities, foster collaborative teamwork, sharpen technical proficiencies, and organize impactful co-curricular activities, including national hackathons, industrial guest lectures, robotic competitions, coding bootcamps, and community outreach initiatives. Managing these diverse activities necessitates keeping accurate, auditable, and timely records of student profiles, membership rosters, executive appointments, activity schedules, venue bookings, ticket sales, attendance records, and university-wide announcements.

Traditionally, university co-curricular activities have been managed through fragmented, decentralized mechanisms. Administrative workflows routinely depend on manual paper logbooks, unversioned spreadsheets distributed across personal cloud drives, informal communication channels (such as WhatsApp groups), and physical faculty noticeboards. When co-curricular records are maintained across disconnected silos, critical information becomes duplicated, outdated, and exceptionally difficult to reconcile. Committee members spend disproportionate hours preparing member lists and financial summaries, while faculty coordinators struggle to verify compliance or prevent venue scheduling conflicts.

To resolve these institutional challenges, the **Student Club & Society Management System** was engineered and deployed as an enterprise-grade, centralized web application. The platform provides a unified digital operating environment for undergraduates, club executive committees (Presidents, Vice Presidents, Secretaries, Treasurers), Faculty Advisors, and University Administrators. The system delivers end-to-end automation spanning society proposal and sanctioning workflows, dynamic rotating QR-code attendance verification, simulated escrow payments with cascade refund handling, cryptographic certificate generation, and low-latency real-time notifications via WebSockets.

---

## 3. Problem Statement

The fundamental problem addressed by this project is the lack of a standardized, centralized digital platform to manage the governance, operations, participation, and compliance of university clubs and societies at the Faculty of Technology, University of Ruhuna. Prior to this system, co-curricular management suffered from severe administrative vulnerabilities:

1. **Data Fragmentation & Information Loss:** Membership applications, executive appointments, event registrations, and financial ledgers exist across disparate personal sheets, leading to data inconsistency, record loss upon annual committee handovers, and inability to maintain institutional memory.
2. **Governance & Approval Bottlenecks:** Establishing a new society or scheduling an official university event requires multi-stakeholder clearance. Manual paper submissions cause prolonged delays, lack tracking visibility, and frequently cause physical venue double-bookings.
3. **Attendance Fraud & Inaccurate Participation:** Physical paper sign-in sheets and static QR codes are vulnerable to proxy check-ins, allowing non-attending students to fraudulently claim attendance credit and unearned certifications.
4. **Financial Opacity & Lack of Refund Mechanisms:** Collecting membership subscriptions and ticket fees through manual cash or unlinked bank transfers creates severe accounting overhead for student treasurers, with zero automated capability to issue refunds when events are rescheduled or cancelled.
5. **Unverified Credentials:** Paper certificates and static PDF files are easily forged and lack cryptographic validation, preventing academic evaluators or employers from verifying authenticity.

The engineered Student Club & Society Management System resolves these deficiencies by establishing a role-based, cryptographically audited digital infrastructure that enforces governance policies, eliminates attendance fraud, automates financial ledgers, and guarantees the authenticity of student co-curricular credentials.

---

## 4. Stakeholders and Realized Objectives

### 4.1 Stakeholder Analysis

| Stakeholder Role | System Classification | Interest / Operational Responsibility |
| :--- | :--- | :--- |
| **Students / Undergraduates** | Primary Users (`STUDENT`) | Browse societies, submit club proposals, apply for membership, register/RSVP for events, complete fee payments, check-in via rotating QR codes, download verified certificates, and participate in discussion threads. |
| **Club Executive Committee** | Elevated Club Roles (`PRESIDENT`, `VP`, `SECRETARY`, `TREASURER`, `MEMBER`) | Govern club profiles, review and sanction join requests, schedule events with venue reservations, monitor RSVPs and waitlists, log operational expenses, generate live attendance QR tokens, issue certificates, and moderate discussions. |
| **Faculty Advisors** | Academic Oversight (`FACULTY_ADVISOR`) | Oversee society activities, review and sanction high-budget or regulated event proposals, verify compliance, and inspect club membership trends and financial balances. |
| **System Administrators** | Platform Governance (`SUPER_ADMIN`) | Sanction new club proposals, approve club renaming/re-categorization, assign global roles, soft-deactivate accounts, archive/unarchive societies, manage venue registries, and inspect global audit logs. |
| **University Management** | Institutional Stakeholders | Review consolidated co-curricular analytics, event participation metrics, and demographic activity distributions to support accreditation and quality assurance. |

### 4.2 Realized Objectives
1. **Centralized Lifecycle Governance:** Provide end-to-end digital lifecycle governance for university societies, spanning proposal, constitution review, administrative sanctioning, active operation, and eventual archival.
2. **Automated Membership Engine:** Enable students to discover clubs through categorized search, submit membership requests, and receive automated notifications upon review.
3. **Conflict-Free Event Scheduling:** Enforce venue capacity validation and conflict detection algorithms to prevent overlapping physical bookings.
4. **Tamper-Resistant Attendance:** Deploy time-bound, cryptographically signed rolling QR check-in tokens (300-second (5-minute) rotation window) that eliminate proxy sign-ins.
5. **Integrated Payment & Refund Engine:** Provide a simulated transactional escrow payment gateway supporting automated cascade refunds upon event cancellation or membership withdrawal.
6. **Verifiable Digital Credentials:** Automate the issuance of PDF participation certificates based on verified attendance thresholds, complete with embedded QR codes and public verification endpoints (`/verify-certificate/{code}`).
7. **Real-Time Communication:** Implement low-latency STOMP/SockJS WebSocket messaging alongside scheduled asynchronous email digests.
8. **Compliance & Auditability:** Enforce comprehensive audit logging for administrative accountability and provide downloadable CSV/PDF reports across all management modules.

---

## 5. Scope, Assumptions and Constraints

### 5.1 In Scope
- **Identity & Access Governance:** User registration, email verification token workflows, BCrypt password hashing, stateless JWT authentication, password revocation tracking, and brute-force account lockout.
- **Club Lifecycle Management:** Club proposal creation, Super Admin approval workflows, committee appointment hierarchies (strictly enforcing exactly one President per club at the database level), and archival cascades.
- **Event & Venue Management:** Event scheduling, Faculty Advisor approval flags, venue conflict detection, capacity limits, and FIFO waitlist auto-promotion.
- **Attendance Verification:** Manual committee check-in and dynamic QR code generation with rolling cryptographic tokens valid strictly during event hours.
- **Financial Subsystem:** Simulated payments for club subscriptions and event tickets, automatic balance reconciliation, and multi-tier refund cascades.
- **Certificate Issuance & Verification:** Attendance rule evaluation, Apache PDFBox certificate compilation, ZXing QR generation, and unauthenticated public verification.
- **Community Moderation:** Event and announcement discussion threads, member comment reporting, and executive moderation workflows.
- **Administration & Analytics:** User soft-deactivation, global audit trail recording, university-wide analytics visualizations, and CSV data export.

### 5.2 Out of Scope
- Direct clearing integration with external commercial bank acquiring gateways (e.g., live Mastercard/Visa payment networks); transactions are securely simulated through a sandboxed payment service.
- Biometric physical access hardware (fingerprint/facial scanning turnstiles).
- Deep synchronization with university legacy Student Information Systems (SIS) via direct database federation.
- Commercial third-party social media cross-posting APIs.

### 5.3 Operational Assumptions
- Users access the web application through standards-compliant web browsers (Chrome, Firefox, Safari, Edge) on desktop or mobile devices.
- A functional SMTP server (or simulated local mail service) is available to dispatch verification tokens and notification digests.
- Clubs operate under approved student council regulations conforming to University of Ruhuna guidelines.
- Client device clocks remain synchronized via NTP to ensure accurate QR check-in window validation.

### 5.4 Technical and Academic Constraints
- Project conception, development, testing, and deployment had to be finalized strictly within the 15-week academic semester for ICT2232.
- Zero manual SQL modifications in production; all database evolution must be governed strictly through Flyway versioned migration scripts.
- The backend must operate within the memory constraints of containerized platforms (Render free tier), mandating aggressive memory optimization and non-root security compliance.

---

## 6. Software Process Model and Justification

The engineering team adopted the **Scrum Agile Framework**, organizing development into short, time-boxed iterations (sprints) of two weeks each. Scrum was selected as the optimal methodology due to the project's multi-layered architecture, evolving stakeholder requirements, and the necessity to continuously integrate the independently developed backend API and frontend single-page application.

```
+-----------------------------------------------------------------------------------+
|                                Scrum Workflow Loop                                |
|                                                                                   |
|  [Product Backlog]                                                                |
|         |                                                                         |
|         v                                                                         |
|  [Sprint Planning] ----> [Sprint Backlog] ----> [2-Week Sprint Development]       |
|                                                            |                      |
|                                                            v                      |
|  [Potentially Shippable Increment] <---- [Daily Standup & CI/CD Verification]     |
|         |                                                                         |
|         +------------------> [Sprint Review & Retrospective]                      |
|                                          |                                        |
|                                          v                                        |
|                               [Backlog Refinement]                                |
+-----------------------------------------------------------------------------------+
```

### 6.1 Scrum Ceremonies and Realized Practices
- **Sprint Planning:** Conducted at the start of each two-week cycle to decompose user stories from the Product Backlog into actionable engineering tasks.
- **Daily Standup Meetings:** Conducted three times weekly via Discord and WhatsApp to discuss completed tasks, identify blockers, and synchronize API contracts.
- **Sprint Review & Increment Demos:** At the end of each iteration, working increments were demonstrated to peer evaluators and faculty coordinators to obtain feedback.
- **Sprint Retrospective:** Conducted post-review to evaluate engineering workflow efficiency, technical debt, and CI/CD deployment performance.
- **Product Backlog Refinement:** Regularly reprioritized upcoming features, adjusted story point estimates, and refined acceptance criteria based on stakeholder feedback.

---

## 7. Agile Planning and Sprint Execution

### 7.1 Product Backlog & MoSCoW Prioritization

| Story ID | User Story Description | Story Points | MoSCoW Priority | Target Sprint |
| :--- | :--- | :---: | :---: | :---: |
| **US01** | Register and authenticate securely via stateless JWT tokens with rate limiting. | 5 | Must Have | Sprint 1 |
| **US02** | Review, approve, or reject new club proposals to maintain university standards. | 5 | Must Have | Sprint 1 |
| **US03** | Browse approved clubs with search, pagination, and category filtering. | 3 | Must Have | Sprint 2 |
| **US04** | Submit membership applications and monitor application approval state. | 5 | Must Have | Sprint 2 |
| **US05** | Manage club profile, committee roles, and review pending membership requests. | 8 | Must Have | Sprint 2 |
| **US06** | Schedule events and reserve available venues with automated conflict checks. | 8 | Must Have | Sprint 3 |
| **US07** | Inspect and approve high-budget or faculty-regulated event proposals. | 5 | Must Have | Sprint 3 |
| **US08** | RSVP for events with automated FIFO waitlist queuing when capacity is reached. | 5 | Must Have | Sprint 3 |
| **US09** | Complete simulated ticket or membership payments with instant ledger confirmation. | 8 | Must Have | Sprint 4 |
| **US10** | Display rotating, dynamic QR check-in codes during active event windows. | 8 | Must Have | Sprint 4 |
| **US11** | Scan rotating QR code to verify attendance and update participation records. | 5 | Must Have | Sprint 4 |
| **US12** | Receive automated PDF certificate of participation with embedded QR code. | 8 | Should Have | Sprint 5 |
| **US13** | Verify certificate authenticity online using a unique cryptographic code. | 3 | Should Have | Sprint 5 |
| **US14** | Receive real-time notifications via WebSockets and configurable daily email digests. | 5 | Should Have | Sprint 5 |
| **US15** | Participate in discussion threads on scheduled events and club announcements. | 5 | Should Have | Sprint 5 |
| **US16** | Report inappropriate comments and moderate flagged community content. | 5 | Should Have | Sprint 5 |
| **US17** | Log operational expenses linked to events and view financial balances. | 5 | Should Have | Sprint 5 |
| **US18** | Soft-deactivate malicious accounts and inspect global administrative audit logs. | 5 | Must Have | Sprint 6 |
| **US19** | View consolidated university analytics and export attendance/ledger data to CSV. | 5 | Should Have | Sprint 6 |
| **US20** | Archive a club, triggering automated event cancellations and fee refunds. | 5 | Should Have | Sprint 6 |

### 7.2 User Stories and Acceptance Criteria

| User Story | Detailed Acceptance Criteria |
| :--- | :--- |
| **US01: Student Registration** | Required fields validated; passwords hashed via BCrypt; verification token emailed; duplicate registration returns neutral HTTP 202 to prevent user enumeration. |
| **US05: Committee Role Governance** | Only authorized president/VP can approve; status transitions to APPROVED; database enforces exactly one President per club via unique constraint. |
| **US06: Conflict-Free Venue Booking** | System checks overlapping start/end intervals for the venue; conflicting reservations rejected with HTTP 409 Conflict; confirmed bookings display in schedule. |
| **US10: Dynamic Rotating Attendance QR** | HMAC-SHA256 token generated for 300s window (5 minutes); token valid only during event hours; scanning expired token returns HTTP 400 Bad Request. |
| **US20: Club Archival & Refund Cascade** | Club status set to archived; upcoming events cancelled; paid ticket fees refunded automatically; attendees notified via in-app alerts and email. |

### 7.3 Completed Sprint Plan (Sprints 1–6)

| Sprint | Main Focus & Scope | Realized Deliverables | Velocity |
| :--- | :--- | :--- | :---: |
| **Sprint 1** | Project Setup & Authentication | Maven & Vite project scaffolding; Flyway V1 baseline; BCrypt + stateless JWT; login/registration UI with sliding-window rate limiting. | 15 pts |
| **Sprint 2** | Club & Membership Engine | Club proposal & Super Admin approval workflow; committee role assignments; membership join requests & review UI. | 21 pts |
| **Sprint 3** | Events, Venues & RSVPs | Event scheduling engine; venue registry with booking conflict prevention; student RSVP & FIFO waitlist auto-promotion logic. | 23 pts |
| **Sprint 4** | Attendance & Payments | Dynamic rotating QR check-in engine (CheckInTokenService); simulated escrow payment gateway supporting membership/event fees and cascade refunds. | 26 pts |
| **Sprint 5** | Certificates & Real-Time | Apache PDFBox certificate compilation; ZXing QR verification links; STOMP WebSocket push notifications; comment boards & moderation. | 28 pts |
| **Sprint 6** | Admin, Auditing & CI/CD | User soft-deactivation (Flyway V4); audit logging; dual GitHub Actions CI/CD pipelines deploying to Render and Vercel; security hardening. | 25 pts |

---

## 8. Requirements Engineering Deliverables

### 8.1 Functional Requirements (FR)
- **FR01 (Authentication & Security):** The system shall authenticate users via stateless JWT tokens. Passwords shall be hashed using BCrypt. Consecutive failed logins shall trigger a 15-minute account lockout after 5 attempts.
- **FR02 (Profile & Role Administration):** The system shall maintain user profiles (including graduation year for alumni tracking) and enforce role-based access across `STUDENT`, `FACULTY_ADVISOR`, and `SUPER_ADMIN`.
- **FR03 (Society Lifecycle Governance):** The system shall allow students to propose new clubs in a `PENDING` state, requiring `SUPER_ADMIN` approval before becoming publicly discoverable.
- **FR04 (Committee Hierarchy & Constraints):** The system shall support committee positions (`PRESIDENT`, `VP`, `SECRETARY`, `TREASURER`, `MEMBER`) and enforce at most one approved President per club via a unique database index.
- **FR05 (Event Scheduling & Venue Conflict Engine):** The system shall allow committee members to schedule events and reserve venues, rejecting reservations that conflict with existing confirmed events in the same time window.
- **FR06 (Faculty Sanction Workflow):** The system shall require Faculty Advisor sanction (`requires_fa_approval = true`) for regulated or high-budget event proposals prior to public activation.
- **FR07 (RSVP & Waitlist Engine):** The system shall process event RSVPs and automatically queue overflow attendees into a FIFO waitlist, promoting waitlisted users when confirmed attendees cancel.
- **FR08 (Dynamic QR Attendance):** The system shall generate time-bound, cryptographically signed check-in tokens rotating at 300-second (5-minute) intervals, validating scans strictly during active event hours.
- **FR09 (Payment & Cascade Refund Engine):** The system shall process simulated payments for event tickets and club subscriptions, automatically issuing refunds if an event is cancelled or an RSVP is withdrawn.
- **FR10 (Automated Certificate Compilation):** The system shall compile PDF participation certificates via Apache PDFBox for members exceeding attendance thresholds, embedding a ZXing-generated verification QR code.
- **FR11 (Public Certificate Verification):** The system shall expose an unauthenticated verification endpoint (`/verify-certificate/{code}`) allowing public validation of certificate authenticity.
- **FR12 (WebSocket & Email Delivery):** The system shall dispatch real-time in-app notifications over STOMP WebSockets and support scheduled daily email digests via an asynchronous cron task.
- **FR13 (Community Discussions & Moderation):** The system shall provide discussion threads on events and announcements, allowing users to report offensive content for committee moderation.
- **FR14 (Audit Logging & Governance):** The system shall record immutable audit logs for administrative operations, including club approvals, role modifications, account deactivations, and club archival.
- **FR15 (Analytics & CSV Data Export):** The system shall provide graphical analytics on university co-curricular engagement and support CSV export for attendance and financial records.

### 8.2 Non-Functional Requirements (NFR)
- **NFR01 (Usability):** The user interface shall provide responsive layouts across viewports (mobile, tablet, desktop) using Tailwind CSS v4, supporting intuitive navigation with zero training required.
- **NFR02 (Security):** All protected API endpoints shall enforce JWT validation. Public endpoints shall be protected by sliding-window rate limiters. Input data shall be sanitized against XSS and SQL injection.
- **NFR03 (Performance):** Standard database lookups, paginated catalog queries, and profile retrievals shall execute with response times under 200 ms under standard server loads.
- **NFR04 (Reliability & Data Integrity):** Relational integrity shall be maintained via foreign key constraints with `RESTRICT` and `CASCADE` rules. Database evolution shall be governed exclusively by version-controlled Flyway scripts.
- **NFR05 (Maintainability):** Codebases shall adhere to standard architectural separation of concerns (Controllers, Services, Repositories, DTOs). Static linting rules (`oxlint`) shall be enforced in CI pipelines.
- **NFR06 (Portability):** Both frontend and backend systems shall be containerized via Docker and deployable across any standards-compliant container runtime.
- **NFR07 (Observability):** The backend service shall expose an unauthenticated health probe (`/api/health`) reporting live application status, database connectivity, and Git commit SHA.

### 8.3 Detailed Use Case Specifications

#### Use Case UC-01: Propose & Sanction New University Society
- **Primary Actors:** Student (Proposer), Super Administrator (Approver).
- **Pre-conditions:** Student is authenticated and holds an active account with verified email.
- **Main Success Scenario:** 1. Student navigates to Clubs Directory and clicks 'Propose Society'. 2. Student fills name, category, join policy, and constitution description. 3. System validates unique name; persists club with status = PENDING; auto-assigns student as PRESIDENT. 4. Super Administrator inspects pending queue (`/clubs/pending`) and reviews proposal. 5. Super Admin clicks 'Approve'. 6. System transitions status to APPROVED and dispatches WebSocket notification to Proposer.
- **Alternative Extensions:** 3a. Club name already exists: System rejects with HTTP 409 Conflict. 5a. Super Admin rejects proposal: Enters mandatory rejection reason; status set to REJECTED; proposer notified with rejection remarks.
- **Post-conditions:** Society is activated in public directory; unique president constraint active.

#### Use Case UC-02: Schedule Event with Automated Venue Conflict Detection
- **Primary Actors:** Club Committee Executive (President / VP / Secretary).
- **Pre-conditions:** User holds committee privileges for the host society.
- **Main Success Scenario:** 1. Executive opens Club Management > Schedule Event. 2. Enters event title, start time, end time, ticket fee, capacity, and selects a physical Venue from the registry. 3. System checks for interval collisions against confirmed events for that venue. 4. If no collision, event is persisted. If fee/external sanction required, status set to PENDING; otherwise APPROVED. 5. Event becomes visible in public calendar.
- **Alternative Extensions:** 3a. Collision detected: Another event occupies the venue during the requested time window. System rejects reservation with HTTP 409 Conflict, returning details of the conflicting event to allow rescheduling.
- **Post-conditions:** Venue reservation confirmed; event indexed in schedule.

#### Use Case UC-03: Dynamic Rotating QR Check-In & Attendance Verification
- **Primary Actors:** Event Attendee (Student), Event Organizer (Committee Member).
- **Pre-conditions:** Student holds a confirmed RSVP (status = GOING) for the event; event is currently active.
- **Main Success Scenario:** 1. Organizer launches Live Check-In console, projecting the rotating QR code. 2. System refreshes QR token every 300 seconds (5 minutes) using HMAC-SHA256 signature. 3. Attendee scans QR code using mobile device. 4. Backend validates token signature, time window, active event interval, and RSVP status. 5. Attendance record created with method = QR; attendance counter incremented.
- **Alternative Extensions:** 4a. Expired Token: Scanned token is outside valid window index; system rejects check-in with HTTP 400 Bad Request. 4b. Duplicate Scan: System detects existing record for user and event; returns HTTP 409 Conflict.
- **Post-conditions:** Student participation officially recorded; counts towards certificate eligibility threshold.

### 8.4 Requirements Traceability Matrix (RTM)

| Req ID | User Story | Core Java / Frontend Component | Verification Test Suite | Status |
| :--- | :--- | :--- | :--- | :---: |
| **FR01** | US01 | `AuthController`, `JwtService`, `RateLimitFilter` | `SecurityIntegrationTest`, `AuthServiceTest` | **PASSED** |
| **FR02** | US01, US18 | `UserAdminController`, `UserService` | `UserAdminIntegrationTest` | **PASSED** |
| **FR03** | US02 | `ClubController`, `ClubService` | `ClubServiceTest`, `WorkflowIntegrationTest` | **PASSED** |
| **FR04** | US04, US05 | `MembershipController`, `MembershipService` | `MembershipServiceTest`, `ConcurrencyIntegrationTest` | **PASSED** |
| **FR05** | US06 | `EventController`, `VenueService`, `EventService` | `EventServiceTest`, `VenueServiceTest` | **PASSED** |
| **FR06** | US07 | `EventController`, `EventRules` | `WorkflowIntegrationTest` | **PASSED** |
| **FR07** | US08 | `RsvpController`, `RsvpService` | `RsvpServiceTest`, `WorkflowIntegrationTest` | **PASSED** |
| **FR08** | US10, US11 | `AttendanceController`, `CheckInTokenService` | `AttendanceServiceTest`, `CheckInTokenServiceTest` | **PASSED** |
| **FR09** | US09, US20 | `PaymentController`, `PaymentService` | `PaymentServiceTest`, `WorkflowIntegrationTest` | **PASSED** |
| **FR10** | US12 | `CertificateController`, `CertificateService` | `CertificateServiceTest` | **PASSED** |
| **FR11** | US13 | `CertificateController`, `VerifyCertificatePage` | `VerifyCertificatePage.test.jsx` | **PASSED** |
| **FR12** | US14 | `NotificationController`, `WebSocketConfig` | `NotificationServiceTest` | **PASSED** |
| **FR13** | US15, US16 | `CommentReportController`, `EventCommentService` | `CommentReportServiceTest` | **PASSED** |
| **FR14** | US18 | `AuditLogController`, `AuditLogService` | `SecurityIntegrationTest` | **PASSED** |
| **FR15** | US19 | `AnalyticsController`, `AnalyticsService` | `AnalyticsServiceTest`, `CatalogQueryIntegrationTest` | **PASSED** |

---

## 9. System Design Deliverables

### 9.1 High-Level System Architecture

```
+-------------------------------------------------------------------------------------------------+
|                                     Presentation Layer (Client)                                 |
|   React 19 SPA | Redux Toolkit | Tailwind CSS v4 | Axios HTTP Client | STOMP/SockJS Client      |
+-------------------------------------------------------------------------------------------------+
                                      |                       ^
                                      | REST API (JSON)       | WebSocket (STOMP)
                                      v                       |
+-------------------------------------------------------------------------------------------------+
|                                     Application Layer (Backend)                                 |
|                                                                                                 |
|   [Security Filter Chain]  <--->  [Rate Limit Filter]  <--->  [JWT Authentication Filter]       |
|                                         |                                                       |
|                                         v                                                       |
|   [Spring MVC REST Controllers] (Auth, Clubs, Events, Attendance, Payments, Certificates)       |
|                                         |                                                       |
|                                         v                                                       |
|   [Business Service Layer] (EventRules, CheckInTokenService, RefundCascades, MailService)       |
|                                         |                                                       |
|                                         v                                                       |
|   [Data Access Layer] Spring Data JPA Repositories & Specifications                             |
+-------------------------------------------------------------------------------------------------+
                                      |
                                      v JDBC / SQL
+-------------------------------------------------------------------------------------------------+
|                                     Persistence Layer (Data)                                    |
|   MySQL 8.4 Server (Flyway Versioned Schema Migrations V1 -> V4)                               |
+-------------------------------------------------------------------------------------------------+
```

### 9.2 Domain Model / Class Design

```
+-------------------+ 1         * +--------------------+ *         1 +--------------------+
|       User        |------------<|     Membership     |>------------|        Club        |
+-------------------+             +--------------------+             +--------------------+
| id: UUID          |             | id: UUID           |             | id: UUID           |
| email: String     |             | position: Position |             | name: String       |
| password: String  |             | status: Status     |             | category: String   |
| role: Role        |             | joinedAt: Instant  |             | status: Status     |
| active: boolean   |             +--------------------+             | fee: BigDecimal    |
+-------------------+                        |                       | archived: boolean  |
   | 1            | 1                        |                       +--------------------+
   |              |                          |                                  | 1
   | *            | *                        |                                  | *
+-------------------+                        |                       +--------------------+
|    Attendance     |                        |                       |       Event        |
+-------------------+                        |                       +--------------------+
| id: UUID          |                        |                       | id: UUID           |
| markedAt: Instant |                        |                       | title: String      |
| method: Method    |                        |                       | eventDate: Instant |
+-------------------+                        |                       | capacity: Integer  |
   | *                                       |                       | fee: BigDecimal    |
   |                                         |                       | status: Status     |
   +-----------------------------------------+---------------------->+--------------------+
                                                                       | *           | 1
                                                                       |             | 1
                                                                     +----+        +-----+ 
                                                                     |RSVP|        |Venue|
                                                                     +----+        +-----+
```

### 9.3 Sequence Diagrams for Key System Interactions

#### Sequence Diagram 1: Dynamic Rotating QR Code Attendance Verification
```
Student (Mobile)        Frontend (SPA)       AttendanceController   CheckInTokenService      MySQL DB
      |                      |                        |                      |                   |
      |-- Scans QR Token --->|                        |                      |                   |
      |                      |-- POST /check-in ----->|                      |                   |
      |                      |   {eventId, token}     |                      |                   |
      |                      |                        |-- validateToken() -->|                   |
      |                      |                        |   (HMAC & Window)    |                   |
      |                      |                        |<-- Token Valid ------|                   |
      |                      |                        |                                          |
      |                      |                        |-- Check Active Event Window ------------>|
      |                      |                        |<-- Window Confirmed (In Progress) -------|
      |                      |                        |                                          |
      |                      |                        |-- Check RSVP & Duplicate Attendance ---->|
      |                      |                        |<-- RSVP Confirmed, No Duplicate ---------|
      |                      |                        |                                          |
      |                      |                        |-- INSERT INTO attendance ---------------->|
      |                      |                        |<-- Success (Record Created) -------------|
      |                      |<-- HTTP 200 OK --------|                                          |
      |<-- Attendance Conf. -|   {markedAt, method}   |                                          |
```

#### Sequence Diagram 2: Event Scheduling with Automated Venue Conflict Detection
```
Club Executive          Frontend (SPA)          EventController        EventService           MySQL DB
      |                      |                        |                      |                   |
      |-- Selects Venue & -->|                        |                      |                   |
      |   Submits Event      |-- POST /api/events --->|                      |                   |
      |                      |   {venueId, start, end}|                      |                   |
      |                      |                        |-- createEvent() ---->|                   |
      |                      |                        |                      |-- Query Overlaps >|
      |                      |                        |                      |   (Interval Col.) |
      |                      |                        |                      |<-- Result Set ----|
      |                      |                        |                      |                   |
      |                      |                        |     [Conflict Detected? - NO]            |
      |                      |                        |                      |-- Save Event ---->|
      |                      |                        |                      |<-- Event Saved ---|
      |                      |                        |<-- HTTP 201 Created -|                   |
      |                      |<-- Success Toast ------|   {eventId, status}  |                   |
      |                      |                        |                                          |
      |                      |                        |     [Conflict Detected? - YES]           |
      |                      |                        |<-- HTTP 409 Conflict |                   |
      |<-- Overlap Error ----|<-- Conflict Alert -----|   {overlappingEvent} |                   |
```

### 9.4 Activity / Process Diagram: Membership Application & Fee Escrow
```
  (Start: Student Applies)
            |
            v
   [Check Club Policy]
            |
    +-------+-------+
    |               |
 (OPEN)     (APPROVAL_REQ)
    |               |
    |               v
    |       [Does Club Charge Fee?]
    |               |
    |       +-------+-------+
    |       |               |
    |     (YES)            (NO)
    |       |               |
    |       v               |
    |  [Simulate Payment]   |
    |       |               |
    |       v               v
    |   [Status: PENDING Approval]
    |               |
    |               v
    |       <Executive Review>
    |         /           \
    |    (APPROVE)     (REJECT)
    |       /               \
    |      v                 v
    +-> [Status: APPROVED]  [Status: REJECTED]
             |                      |
             v                      v
        (End: Active)      [Trigger Refund Cascade]
                                    |
                                    v
                               (End: Refunded)
```

### 9.5 Database Design & Schema Inventory

| Table Name | Primary Key | Foreign Keys | Key Constraints & Types | Purpose & Business Function |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `id` (BIN16) | None | `email` (VARCHAR, UNIQUE), `role` (ENUM), `active` (BIT) | Stores user identities, credentials, roles, and deactivation states. |
| `clubs` | `id` (BIN16) | `created_by` $\rightarrow$ `users` | `name` (VARCHAR, UNIQUE), `status` (ENUM), `archived` (BIT) | Society metadata, sanctioning states, and financial configurations. |
| `memberships` | `id` (BIN16) | `user_id`, `club_id` | `position` (ENUM), `president_club_id` (BIN16, UNIQUE) | Club-user associations; enforces exactly one President per club. |
| `venues` | `id` (BIN16) | None | `name` (VARCHAR), `capacity` (INT), `active` (BIT) | Physical event locations with capacity limits. |
| `events` | `id` (BIN16) | `club_id`, `venue_id` | `event_date`, `end_date`, `approval_status` (ENUM), `cancelled` (BIT) | Scheduled activities, venue bookings, and sanctioning workflows. |
| `rsvps` | `id` (BIN16) | `user_id`, `event_id` | `status` (GOING, WAITLISTED, CANCELLED), `UK(user, event)` | Event attendance reservations and FIFO waitlist ordering. |
| `attendance` | `id` (BIN16) | `user_id`, `event_id` | `marked_at`, `method` (MANUAL, QR), `UK(user, event)` | Tamper-evident record of verified student event participation. |
| `payments` | `id` (BIN16) | `user_id` $\rightarrow$ `users` | `reference_id`, `type` (EVENT, MEMBERSHIP), `refunded_at` | Simulated transactional ledger for ticket fees, dues, and refunds. |
| `certificates` | `id` (BIN16) | `user_id`, `club_id` | `verification_code` (VARCHAR, UNIQUE), `UK(user, club)` | Issued digital credentials with unique verification codes. |
| `club_expenses` | `id` (BIN16) | `club_id`, `logged_by` | `amount`, `expense_date`, `category`, `event_id` | Operating expense records for financial transparency. |
| `club_announcements`| `id` (BIN16) | `club_id`, `author_id` | `content` (LONGTEXT), `created_at` | Official society broadcast communications. |
| `announcement_comments`| `id` (BIN16) | `announcement_id`, `author_id` | `content` (LONGTEXT), `created_at` | Member discussion threads on published club announcements. |
| `event_comments` | `id` (BIN16) | `event_id`, `author_id` | `content` (LONGTEXT), `created_at` | Attendee discussion and Q&A threads on scheduled events. |
| `comment_reports`| `id` (BIN16) | `reporter_id`, `club_id` | `target_type` (ENUM), `status` (OPEN, ACTION_TAKEN) | Moderation queue for reported abusive or offensive comments. |
| `club_resources` | `id` (BIN16) | `club_id`, `uploaded_by` | `file_name`, `content_type`, `file_b64` (LONGTEXT) | Document repository for club constitutions, minutes, and guides. |
| `audit_logs` | `id` (BIN16) | `actor_id` $\rightarrow$ `users` | `action`, `target_type`, `target_id`, `details`, `created_at` | Immutable compliance and security audit trail. |

### 9.6 User-Interface Prototypes & Screen Architecture
- **Student Dashboard & Discovery:** Features live RSVP upcoming event widgets, society membership cards, notification badges, and co-curricular attendance history meters.
- **Club Executive Console:** Equipped with real-time membership review tables, budget expense logging modals, venue schedule viewers, and the rotating QR attendance console.
- **Faculty Advisor Console:** Provides high-budget event sanction queues, compliance indicators, and club financial ledger audits.
- **Super Administrator Portal:** Incorporates the master user management table with soft-deactivation toggles, global society proposal review, master venue registry, and immutable audit logs.

### 9.7 Architectural Decision Justifications
- **Spring Boot 4 (Java 21 LTS):** Chosen for strong type safety, robust ecosystem, out-of-the-box transaction management (`@Transactional`), declarative security filter chains, and exceptional LTS container performance.
- **React 19 & Tailwind CSS v4:** Delivers reactive component rendering with concurrent mode, high developer productivity, declarative UI state via Redux Toolkit, and zero-runtime CSS overhead using Tailwind CSS v4.
- **Flyway Versioned Migrations:** Eliminates database schema drift between local, test, and production environments by treating schema evolution as immutable, version-controlled code.
- **STOMP over WebSockets:** Provides instant in-app alerts without client polling overhead, using SockJS fallbacks for maximum network compatibility.

---

## 10. Implementation Deliverables

### 10.1 Technologies Used and Verified Stack

| Subsystem / Component | Actual Technology | Exact Version | Architectural Role & Functionality |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | Spring Boot | `4.1.1` | Core inversion-of-control, dependency injection, and REST MVC framework. |
| **Servlet Container** | Apache Tomcat | `11.0.25` | Embedded web server explicitly overridden to remediate critical CVEs. |
| **Language Runtime** | Eclipse Temurin OpenJDK | `Java 21 LTS` | Virtual threads, modern pattern matching, and LTS stability. |
| **Security Framework** | Spring Security | `6.x` | Stateless security filter chains, method-level authorization, and BCrypt. |
| **JWT Token Management** | JJWT (`io.jsonwebtoken`) | `0.13.0` | HMAC-SHA256 stateless authentication token generation and parsing. |
| **Persistence / ORM** | Spring Data JPA / Hibernate | Managed | Repository abstractions and SQL parameterized queries. |
| **Database Engine** | MySQL Server | `8.4` | Relational ACID-compliant database storage with Flyway migrations. |
| **Schema Migration** | Flyway MySQL | `10.x` | Version-controlled database migrations (V1-V4) enforcing `ddl-auto=validate`. |
| **PDF Compilation** | Apache PDFBox | `3.0.8` | Vector compilation of high-resolution digital certificates. |
| **Barcode / QR Engine** | Google ZXing | `3.5.4` | HMAC attendance QR code generation and certificate verification links. |
| **API Documentation** | Springdoc OpenAPI | `3.1.1` | Swagger UI and interactive OpenAPI 3.0 specification explorer. |
| **Frontend Library** | React | `19.2.8` | Declarative component-based UI rendering with modern React hooks. |
| **Build Tooling** | Vite | `8.3.0` | Fast ESM development server and optimized rollup production bundling. |
| **Design System / CSS** | Tailwind CSS | `4.3.3` | Modern utility-first CSS engine integrated via `@tailwindcss/vite`. |
| **State Management** | Redux Toolkit | `2.12.0` | Centralized immutable client store managing auth, clubs, and notifications. |
| **Client Routing** | React Router DOM | `7.18.4` | Client-side routing with RBAC ProtectedRoute route guards. |
| **Real-Time Client** | STOMP.js & SockJS | `7.3.0 / 1.6.1` | Fallback-capable WebSocket push notification listener. |

### 10.2 Implemented Core Subsystems & End-to-End Workflows
- **Dynamic Rotating QR Check-In Engine:** `CheckInTokenService` generates time-bound tokens using HMAC-SHA256 signatures derived from the event ID, server secret, and a 300-second (5-minute) epoch window index. Attending students scan the code to record verified attendance. Expired tokens or scans outside scheduled event hours are automatically rejected.
- **Venue Conflict Detection Algorithm:** `EventService` executes interval collision queries across confirmed reservations whenever an event is scheduled or modified, preventing overlapping bookings in the same physical venue.
- **Transactional Escrow & Refund Cascades:** `PaymentService` coordinates simulated escrow payments for tickets and dues. If an event is cancelled or a club archived, Spring's transactional boundary triggers an automated cascade refunding all paid attendees.
- **Automated Digital Certificate Issuance:** When a member achieves the club's attendance threshold, `CertificateService` compiles a personalized PDF using Apache PDFBox, embedding a ZXing QR code linking directly to the public verification portal.

### 10.3 Coding Standards, Conventions & Version Control
- **Backend Clean Architecture:** Java code adheres to standard Oracle Java Style conventions, utilizing Lombok to reduce boilerplate, meaningful domain terminology, and clear layer separation (Controllers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ DTOs).
- **Frontend Coding Standards:** JavaScript/JSX code adheres to functional React paradigms, component modularity, strict prop validation, and automated static linting via `oxlint`.
- **Version Control & Git Governance:** Git branches followed standard GitFlow conventions (`feature/...`, `fix/...`, `chore/...`). Merges to `main` were gated behind passing GitHub Actions CI builds.

### 10.4 Key Technical Challenges and Engineering Solutions
- **Enforcing Exactly One Club President at Database Level:** In early builds, concurrent role assignment requests could lead to race conditions where two members were simultaneously designated as President. In Flyway migration V3, a nullable column `president_club_id` was introduced on `memberships` with a unique index constraint `UKsq8pqceygmf72yg4t70rum82a`. When a member is promoted, `president_club_id` is set to `club_id`, guaranteeing that MySQL rejects duplicate presidents even under concurrent execution.
- **Mitigating Embedded Tomcat Security Vulnerabilities:** Default Spring Boot 4.1.1 transitive dependencies packaged Tomcat 11.0.24, which was flagged by container vulnerability scanners for three critical CVEs (CVE-2026-65182, CVE-2026-65905, CVE-2026-68525). The team explicitly configured the Maven property `<tomcat.version>11.0.25</tomcat.version>` in `backend/pom.xml`, ensuring 100% clean Trivy security scans in CI pipelines.
- **Sliding-Window Rate Limiter Memory Leaks:** Early iterations of `RateLimitFilter` accumulated IP addresses indefinitely in memory, presenting an Out-Of-Memory hazard. The filter was re-engineered with an active eviction thread clearing expired IP windows every 60 seconds.

---

## 11. Testing and Quality Assurance Deliverables

### 11.1 Testing Methodology
Quality Assurance followed a comprehensive testing pyramid encompassing over 315 backend unit and integration tests (executed against a dedicated MySQL test database `club_management_test`), 22 frontend Vitest specs running under JSDOM, and an exhaustive 26-suite manual verification plan (`MANUAL_TEST_PLAN.md`).

### 11.2 Comprehensive Test Execution Matrix

| Test ID | Scenario Description | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Student Registration | `POST /api/auth/register` with valid student data. | HTTP 201; JWT returned; verification email sent. | **PASSED** |
| **TC-AUTH-02** | Duplicate Registration | Register with already registered email. | Neutral HTTP 202; generic response (anti-enumeration). | **PASSED** |
| **TC-AUTH-03** | Brute-Force Lockout | Submit 6 consecutive invalid passwords. | 5th failure: 401; 6th attempt: HTTP 429 Locked (15 min). | **PASSED** |
| **TC-AUTH-04** | Session Invalidation | Change password in Browser A; query in Browser B. | Browser B next API call returns HTTP 401 Unauthorized. | **PASSED** |
| **TC-CLUB-01** | Propose New Society | Student submits `POST /api/clubs` payload. | HTTP 201; status PENDING; creator auto-assigned PRESIDENT. | **PASSED** |
| **TC-CLUB-02** | Approve Society | Super Admin executes `POST /api/clubs/{id}/approve`. | Status transitions to APPROVED; appears in catalog. | **PASSED** |
| **TC-CLUB-03** | Single President Enforced | Attempt concurrent promotion of two presidents. | One succeeds; second rejected by unique database index. | **PASSED** |
| **TC-CLUB-04** | Club Archival Cascade | President executes `POST /api/clubs/{id}/archive`. | Club archived; upcoming events cancelled and refunded. | **PASSED** |
| **TC-EVENT-01** | Venue Booking Collision | Schedule Event 2 at Venue A during Event 1 window. | HTTP 409 Conflict; detailed overlap message returned. | **PASSED** |
| **TC-EVENT-02** | Waitlist Auto-Promotion | Confirmed attendee cancels RSVP on full event. | Attendee status CANCELLED; waitlist #1 promoted to GOING. | **PASSED** |
| **TC-ATTN-01** | Valid QR Check-In | Scan live rotating QR token during event window. | Attendance recorded (`method = QR`); count incremented. | **PASSED** |
| **TC-ATTN-02** | Expired QR Rejection | Submit QR token from earlier 120s rotation window. | HTTP 400 Bad Request; Check-in token expired. | **PASSED** |
| **TC-CERT-01** | Automated Certificate | Member reaches attendance threshold for club. | Certificate compiled via PDFBox with QR verification code. | **PASSED** |
| **TC-CERT-02** | Online Verification | Unauthenticated visit to `/verify-certificate/{code}`. | HTTP 200; displays recipient name, club, issue date. | **PASSED** |
| **TC-SEC-01** | RBAC Enforcement | Student attempts to access `GET /api/audit-logs`. | HTTP 403 Forbidden; access denied. | **PASSED** |
| **TC-MOD-01** | Comment Moderation | Report offensive comment; Executive resolves. | Report status ACTION_TAKEN; comment content deleted. | **PASSED** |

### 11.3 Defect Log and Correction Record

| Defect ID | Defect Description & Severity | Root Cause Analysis | Corrective Action Taken | Verification |
| :--- | :--- | :--- | :--- | :---: |
| **DEF-01** | Dual President Race Condition (High) | Concurrent promotions bypassed service-level check before database commit. | Added `president_club_id` with database unique constraint in Flyway V3. | **PASSED (Concurrency Test)** |
| **DEF-02** | Rate Limiter Out-Of-Memory (High) | IP counters in `ConcurrentHashMap` were never purged, leaking memory over time. | Implemented scheduled cleanup executor clearing expired windows every 60s. | **PASSED (Load Test)** |
| **DEF-03** | Tomcat Security Vulnerability (Critical) | Default Tomcat 11.0.24 in Spring Boot parent contained three known CVEs. | Overrode Maven property to Tomcat 11.0.25 in `pom.xml`. | **PASSED (Trivy CI Scan)** |
| **DEF-04** | Orphaned Payments on Cancel (Medium) | Cancelled events left payments in SUCCESS state without attendee refunds. | Implemented transactional cascade refund in `PaymentService` & `EventService`. | **PASSED (Integration Test)** |

---

## 12. Deployment and CI/CD Automation

### 12.1 Deployment Topology & Live URLs
- **Frontend Production Site URL:** `https://club-society.vercel.app` (React 19 Single Page Application on Vercel)
- **Backend API Production URL:** `https://club-society-backend.onrender.com` (Spring Boot Docker Container on Render)
- **Live Health Probe Endpoint:** `https://club-society-backend.onrender.com/api/health` (Returns UP status & Git SHA)
- **Swagger UI Documentation URL:** `https://club-society-backend.onrender.com/swagger-ui.html` (Interactive API explorer)

### 12.2 CI/CD Pipelines & Automation
- **Backend Pipeline (`.github/workflows/backend.yml`):** Triggered on `backend/**` commits. Spins up MySQL 8.4, runs Flyway migrations, executes all 315+ unit/integration tests, compiles a non-root Docker container, performs Trivy vulnerability scans, triggers Render deployment webhooks, and polls `/api/health` until the newly committed SHA reports `status = UP`.
- **Frontend Pipeline (`.github/workflows/frontend.yml`):** Triggered on `frontend/**` commits. Executes `oxlint` static analysis, runs Vitest suites, performs production builds (`vite build`), audits dependencies, deploys pull requests to Vercel preview URLs, and deploys merges on `main` directly to Vercel production edge servers.

### 12.3 System Requirements & Configuration Environment Variables
- **System Prerequisites:** Java 21 LTS, Node.js 24+, MySQL 8.4, Docker 26+, 2GB+ RAM.
- **Backend Production Variables:** `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `MAIL_USERNAME`, `MAIL_PASSWORD`.
- **Frontend Variables:** `VITE_API_BASE_URL` (points to Render API origin).

### 12.4 Step-by-Step Installation and Local Execution
1. **Configure Environments:** Execute `cp backend/.env.example backend/.env && cp frontend/.env.example frontend/.env`
2. **Containerized Launch:** Execute `docker compose up` (launches Backend on port 5000, Frontend on port 5173, MySQL on port 3306).
3. **Automatic Seeding:** Flyway automatically creates the database schema and loads seed accounts (`superadmin@example.com`, password `password123`).
4. **Access Verification:** Access the web frontend at `http://localhost:5173` and Swagger API at `http://localhost:5000/swagger-ui.html`.

---

## 13. Maintenance and Change Request Management

### 13.1 Maintenance Process and Classification
In accordance with ICT2232 guidelines, software maintenance was conducted systematically by logging, analyzing, categorizing, and verifying all post-baseline modifications across the four established software maintenance categories:
- **Corrective Maintenance:** Remediating operational bugs or unexpected defects discovered during execution.
- **Adaptive Maintenance:** Modifying software to adjust to changing operational environments, external dependencies, or administrative policies.
- **Perfective Maintenance:** Enhancing performance, user experience, fraud resistance, or functional capabilities.
- **Preventive Maintenance:** Proactively updating libraries, frameworks, and security configurations to avert prospective vulnerabilities.

### 13.2 Realized Change Requests & Impact Analysis

| CR ID | Change Description & Category | Affected Requirements | Impact Analysis (Design, DB, Code, Tests) | Status |
| :--- | :--- | :--- | :--- | :---: |
| **CR-01** | Dynamic Rotating QR Check-In Engine<br>**[Category: Perfective]** | FR08, US10, US11 | **Design:** Added token rotation window.<br>**DB:** No schema change.<br>**Code:** `CheckInTokenService`.<br>**Tests:** Window expiry tests. | **DEPLOYED** |
| **CR-02** | Club Archival with Cascade Refunds<br>**[Category: Adaptive / Perfective]** | FR09, US20 | **Design:** Archival lifecycle.<br>**DB:** `clubs.archived` flag (V3).<br>**Code:** `PaymentService` & `ClubService`.<br>**Tests:** Refund cascade tests. | **DEPLOYED** |
| **CR-03** | Embedded Tomcat CVE Remediation<br>**[Category: Preventive]** | NFR02 | **Design:** Server security.<br>**DB:** None.<br>**Code:** `pom.xml` `tomcat.version` 11.0.25.<br>**Tests:** Trivy container vulnerability scan. | **DEPLOYED** |
| **CR-04** | User Soft-Deactivation Mechanism<br>**[Category: Adaptive]** | FR02, US18 | **Design:** Account governance.<br>**DB:** `users.active` bit flag (V4).<br>**Code:** `UserAdminService`.<br>**Tests:** Suspended user auth tests. | **DEPLOYED** |

---

## 14. Security Architecture and Controls

### 14.1 Security Threat Analysis (STRIDE Model)
- **Threat 1 (Credential Stuffing & Brute-Force Attacks):** Attackers attempt automated dictionary and credential stuffing attacks against student and faculty accounts.
- **Threat 2 (Attendance Proxy Fraud & Token Replay):** Students capture static QR codes or copy tokens to record attendance for absent peers (proxy sign-in).
- **Threat 3 (Broken Object Level Authorization - BOLA):** Malicious users manipulate path parameters or request payloads to alter records belonging to other societies.
- **Threat 4 (Injection & Cross-Site Scripting - XSS):** Adversaries submit malicious scripts or SQL injection sequences through public text inputs (e.g., club descriptions, comments).
- **Threat 5 (Certificate Forgery & Credential Tampering):** Forging paper or static digital participation certificates to falsify academic co-curricular records.

### 14.2 Likelihood and Impact Risk Assessment Matrix

| Threat ID | Identified Threat | Likelihood | Impact | Risk Level | Implemented Security Control |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **T-01** | Brute-force credential stuffing | High | High | **CRITICAL** | Sliding-window IP rate limit (10 req/min) & 15-min lockout. |
| **T-02** | QR code replay proxy check-in | High | High | **CRITICAL** | HMAC-SHA256 rolling tokens (300s window (5 minutes)) valid during event. |
| **T-03** | Privilege escalation across clubs | Medium | High | **HIGH** | Spring Security method-level RBAC & executive ownership checks. |
| **T-04** | SQL Injection & Stored XSS | Medium | High | **HIGH** | JPA parameterized prepared statements & React auto-escaping. |
| **T-05** | Certificate forgery & tampering | Medium | Medium | **MEDIUM** | Public verification portal (`/verify-certificate/{code}`) & PDFBox. |

### 14.3 Implemented Security Controls & Verification Evidence
- **BCrypt Password Hashing:** Passwords hashed via salted BCrypt (work factor 10). Plain-text credentials are never stored or logged.
- **Session Invalidation on Password Update:** Stateless signed JWTs (HMAC-SHA256). Password changes update `password_changed_at` in the database, instantly invalidating pre-existing sessions.
- **Anti-Enumeration Responses:** Registration and password reset endpoints return identical neutral HTTP 202 Accepted responses regardless of email presence, preventing account enumeration.
- **Container Hardening & Scans:** Backend containers execute under a non-root unprivileged service account. Automated Trivy vulnerability scans in CI ensure zero critical CVEs.

---

## 15. Project Management and Individual Contributions

### 15.1 Team Organization and Contribution Log

| Student ID | Member Name | Assigned Project Role | Key Realized Contributions across SDLC |
| :--- | :--- | :--- | :--- |
| **TG/2023/1712** | **M.V.I. Peris** | **Lead Full-Stack Architect & DevOps Lead** | Designed overall system architecture; engineered Spring Security filter chain, stateless JWT authentication, and sliding-window rate limiting; authored Flyway migrations V1-V4; configured dual GitHub Actions CI/CD pipelines deploying to Render and Vercel; managed Docker containerization and Tomcat CVE remediation. |
| **TG/2023/1735** | **M.D. Amandha** | **Backend Core & Database Engineer** | Designed relational database schema and JPA repository layer; implemented Club lifecycle governance, Society proposal workflows, and multi-tier committee role management; engineered venue conflict detection algorithms. |
| **TG/2023/1753** | **U.G. Harshana** | **Frontend Lead & UI/UX Developer** | Designed responsive UI using React 19 and Tailwind CSS v4; implemented Redux Toolkit state architecture; built AppLayout, Navigation, Club Directories, and interactive Dashboard analytics views. |
| **TG/2023/1733** | **W.A.G.G. De Silva** | **Security, Attendance & Payment Engineer** | Engineered dynamic rotating QR code attendance engine (`CheckInTokenService`); integrated Google ZXing and Apache PDFBox for certificate compilation; implemented transactional simulated payment and cascade refund engine. |
| **TG/2023/1695** | **M.S. Weerasinghe** | **QA Lead, Community & Moderation Engineer** | Authored the 26-suite manual test plan (`MANUAL_TEST_PLAN.md`) and executed integration test suites; implemented event/announcement comment threads and moderation report workflows; developed CSV/PDF export utilities. |

### 15.2 Version Control Commit Evidence & Collaboration
- Maintained active Git repository with 100+ commits demonstrating collaborative development, pull request reviews, and automated CI test passes.
- Maintained continuous coordination through thrice-weekly standups, sprint reviews, and retrospective meetings.

### 15.3 Risk Management and Mitigation Matrix

| Identified Risk | Severity | Realized Impact | Applied Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Concurrent Booking Collisions** | High | Overlapping venue bookings during peak faculty periods. | Implemented interval collision queries and transactional locking in `EventService`. |
| **Attendance Proxy Fraud** | High | Unearned certificates issued to non-attending students. | Developed dynamic rotating QR tokens refreshing every 120s, valid only during event hours. |
| **Container Memory Exhaustion** | Medium | OOM container crashes on free-tier Render instances. | Tuned JVM parameters (`-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0`). |
| **API / Frontend Desynchronization** | Medium | Broken client-server contracts during parallel coding. | Maintained live Swagger OpenAPI contracts and ran automated integration tests on PRs. |

---

## 16. Conclusion and Future Work

### 16.1 Project Conclusion
The **Student Club & Society Management System** successfully addresses the operational and administrative bottlenecks of co-curricular management at the Faculty of Technology, University of Ruhuna. By migrating manual, spreadsheet-bound workflows into a centralized, audited web platform, the system demonstrates significant advancements in administrative efficiency, institutional transparency, and credential integrity. The project fulfills all curriculum requirements for course ICT2232 (Software Engineering), delivering production-grade code backed by automated testing and cloud CI/CD pipelines.

### 16.2 Prospective Future Work
1. **Direct Banking Integration:** Integrate licensed national payment gateways (e.g., LankaPay, PayHere) to process live credit card and mobile wallet transactions.
2. **Push Notifications for Mobile:** Implement Web Push API / Progressive Web App (PWA) push notifications for real-time mobile alerts without requiring an active browser tab.
3. **Institutional Single Sign-On (SSO):** Integrate SAML 2.0 / OpenID Connect with the University of Ruhuna's institutional Google Workspace and Active Directory directories.

---

## 17. References

1. Pressman, R. S. and Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach*. 9th edn. New York: McGraw-Hill Education.
2. Sommerville, I. (2016). *Software Engineering*. 10th edn. Boston: Pearson.
3. Schwaber, K. and Sutherland, J. (2020). *The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game*. Available at: https://scrumguides.org/ (Accessed: 15 October 2026).
4. OWASP Foundation (2021). *OWASP Top 10: 2021 The Ten Most Critical Web Application Security Risks*. Available at: https://owasp.org/Top10/ (Accessed: 12 October 2026).
5. Martin, R. C. (2018). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Boston: Prentice Hall.
6. Walls, C. (2022). *Spring in Action*. 6th edn. Shelter Island: Manning Publications.
7. Banks, A. and Porcello, E. (2020). *Learning React: Modern Patterns for Developing React Apps*. 2nd edn. Sebastopol: O'Reilly Media.
8. Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation. University of California, Irvine.

---

## 18. Appendices

### Appendix A: High-Level System Architecture
The system architecture comprises a React 19 SPA client communicating over HTTPS REST endpoints and STOMP WebSockets with a Spring Boot 4.1.1 API, backed by a MySQL 8.4 database managed via Flyway versioned migrations (V1 to V4).

### Appendix B: Complete REST API Endpoint Inventory

| HTTP Method | Route Endpoint | Required Authority | Description & Business Logic |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Anonymous | Registers a student account; returns JWT and dispatches verification token. |
| `POST` | `/api/auth/login` | Anonymous | Authenticates credentials; enforces 5-attempt rate limit and lockout. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves profile of currently authenticated user. |
| `PUT` | `/api/auth/me/password`| Authenticated | Updates password and invalidates all existing sessions. |
| `GET` | `/api/clubs` | Anonymous | Paginated listing of all `APPROVED`, non-archived clubs. |
| `POST` | `/api/clubs` | `STUDENT` | Proposes a new club in `PENDING` status; auto-assigns creator as `PRESIDENT`. |
| `POST` | `/api/clubs/{id}/approve` | `SUPER_ADMIN` | Approves club proposal; transitions status to `APPROVED`. |
| `POST` | `/api/clubs/{id}/archive` | `PRESIDENT` / `SUPER_ADMIN` | Archives club; cancels upcoming events; refunds paid fees. |
| `POST` | `/api/clubs/{id}/join` | `STUDENT` | Submits join request (`APPROVED` for `OPEN` clubs; `PENDING` for review). |
| `GET` | `/api/events` | Anonymous | Retrieves scheduled events with filtering (`q`, `category`, `from`, `to`). |
| `POST` | `/api/events` | Committee Member | Creates an event; validates venue availability against existing reservations. |
| `POST` | `/api/events/{id}/approve` | `FACULTY_ADVISOR` | Approves high-budget or faculty-regulated event proposal. |
| `POST` | `/api/events/{id}/rsvp` | `STUDENT` | Submits event RSVP; enqueues into waitlist if capacity is reached. |
| `GET` | `/api/attendance/check-in-token/{id}`| Committee Member | Generates rolling HMAC-SHA256 QR code token for live attendance. |
| `POST` | `/api/attendance/check-in` | `STUDENT` | Validates scanned QR token and records student attendance. |
| `GET` | `/api/certificates/my` | `STUDENT` | Lists earned certificates based on verified attendance thresholds. |
| `GET` | `/api/certificates/verify/{code}`| Anonymous | Public endpoint validating certificate authenticity and recipient data. |
| `POST` | `/api/payments` | Authenticated | Processes simulated payment for event ticket or membership subscription. |
| `GET` | `/api/admin/users` | `SUPER_ADMIN` | Paginated user management table with role editing and deactivation toggles. |
| `GET` | `/api/audit-logs` | `SUPER_ADMIN` | Immutable administrative audit log inspection interface. |
| `GET` | `/api/analytics/university-stats` | Faculty / Admin | Consolidated co-curricular engagement metrics and distribution charts. |
| `GET` | `/api/health` | Anonymous | Public health check returning system status, database connectivity, and commit SHA. |

---
**Report finalized and verified against the production codebase on October 21, 2026.**
