# AgriLink Lanka - API Endpoints Documentation

## Base URL
`http://localhost:5189/api`

## Authentication Endpoints

### Register
**POST** `/auth/register`
- **Body**: `multipart/form-data`
  ```json
  {
    "fullName": "string",
    "email": "string",
    "password": "string",
    "role": "Farmer | Exporter | Admin",
    "district": "string",
    "address": "string",
    "phoneNumber": "string",
    "companyName": "string (for Exporter)",
    "farmerIdProof": "file (for Farmer)"
  }
  ```

### Login
**POST** `/auth/login`
- **Body**: `application/json`
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "JWT_TOKEN",
    "user": { ... }
  }
  ```

### Get Current User
**GET** `/auth/me`
- **Headers**: `Authorization: Bearer {token}`

### Verify Exporter (Admin only)
**PUT** `/auth/verify-exporter/{userId}`
- **Headers**: `Authorization: Bearer {token}`

### Get Unverified Exporters (Admin only)
**GET** `/auth/unverified-exporters`
- **Headers**: `Authorization: Bearer {token}`

---

## Product Endpoints

### Create Product (Farmer only)
**POST** `/products`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `multipart/form-data`
  ```json
  {
    "vegetableName": "string",
    "variety": "string",
    "grade": "string",
    "pricePerKg": "number",
    "availableQuantityKg": "number",
    "harvestDate": "date",
    "district": "string",
    "description": "string",
    "isExportReady": "boolean",
    "isOrganic": "boolean",
    "productImage": "file",
    "certificationDocument": "file"
  }
  ```
- **Note**: Products are created with "Pending" status and require admin approval

### Get All Products (with filters)
**GET** `/products?{filters}`
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `vegetableName`: Filter by vegetable name
  - `district`: Filter by district
  - `grade`: Filter by grade (A, B, C)
  - `minPrice`: Minimum price per kg
  - `maxPrice`: Maximum price per kg
  - `minQuantity`: Minimum available quantity
  - `maxQuantity`: Maximum available quantity
  - `isExportReady`: Filter by export readiness
  - `isOrganic`: Filter by organic certification
  - `status`: Filter by status (Pending, Available, Sold, OutOfStock)
  - `harvestDateFrom`: Start date
  - `harvestDateTo`: End date
  - `pageNumber`: Page number (default: 1)
  - `pageSize`: Items per page (default: 10)
  - `sortBy`: Sort order (PriceAsc, PriceDesc, DateAsc, DateDesc, QuantityAsc, QuantityDesc)
- **Note**: Non-admin users only see "Available" products by default

### Get Single Product
**GET** `/products/{id}`
- **Headers**: `Authorization: Bearer {token}`

### Get My Products (Farmer only)
**GET** `/products/my-products`
- **Headers**: `Authorization: Bearer {token}`

### Get Pending Products (Admin only)
**GET** `/products/pending`
- **Headers**: `Authorization: Bearer {token}`

### Update Product (Farmer only - own products)
**PUT** `/products/{id}`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `multipart/form-data` (same as create, all fields optional)

### Delete Product (Farmer - own products, Admin - any)
**DELETE** `/products/{id}`
- **Headers**: `Authorization: Bearer {token}`

### Approve Product (Admin only)
**PUT** `/products/{id}/approve`
- **Headers**: `Authorization: Bearer {token}`
- **Note**: Changes status from "Pending" to "Available"

### Reject Product (Admin only)
**PUT** `/products/{id}/reject`
- **Headers**: `Authorization: Bearer {token}`
- **Note**: Deletes the product

---

## User Profile Endpoints

### Get Profile
**GET** `/user/profile`
- **Headers**: `Authorization: Bearer {token}`

### Update Profile
**PUT** `/user/profile`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `multipart/form-data`
  ```json
  {
    "fullName": "string",
    "district": "string",
    "address": "string",
    "phoneNumber": "string",
    "companyName": "string (for Exporter)",
    "profileImage": "file"
  }
  ```

### Change Password
**POST** `/user/change-password`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `application/json`
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string",
    "confirmPassword": "string"
  }
  ```

### Upload Profile Image
**POST** `/user/upload-profile-image`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `multipart/form-data`
  ```json
  {
    "profileImage": "file"
  }
  ```

---

## Dashboard Endpoints

### Farmer Dashboard
**GET** `/dashboard/farmer`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "totalProducts": "number",
    "pendingProducts": "number",
    "approvedProducts": "number",
    "totalOrders": "number",
    "totalRevenue": "number",
    "recentProducts": []
  }
  ```

### Exporter Dashboard
**GET** `/dashboard/exporter`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "availableProducts": "number",
    "totalOrders": "number",
    "pendingOrders": "number",
    "completedOrders": "number",
    "totalSpent": "number",
    "recommendedProducts": []
  }
  ```

### Admin Dashboard
**GET** `/dashboard/admin`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "totalUsers": "number",
    "totalFarmers": "number",
    "totalExporters": "number",
    "unverifiedExporters": "number",
    "pendingProducts": "number",
    "totalProducts": "number",
    "totalOrders": "number",
    "totalRevenue": "number",
    "recentPendingProducts": [],
    "recentUnverifiedExporters": []
  }
  ```

---

## Sample User Credentials

### Admin
- **Email**: admin@agrilink.lk
- **Password**: admin123
- **Status**: Verified

### Farmer
- **Email**: farmer@agrilink.lk
- **Password**: farmer123
- **Status**: Verified

### Exporter (Verified)
- **Email**: exporter@keells.com
- **Password**: exporter123
- **Status**: Verified

### Exporter (Unverified)
- **Email**: exporter@cargills.com
- **Password**: exporter123
- **Status**: Not Verified

---

## Image Upload Configuration

### Cloudinary Settings
- **Cloud Name**: dgyqfax25
- **Folders**:
  - `agrilink/products` - Product images
  - `agrilink/certifications` - Certification documents
  - `agrilink/profiles` - User profile photos
  - `agrilink/farmer-ids` - Farmer ID proof documents

### File Restrictions
- **Allowed Types**: JPEG, PNG, WebP
- **Max File Size**: 5MB
- **Auto-transformation**: Resized to 800x800, optimized quality

---

## Product Status Workflow

1. **Pending**: Farmer creates product → Status = "Pending"
2. **Available**: Admin approves product → Status = "Available" → Visible to Exporters
3. **Sold**: Order completed → Status = "Sold"
4. **OutOfStock**: No quantity available → Status = "OutOfStock"
5. **Rejected**: Admin rejects → Product deleted

---

## Sri Lankan Districts
Colombo, Gampaha, Kalutara, Kandy, Matale, Nuwara Eliya, Galle, Matara, Hambantota, Jaffna, Kilinochchi, Mannar, Vavuniya, Mullaitivu, Batticaloa, Ampara, Trincomalee, Kurunegala, Puttalam, Anuradhapura, Polonnaruwa, Badulla, Monaragala, Ratnapura, Kegalle

---

## Swagger Documentation
- **URL**: http://localhost:5189/swagger
- Access interactive API documentation with try-it-out functionality

---

## Health Check
**GET** `/health`
- No authentication required
- Returns server status and timestamp
