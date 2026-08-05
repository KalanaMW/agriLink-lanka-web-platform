# This project was finalized on 5th August 2026.

# AgriLink Lanka

A comprehensive web-based platform that connects farmers and exporters to enable listing, verification, approval, discovery, and purchasing workflows for agricultural produce.

---

## Quick Start Guide

### Prerequisites
- .NET 9 SDK installed
- Node.js installed
- PostgreSQL 16 running
- Database `agrilink_db` created

### Starting the Application

#### Terminal 1: Start Backend API
```bash
cd AgriLink.API
dotnet run
```
The API will start on: `http://localhost:5189`
Swagger UI available at: `http://localhost:5189/swagger`

#### Terminal 2: Start Frontend
```bash
npm run dev
```
The frontend will start on: `http://localhost:3000` or `http://localhost:3001`

### Test Credentials

#### Admin
- Email: `admin@agrilink.lk`
- Password: `admin123`

#### Farmer
- Email: `farmer@agrilink.lk`
- Password: `farmer123`

#### Exporter (Verified)
- Email: `exporter@keells.com`
- Password: `exporter123`

#### Exporter (Unverified)
- Email: `exporter@cargills.com`
- Password: `exporter123`

---
*For API documentation, debugging guides, architecture details, and project requirements, please refer to [info.md](./info.md).*
