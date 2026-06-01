IS 3920 – Individual Project on Business Solutions

# Software Requirements Specification
## AgriLink Lanka — Farmer–Exporter Connecting Platform

Prepared by: **[Student Number & Name]**  
Department of Interdisciplinary Studies  
Faculty of Information Technology  
University of Moratuwa  
Date: **2026-01-18**  
Word Count: **[6000–10000]**

---

## Student’s Declaration
I hereby declare that this report is my original work and has not been submitted, in whole or in part, for any degree or diploma at any university or other institution of higher learning. All information derived from the work of others, whether published or unpublished, has been properly acknowledged in the text, and a complete list of references has been provided.

Date: ____________________  
Signature: ____________________

---

## Supervisors’ declaration
I hereby declare that I have reviewed this project and find it adequate in both scope and quality.

1. Name of Supervisor: ____________________  
   Designation: ____________________  
   Date: ____________________  
   Signature: ____________________  
   Any further comments: ____________________

2. Name of Supervisor: ____________________  
   Designation: ____________________  
   Date: ____________________  
   Signature: ____________________  
   Any further comments: ____________________

> Note: It is mandatory to get both supervisors’ signatures.

---

## Table of Contents
> This document uses Markdown headings. If you export to Word/PDF, generate the table of contents automatically from headings.

## List of Figures
1. Figure 1: System Architecture (High-Level)
2. Figure 2: Use Case Diagram (Appendix B)
3. Figure 3: Class Diagram (Appendix B)
4. Figure 4: ER Diagram (Appendix B)

---

## Revision History
| Name | Date | Reason for Changes | Version |
|---|---|---|---|
| Team | 2026-01-18 | Initial draft based on current repo + intended scope | 1.0 |

---

# 1 Introduction

## 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and nonfunctional requirements for **AgriLink Lanka**, a web-based platform that connects **farmers** and **exporters** to enable listing, verification, approval, discovery, and (intended) purchasing workflows for agricultural produce.

## 1.2 Document Conventions
- This SRS is structured following common IEEE SRS practices (e.g., IEEE 830 / ISO/IEC/IEEE 29148-style organization).
- Requirements identifiers:
  - `FR-xx`: Functional Requirements
  - `NFR-xx`: Nonfunctional Requirements
  - `BR-xx`: Business Rules
  - `DR-xx`: Data Requirements
- Keywords:
  - **Must** = mandatory
  - **Should** = recommended
  - **May** = optional

## 1.3 Intended Audience and Reading Suggestions
- **Supervisors / evaluators:** Read Sections 1–2 for scope and objectives; Section 4 for features; Section 5 for quality expectations.
- **Developers:** Read Sections 3–5; refer to Appendix B for analysis models.
- **Testers:** Use Section 4 (feature sequences + FRs) and Section 5 (NFRs) as acceptance and validation basis.
- **Stakeholders:** Read Sections 1.4–2.3 for problem statement, objectives, and user roles.

## 1.4 Product Scope
AgriLink Lanka provides a unified platform to:
- Onboard farmers and exporters.
- Allow farmers to publish produce listings with supporting images/certifications.
- Allow admins to approve listings and verify exporters.
- Allow exporters to discover available produce via filtering and sorting.
- Provide role-specific dashboards.
- (Intended) Support ordering and payment workflows for exporters.

### 1.4.1 Problem in brief
Sri Lankan farmers often have limited direct access to exporters and export markets, while exporters face difficulty sourcing verified, export-ready produce with traceable details (quality grade, harvest date, location, certification). The result is inefficient discovery, trust gaps, and delayed procurement.

### 1.4.2 Aim and Objectives
**Aim:** Build a secure digital marketplace that connects farmers and exporters, improves visibility of produce, and increases trust through verification and approval workflows.

**Objectives:**
- Provide role-based registration and authentication.
- Enable farmer product listing with optional documentation.
- Enforce admin product approval and exporter verification.
- Provide advanced product search/filter/sort and pagination.
- Provide dashboards for each role.
- (Intended) Add order placement and payment tracking.

