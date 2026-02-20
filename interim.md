# AgriLink Lanka — Interim Implementation Report

> **Project:** AgriLink Lanka — Agricultural Marketplace Platform  
> **Stack:** Next.js 15 (App Router) + ASP.NET Core (.NET 9) + PostgreSQL  
> **Date:** February 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [UI/UX Visual Polish](#uiux-visual-polish)
7. [SRS Feature Coverage](#srs-feature-coverage)
8. [Build Status](#build-status)

---

## Overview

AgriLink Lanka is a full-stack agricultural marketplace connecting Sri Lankan farmers with global exporters. The platform eliminates intermediaries, ensures fair trade, and provides a transparent, efficient export ecosystem.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, TailwindCSS 4, Framer Motion |
| Backend | ASP.NET Core (.NET 9) Web API, Entity Framework Core |
| Database | PostgreSQL (Npgsql) |
| Auth | JWT Bearer Tokens, BCrypt password hashing |
| File Storage | Local storage (`wwwroot/uploads/`) |
| API Docs | Swagger / OpenAPI |

### User Roles

- **Admin** — Manage users, approve/reject products, verify exporters, view platform analytics
- **Farmer** — List products, manage inventory, view orders, track revenue
- **Exporter** — Browse products, place orders, track shipments, manage spending

---

## Backend Implementation

### Controllers

#### 1. AuthController (`api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register a new user (Admin/Farmer/Exporter) |
| POST | `/api/auth/login` | Public | Login with email + password, returns JWT |
| GET | `/api/auth/me` | Authorized | Get current authenticated user |
| PUT | `/api/auth/verify-exporter/{userId}` | Admin | Verify an exporter account |
| GET | `/api/auth/unverified-exporters` | Admin | List all unverified exporters |

#### 2. ProductsController (`api/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/products` | Farmer | Create product (form-data with image/cert upload) |
| GET | `/api/products` | Authorized | List products with filters, sorting, pagination |
| GET | `/api/products/{id}` | Authorized | Get single product detail |
| GET | `/api/products/my-products` | Farmer | Get farmer's own products |
| PUT | `/api/products/{id}` | Farmer | Update own product (form-data) |
| DELETE | `/api/products/{id}` | Farmer/Admin | Delete a product |
| PUT | `/api/products/{id}/approve` | Admin | Approve a pending product |
| PUT | `/api/products/{id}/reject` | Admin | Reject a pending product |
| GET | `/api/products/pending` | Admin | List all pending products |

#### 3. OrdersController (`api/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | Exporter | Create order (validates stock, creates transaction) |
| GET | `/api/orders` | Authorized | List orders (role-dependent filtering) |
| GET | `/api/orders/{id}` | Authorized | Get single order with access control |
| PUT | `/api/orders/{id}/status` | Admin/Farmer | Update order status (state machine transitions) |
| PUT | `/api/orders/{id}/confirm-payment` | Exporter | Confirm payment for own order |
| DELETE | `/api/orders/{id}` | Exporter/Admin | Cancel pending/confirmed order (restores stock) |

#### 4. UserController (`api/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile` | Authorized | Get current user's profile |
| PUT | `/api/user/profile` | Authorized | Update profile (form-data, supports image upload) |
| POST | `/api/user/change-password` | Authorized | Change password |
| POST | `/api/user/upload-profile-image` | Authorized | Upload profile image |

#### 5. DashboardController (`api/dashboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/farmer` | Farmer | Farmer stats (products, orders, revenue) |
| GET | `/api/dashboard/exporter` | Exporter | Exporter stats (orders, spending, recommendations) |
| GET | `/api/dashboard/admin` | Admin | Admin stats (users, products, orders, revenue) |

#### 6. Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | Public | API health check |

### Backend Services

| Service | Purpose |
|---------|---------|
| **AuthService** | JWT token generation, BCrypt password hashing/verification |
| **CloudinaryService** | Local file upload to `wwwroot/uploads/`, file type validation (JPEG/PNG/WebP/PDF), 5MB size limit, file deletion |
| **DatabaseSeeder** | Seeds 4 sample users: Admin, Farmer, Verified Exporter (Keells), Unverified Exporter (Cargills) |

### Backend Models

| Model | Key Fields |
|-------|-----------|
| **User** | Id, FullName, Email, PasswordHash, Role, District, Address, PhoneNumber, CompanyName, ProfileImageUrl, IsVerified, IsActive, CreatedAt, UpdatedAt |
| **Product** | Id, FarmerId, VegetableName, Variety, Grade, PricePerKg, AvailableQuantityKg, Unit, Description, ImageUrl, IsOrganic, IsExportReady, CertificationUrl, Status, HarvestDate, ExpiryDate, District, CreatedAt, UpdatedAt |
| **Order** | Id, OrderNumber, ExporterId, TotalAmount, Status, PaymentStatus, PaymentIntentId, ShippingAddress, ShippingMethod, ShippingCost, TrackingNumber, ShippedDate, DeliveredDate, Notes, CreatedAt, UpdatedAt |
| **OrderItem** | Id, OrderId, ProductId, Quantity, PricePerUnit, Subtotal, CreatedAt |
| **Transaction** | Id, OrderId, TransactionId, Amount, Currency, PaymentMethod, Status, StripePaymentIntentId, StripeChargeId, FailureReason, CreatedAt, CompletedAt |

### Backend DTOs

| DTO | Purpose |
|-----|---------|
| `LoginDto` | Login request (email, password) |
| `RegisterDto` | Registration (fullName, email, password, role, district, etc.) |
| `AuthResponseDto` | Auth response (token, user) |
| `UserDto` | User data transfer |
| `UpdateProfileDto` | Profile update (form-data with optional image) |
| `ChangePasswordDto` | Change password request |
| `CreateProductDto` | Product creation (form-data with optional images) |
| `UpdateProductDto` | Product update (all fields optional) |
| `ProductResponseDto` | Product response (includes farmer info) |
| `ProductFilterDto` | Product query filters (name, district, grade, price range, pagination, sorting) |
| `CreateOrderDto` | Order creation (items + shipping info) |
| `CreateOrderItemDto` | Order item in create request |
| `UpdateOrderStatusDto` | Order status update (status, trackingNumber, notes) |
| `OrderResponseDto` | Full order response (includes items, transaction) |
| `OrderItemResponseDto` | Order item response (includes product details) |
| `TransactionResponseDto` | Transaction details |
| `FarmerDashboardDto` | Farmer dashboard stats + recent products |
| `ExporterDashboardDto` | Exporter dashboard stats + recommended products |
| `AdminDashboardDto` | Admin dashboard stats + pending items |

---

## Frontend Implementation

### Pages (19 Total)

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero section, problem statement, benefits, how it works, impact stats, comparison table, CTA |
| `/about` | About page — team info, mission, vision |
| `/contact` | Contact form with name, email, subject, message fields |
| `/login` | Login form with email/password, animated UI |
| `/register` | Registration form with role selection (Farmer/Exporter), conditional fields |
| `/dashboard` | Dashboard router — redirects to role-specific dashboard |
| `/dashboard/farmer` | Farmer dashboard — product stats, order stats, revenue, recent products |
| `/dashboard/exporter` | Exporter dashboard — order stats, spending, product browser with filters, product detail modal |
| `/dashboard/admin` | Admin dashboard — user/product/order stats, pending product approval, exporter verification |
| `/products` | Products listing with advanced filters (name, district, grade, price range, organic, export-ready, sort) |
| `/products/create` | Create product form (farmer only) — name, variety, grade, price, quantity, description, image, certification |
| `/products/[id]` | Product detail page — full product info, farmer details, order action for exporters |
| `/products/edit/[id]` | Edit product form (farmer only) — pre-filled with existing data |
| `/orders` | Orders page — create orders (exporter), view orders list, order detail modal, status badges |
| `/profile` | Profile management — edit personal info, change password, profile image upload |
| `/analytics` | Analytics page — platform statistics and charts |
| `/unauthorized` | Unauthorized access page — shown when user lacks permissions |

### Components

| Component | Purpose |
|-----------|---------|
| **Navbar** | Responsive navigation with mobile hamburger menu, profile avatar, role-based links (Dashboard, Orders), auth buttons |
| **Footer** | Site footer with gradient background, Next.js Link components, contact icons, dynamic copyright year |
| **ProtectedRoute** | HOC for route protection — checks auth state and required roles |
| **PageTransition** | Framer Motion animation variants for page transitions |
| **Button** | Reusable button component |
| **Input** | Reusable input component |

### Frontend Services

| Service | Functions |
|---------|-----------|
| **authService** | `login`, `register`, `getCurrentUser`, `logout`, `verifyExporter`, `getUnverifiedExporters` |
| **productService** | `getProducts`, `getProduct`, `getMyProducts`, `getPendingProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `approveProduct`, `rejectProduct` |
| **orderService** | `getOrders`, `getOrder`, `createOrder`, `updateOrderStatus`, `confirmPayment`, `cancelOrder` |
| **dashboardService** | `getFarmerDashboard`, `getExporterDashboard`, `getAdminDashboard` |
| **userService** | `getProfile`, `updateProfile`, `changePassword`, `uploadProfileImage` |

### Frontend Libraries

| Library | Purpose |
|---------|---------|
| **axios.ts** | Axios instances (`api`, `apiMultipart`) with JWT interceptors, base URL configuration |
| **auth.ts** | Token/user localStorage helpers — `setToken`, `getToken`, `removeToken`, `setUser`, `getUser`, `isAuthenticated`, `getUserRole`, `hasRole` |
| **utils.ts** | General utilities (image URL helpers, formatters) |

### Auth Context

`AuthContext` / `AuthProvider` wraps the entire app, providing:
- `user` — current authenticated user
- `isLoading` — loading state
- `isAuthenticated` — auth status
- `login()` — login function
- `logout()` — logout function
- `updateUser()` — update user data
- Auto-restores session from localStorage on mount

### TypeScript Types

All types defined in `src/types/index.ts`:
- `User`, `LoginDto`, `RegisterDto`, `AuthResponse`
- `Product`, `ProductFilter`, `PaginatedResponse<T>`, `CreateProductDto`
- `Order`, `OrderItem`, `Transaction`, `CreateOrderDto`
- `FarmerDashboard`, `ExporterDashboard`, `AdminDashboard`

---

## Database Schema

### Migrations

| Migration | Description |
|-----------|-------------|
| `InitialCreate` | Initial schema — Users, Products tables |
| `UpdateProductModel` | Product model updates (additional fields) |
| `AddProfileImageUrl` | Add ProfileImageUrl column to Users |
| `AddUserProfileImage` | Profile image refinements |
| `AddOrderSystem` | Orders, OrderItems, Transactions tables |

### Entity Relationships

```
User (1) ──── (N) Product       [Farmer creates products]
User (1) ──── (N) Order         [Exporter places orders]
Order (1) ──── (N) OrderItem    [Order contains items]
Product (1) ── (N) OrderItem    [Products appear in order items]
Order (1) ──── (1) Transaction  [Order has one payment transaction]
```

---

## Authentication & Authorization

### JWT Configuration
- Token-based authentication using JWT Bearer tokens
- BCrypt password hashing
- Role-based authorization: Admin, Farmer, Exporter
- Token stored in localStorage, attached via Axios interceptor

### Role-Based Access Control

| Feature | Admin | Farmer | Exporter |
|---------|-------|--------|----------|
| View Products | ✓ | ✓ | ✓ |
| Create Products | ✗ | ✓ | ✗ |
| Edit/Delete Own Products | ✗ | ✓ | ✗ |
| Approve/Reject Products | ✓ | ✗ | ✗ |
| Place Orders | ✗ | ✗ | ✓ |
| View Own Orders | ✗ | ✓ | ✓ |
| Update Order Status | ✓ | ✓ | ✗ |
| Confirm Payment | ✗ | ✗ | ✓ |
| Verify Exporters | ✓ | ✗ | ✗ |
| Admin Dashboard | ✓ | ✗ | ✗ |
| Farmer Dashboard | ✗ | ✓ | ✗ |
| Exporter Dashboard | ✗ | ✗ | ✓ |

---

## UI/UX Visual Polish

### Issues Fixed
1. **Form text visibility** — Removed CSS dark mode media query that caused whitish text on white input backgrounds when user's OS is in dark mode
2. **Forced light mode** — Added `html { color-scheme: light; }` to prevent dark mode inheritance
3. **Global form input styling** — Added CSS rules for all `input`, `select`, `textarea` elements with `color: #111827` and `background-color: #ffffff`

### Pages Updated with Consistent Input Styling
All form inputs across the entire application now have:
- `bg-white text-gray-900` for clear text visibility
- `border border-gray-300 rounded-lg` for consistent borders
- `focus:ring-2 focus:ring-green-500 focus:border-green-500` for green focus ring
- `transition` for smooth state changes

**Pages fixed:**
- Login page
- Register page
- Profile page
- Products create page
- Products edit page
- Orders page
- Contact page
- Products listing (filters)
- Exporter dashboard (filters)

### Footer Improvements
- Upgraded from plain `<a>` tags to Next.js `<Link>` components
- Added gradient background (`from-gray-800 to-gray-900`)
- Added SVG icons for email, phone, location
- Added "About" link to Quick Links
- Dynamic copyright year using `new Date().getFullYear()`
- Improved spacing, typography, and color hierarchy

### Global CSS Enhancements
- Smooth scrolling (`scroll-behavior: smooth`)
- Custom scrollbar styling (thin, slate-colored)
- Font smoothing (`-webkit-font-smoothing: antialiased`)
- Consistent placeholder colors (`#9ca3af`)
- Disabled input styling (`color: #6b7280, background: #f3f4f6`)

---

## SRS Feature Coverage

### Functional Requirements Implemented

| ID | Feature | Status |
|----|---------|--------|
| FR-01 | User Registration (Farmer/Exporter) | ✅ Implemented |
| FR-02 | User Login with JWT | ✅ Implemented |
| FR-03 | Role-Based Dashboard | ✅ Implemented |
| FR-04 | Farmer Product Listing (CRUD) | ✅ Implemented |
| FR-05 | Product Image Upload | ✅ Implemented |
| FR-06 | Product Certification Upload | ✅ Implemented |
| FR-07 | Product Search & Filtering | ✅ Implemented |
| FR-08 | Product Sorting & Pagination | ✅ Implemented |
| FR-09 | Product Detail View | ✅ Implemented |
| FR-10 | Admin Product Approval/Rejection | ✅ Implemented |
| FR-11 | Exporter Order Placement | ✅ Implemented |
| FR-12 | Order Status Tracking | ✅ Implemented |
| FR-13 | Order State Machine (Pending→Confirmed→Processing→Shipped→Delivered) | ✅ Implemented |
| FR-14 | Payment Status Tracking | ✅ Implemented |
| FR-15 | Stock Validation on Order | ✅ Implemented |
| FR-16 | Stock Restoration on Cancellation | ✅ Implemented |
| FR-17 | User Profile Management | ✅ Implemented |
| FR-18 | Password Change | ✅ Implemented |
| FR-19 | Profile Image Upload | ✅ Implemented |
| FR-20 | Admin Exporter Verification | ✅ Implemented |
| FR-21 | Farmer Dashboard (Stats + Recent Products) | ✅ Implemented |
| FR-22 | Exporter Dashboard (Stats + Recommended Products) | ✅ Implemented |
| FR-23 | Admin Dashboard (Platform-wide Stats) | ✅ Implemented |
| FR-24 | Responsive Design (Mobile + Desktop) | ✅ Implemented |
| FR-25 | Protected Routes | ✅ Implemented |
| FR-26 | Role-Based Navigation | ✅ Implemented |

### Non-Functional Requirements

| Requirement | Status |
|-------------|--------|
| Responsive UI | ✅ Mobile-first with TailwindCSS |
| API Documentation | ✅ Swagger/OpenAPI |
| Security (JWT + BCrypt) | ✅ Implemented |
| File Upload Validation | ✅ Type + size limits |
| CORS Configuration | ✅ Configured for localhost:3000 |
| Database Migrations | ✅ EF Core migrations |
| Seed Data | ✅ Database seeder with sample users |

---

## Build Status

| Component | Status | Details |
|-----------|--------|---------|
| **Backend** | ✅ Builds successfully | 0 warnings, 0 errors |
| **Frontend** | ✅ Builds successfully | 19 pages generated, 1 minor ESLint warning |
| **Static Pages** | 17 | Pre-rendered at build time |
| **Dynamic Pages** | 2 | `/products/[id]`, `/products/edit/[id]` |

---

*This report documents all implementations completed as of the current development phase.*