## 1.5 References
- [QUICKSTART.md](QUICKSTART.md)
- [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- Backend source: controllers, services, and models under `AgriLink.API`

---

# 2 Overall description

> The system architecture should be well illustrated in a diagram.

## Figure 1: System Architecture (High-Level)
```mermaid
flowchart LR
  U[Users\nGuest / Farmer / Exporter / Admin] -->|HTTPS| FE[Frontend\nNext.js Web App]
  FE -->|REST API (JSON / multipart)| API[Backend\nASP.NET Core Web API]
  API --> DB[(PostgreSQL DB)]
  API --> FS[(File Storage\nUploads / Object Storage)]
  API --> EXT[External Services\nStripe / Email (Intended)]
```

## 2.1 Product Perspective
AgriLink Lanka is a client–server web system:
- **Frontend:** Next.js (TypeScript) web UI.
- **Backend:** ASP.NET Core Web API.
- **Database:** PostgreSQL.
- **File storage:** Local uploads (current) with an intended option for cloud storage (e.g., Cloudinary).
- **Payments (intended):** Stripe integration indicated via configuration and transaction model.

## 2.2 Product Functions
- Register and authenticate users.
- Maintain user profiles (including profile image).
- Allow farmers to create/update/delete product listings.
- Allow admins to approve/reject product listings.
- Allow admins to verify exporter accounts.
- Allow authenticated users to browse products with filters/sorting/pagination.
- Provide dashboards per role.
- (Intended) Allow exporters to place orders, pay, and track transactions.

## 2.3 User Classes and Characteristics
- **Guest**: Unauthenticated user who can register/login (and optionally browse public content, depending on policy).
- **Farmer**: Creates product listings and monitors approval status and revenue.
- **Exporter**: Browses approved listings and (intended) places orders and payments.
- **Admin**: Verifies exporters, approves products, and monitors platform metrics.

## 2.4 Operating Environment
- **Client:** Modern browsers (Chrome/Edge/Firefox/Safari).
- **Frontend runtime:** Node.js.
- **Backend runtime:** .NET 9.
- **Database:** PostgreSQL 16.
- **Network:** HTTP/HTTPS.

Local development defaults:
- Backend API: `http://localhost:5189` (Swagger at `/swagger`)
- Frontend: `http://localhost:3000` or `http://localhost:3001`

## 2.5 Design and Implementation Constraints
- JWT-based authentication and RBAC.
- CORS must be configured for the frontend origin(s).
- File uploads must enforce type/size restrictions.
- Data integrity constraints (unique email, unique order number, FK relations).
- Time constraints and academic schedule constraints (project submission timeline).

## 2.6 User Documentation
- Quick start guide for running the system locally.
- Swagger UI for API exploration.
- Basic UI cues and validation messages.

## 2.7 Assumptions and Dependencies
- PostgreSQL instance available.
- Storage location available for uploads (local or cloud).
- For intended payments: Stripe keys and webhook configuration.
- For intended notifications: SMTP credentials.

---

# 3 External Interface Requirements

## 3.1 User Interfaces
The system provides a browser-based UI with role-specific navigation.

Key screens (intended):
- Authentication: Login, Register
- Dashboards: Farmer / Exporter / Admin
- Products: List, Detail, Create/Edit (Farmer)
- Admin: Pending products and exporter verification
- Profile: view/update
- Orders (intended): view and manage orders

## 3.2 Hardware Interfaces
No special hardware integration is required.

## 3.3 Software Interfaces
- **PostgreSQL**: persistent storage for users, products, orders, order items, transactions.
- **File storage**: stores uploads (product images, certification documents, profile images). Current implementation stores in `wwwroot/uploads`.
- **Stripe (intended)**: payment intents, confirmations, transaction records.
- **Email/SMS (intended)**: verification notifications and transactional updates.

## 3.4 Communication Interfaces
- Protocol: HTTP in development; HTTPS required for production.
- Authentication: `Authorization: Bearer <JWT>`.
- Formats:
  - `application/json` for most requests.
  - `multipart/form-data` for endpoints that upload files.
- Error handling: standardized error responses with messages; client must handle `401` by logging out.

---

# 4 System Features

- Describes the description and priority, response sequences, and functional requirements of each feature.

## 4.1 Authentication and Authorization
**Priority:** High

**Description:** Allows users to register, login, maintain a session, and access features based on role.

**Response sequence (main success scenario):**
1. User registers or logs in.
2. System validates credentials and account status.
3. System issues a JWT token.
4. Client stores token and uses it for subsequent API calls.
5. Server enforces access via RBAC.

**Functional requirements:**
- **FR-01**: The system must allow new user registration.
- **FR-02**: The system must enforce unique email addresses.
- **FR-03**: The system must validate role ∈ {Admin, Farmer, Exporter}.
- **FR-04**: The system must support role-specific registration fields.
  - Intended: Farmer ID proof document (file upload) and Exporter company name.
  - Current implementation note: backend registration currently accepts `FarmerIdProofUrl` (string) in JSON.
- **FR-05**: Farmers must be marked verified by default; exporters must require admin verification.
- **FR-06**: The system must allow login using email + password.
- **FR-07**: The system must reject invalid credentials.
- **FR-08**: The system must reject deactivated accounts.
- **FR-09**: The system must issue a JWT token on successful login.
- **FR-10**: The system must provide an endpoint to fetch the current authenticated user.
- **FR-11**: The frontend must persist the JWT and user profile locally to restore sessions.
- **FR-12**: The system must invalidate the session on `401 Unauthorized` responses.
- **FR-13**: The backend must restrict endpoints by role as appropriate.
- **FR-14**: The frontend must restrict protected routes and show an unauthorized state.

## 4.2 User Profile Management
**Priority:** High

**Description:** Users can view and update their profile and change password; profile images can be uploaded.

**Response sequence (update profile):**
1. User opens profile.
2. User edits fields and optionally attaches a profile image.
3. System validates the request and stores the updated profile.
4. System returns updated profile/confirmation.

**Functional requirements:**
- **FR-15**: The system must allow authenticated users to view their profile.
- **FR-16**: The system must allow users to update editable fields.
- **FR-17**: Exporters may update company name; non-exporters must not.
- **FR-18**: The system must support profile image upload and store the image URL.
- **FR-19**: The system must allow a user to change password by supplying the current password and a new password.
- **FR-20**: The system must reject password change if the current password is invalid.

## 4.3 Product Listing, Search, and Management
**Priority:** High

**Description:** Farmers create/manage listings; all authenticated roles browse products with filters and pagination. New listings require admin approval.

**Response sequence (create product):**
1. Farmer submits product details with optional images/documents.
2. System validates and stores the listing with status `Pending`.
3. Admin reviews pending listings and approves or rejects.
4. Approved listings become `Available` and visible in product browsing.

**Functional requirements:**
- **FR-21**: The system must allow farmers to create product listings.
- **FR-22**: Product listing must include: vegetable name, grade, price/kg, quantity (kg), harvest date, district.
- **FR-23**: Product listing may include: variety, description, image, certification document, organic/export-ready flags.
- **FR-24**: New products must default to status `Pending` and require admin approval.
- **FR-25**: The system must allow a farmer to update their own product listings.
- **FR-26**: The system must reject updates to products owned by other farmers.
- **FR-27**: Farmers must be able to delete their own products.
- **FR-28**: Admins must be able to delete any product.
- **FR-29**: The system must provide product listing retrieval with filtering.
- **FR-30**: Filters must include: vegetable name, district, grade, min/max price, min/max quantity, export-ready, organic, status, harvest date range.
- **FR-31**: Sorting must include price/date/quantity ascending and descending.
- **FR-32**: The system must support pagination with total count and total pages.
- **FR-33**: By default, non-admin users must only see products with status `Available`.
- **FR-34**: The system must allow retrieving a single product by ID.
- **FR-35**: Product details must include farmer contact details as appropriate.

## 4.4 Admin Approval and Exporter Verification
**Priority:** High

**Description:** Admins verify exporters and approve/reject products to improve platform trust.

**Response sequence (approve product):**
1. Admin views the list of pending products.
2. Admin selects a product and approves.
3. System updates status to `Available`.

**Response sequence (verify exporter):**
1. Admin views unverified exporters.
2. Admin verifies an exporter.
3. System sets `IsVerified=true`.

**Functional requirements:**
- **FR-36**: The system must allow admins to list products with status `Pending`.
- **FR-37**: The system must allow admins to approve pending products.
- **FR-38**: Approving a product must change status from `Pending` → `Available`.
- **FR-39**: The system must allow admins to reject pending products.
- **FR-40**: Rejecting a product must remove the product (or mark it rejected).
- **FR-41**: The system must allow admins to list exporters where `isVerified=false`.
- **FR-42**: The system must allow admins to set exporter `isVerified=true`.
- **FR-43**: The system must prevent verifying a non-exporter via the exporter verification flow.

## 4.5 Dashboards and Reporting
**Priority:** Medium

**Description:** Dashboards provide summary statistics and recent activity lists per role.

**Response sequence:**
1. User navigates to their dashboard.
2. System aggregates and returns metrics.
3. UI displays summary cards and recent items.

**Functional requirements:**
- **FR-44**: Farmer dashboard must show total/pending/approved products.
- **FR-45**: Farmer dashboard must show total orders and total revenue (completed orders).
- **FR-46**: Farmer dashboard must show recent products.
- **FR-47**: Exporter dashboard must show available products count.
- **FR-48**: Exporter dashboard must show exporter order metrics and total spend.
- **FR-49**: Exporter dashboard should show recommended products.
- **FR-50**: Admin dashboard must show total users, farmers, exporters, and unverified exporters.
- **FR-51**: Admin dashboard must show pending products, total products, total orders, total revenue.
- **FR-52**: Admin dashboard must show recent pending products and recent unverified exporters.

## 4.6 Ordering and Payments (Intended Feature)
**Priority:** Medium (Future Release)

**Description:** Exporters place orders for products and complete payments; system stores transactions.

**Response sequence (intended):**
1. Exporter selects products and quantities.
2. System validates stock and computes totals.
3. Exporter confirms order.
4. Exporter pays via Stripe.
5. System records transaction and updates payment status.

**Functional requirements (intended):**
- **FR-53**: The system must allow an exporter to create an order containing one or more products and quantities.
- **FR-54**: The system must compute order totals as the sum of order item subtotals.
- **FR-55**: The system must validate requested quantity against available stock.
- **FR-56**: The system must allow viewing order history and details.
- **FR-57**: The system must track status changes (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled).
- **FR-58**: The system must create Stripe payment intents for orders.
- **FR-59**: The system must record transactions with a unique transaction ID and status.
- **FR-60**: The system must support webhook confirmation to finalize payment status.

---

# 5 Other Nonfunctional Requirements

## 5.1 Performance Requirements
- **NFR-01**: The system should return typical API responses within 1 second under normal load (excluding large file uploads).
- **NFR-02**: The products listing endpoint must support pagination to avoid returning unbounded datasets.
- **NFR-03**: The system should support at least 50 concurrent users in a small-scale deployment without significant degradation.

## 5.2 Safety Requirements
- **NFR-04**: The system must prevent accidental data loss via validation and confirmations for destructive operations (e.g., product deletion).
- **NFR-05**: The system should ensure safe handling of file uploads (reject unexpected file types and oversized files).

## 5.3 Security Requirements
- **NFR-06**: Passwords must never be stored in plaintext; they must be hashed securely.
- **NFR-07**: All protected endpoints must require JWT authentication.
- **NFR-08**: Role-protected endpoints must enforce role checks server-side (RBAC).
- **NFR-09**: Tokens must be validated strictly (issuer, audience, signature, expiry).
- **NFR-10**: Production deployments must use HTTPS.
- **NFR-11**: The system must apply the principle of least privilege: only Admins can approve/reject products and verify exporters.

## 5.4 Software Quality Attributes
- **NFR-12 (Usability)**: The UI must provide clear validation and error feedback.
- **NFR-13 (Reliability)**: The system should handle errors gracefully and avoid crashing on unexpected inputs.
- **NFR-14 (Maintainability)**: The codebase should keep a clear separation of concerns (controllers/services/data access; frontend service layer).
- **NFR-15 (Testability)**: Business logic should be structured so it can be unit tested independently of the UI.
- **NFR-16 (Compatibility)**: The system should support modern evergreen browsers.

## 5.5 Business Rules
- **BR-01**: Only products with status `Available` are visible by default to non-admin users.
- **BR-02**: Newly created products must start as `Pending`.
- **BR-03**: Only Admins can approve/reject products.
- **BR-04**: Exporter accounts require admin verification before being considered verified.
- **BR-05**: Farmers can only modify/delete their own products; Admins can delete any product.

---

# 6 Data Requirements

## 6.1 Data Entities

### 6.1.1 User
- **DR-01**: A user must have: full name, email (unique), password hash, role.
- **DR-02**: User may have: district, address, phone number, company name, farmer ID proof URL, profile image URL.
- **DR-03**: User must track: isVerified, isActive, createdAt, updatedAt.

### 6.1.2 Product
- **DR-04**: A product must have: farmerId, vegetable name, grade, price/kg, quantity, harvest date, district, status.
- **DR-05**: Product may have: variety, description, image URL, certification URL, organic/export-ready flags.

### 6.1.3 Order, OrderItem, Transaction (if enabled)
- **DR-06**: An order must have: order number (unique), exporterId, total amount, status, payment status.
- **DR-07**: An order must have 1..n order items; each order item references exactly one product.
- **DR-08**: A transaction must reference exactly one order and store payment metadata (IDs, status, currency).

## 6.2 Data Integrity and Validation
- **DR-09**: Email must be unique.
- **DR-10**: Foreign keys must enforce referential integrity between user–products and exporter–orders.

## 6.3 Data Retention and Backup
- **DR-11**: The database should be backed up regularly (daily recommended) in production.
- **DR-12**: Uploaded media/documents should be stored durably (Cloudinary or equivalent) and referenced by URL.

---

# Appendix A – Glossary
- **Admin:** System administrator with approval and verification privileges.
- **Farmer:** Producer who creates product listings.
- **Exporter:** Buyer who browses approved products and (intended) places orders.
- **JWT:** JSON Web Token used for authentication.
- **RBAC:** Role-Based Access Control.

# Appendix B – Analysis Models

> Ensure that the text in the diagrams remains visible when the report is printed.

## Use Case Diagram
- Prepared separately (Use Case Diagram – done).
- Actors: Guest, Farmer, Exporter, Admin (and intended external services).

## Class Diagram
- Prepared separately (Class Diagram – done).
- Includes domain entities (User, Product, Order, OrderItem, Transaction) and service/controller operations.

## ER Diagram
- Prepared separately (ER Diagram – done).
- Entities: User, Product, Order, OrderItem, Transaction.

---

## Additional Reference Information

### Product Status Workflow
1. `Pending`: Farmer creates product (awaiting approval)
2. `Available`: Admin approves product
3. `Sold`: Order completed (intended)
4. `OutOfStock`: Quantity becomes zero or listing disabled

### Sri Lankan District List
Colombo, Gampaha, Kalutara, Kandy, Matale, Nuwara Eliya, Galle, Matara, Hambantota, Jaffna, Kilinochchi, Mannar, Vavuniya, Mullaitivu, Batticaloa, Ampara, Trincomalee, Kurunegala, Puttalam, Anuradhapura, Polonnaruwa, Badulla, Monaragala, Ratnapura, Kegalle

### API Summary (Key Endpoints)
Base URL: `http://localhost:5189/api`

- Auth
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - `PUT /auth/verify-exporter/{userId}` (Admin)
  - `GET /auth/unverified-exporters` (Admin)

- Products
  - `POST /products` (Farmer)
  - `GET /products` (Authenticated)
  - `GET /products/{id}` (Authenticated)
  - `GET /products/my-products` (Farmer)
  - `GET /products/pending` (Admin)
  - `PUT /products/{id}` (Farmer)
  - `DELETE /products/{id}` (Farmer/Admin)
  - `PUT /products/{id}/approve` (Admin)
  - `PUT /products/{id}/reject` (Admin)

- User
  - `GET /user/profile`
  - `PUT /user/profile`
  - `POST /user/change-password`
  - `POST /user/upload-profile-image`

- Dashboard
  - `GET /dashboard/farmer` (Farmer)
  - `GET /dashboard/exporter` (Exporter)
  - `GET /dashboard/admin` (Admin)

