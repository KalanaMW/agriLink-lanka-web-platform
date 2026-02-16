# AgriLink Lanka - Quick Start Guide

## Prerequisites
- .NET 9 SDK installed
- Node.js installed
- PostgreSQL 16 running
- Database `agrilink_db` created

## Starting the Application

### Terminal 1: Start Backend API
```bash
cd backend/AgriLink.API
dotnet run
```
The API will start on: `http://localhost:5189`
Swagger UI available at: `http://localhost:5189/swagger`

### Terminal 2: Start Frontend
```bash
npm run dev
```
The frontend will start on: `http://localhost:3000` or `http://localhost:3001`

## Test Credentials

### Admin
- Email: `admin@agrilink.lk`
- Password: `admin123`

### Farmer
- Email: `farmer@agrilink.lk`
- Password: `farmer123`

### Exporter (Verified)
- Email: `exporter@keells.com`
- Password: `exporter123`

### Exporter (Unverified)
- Email: `exporter@cargills.com`
- Password: `exporter123`

## Troubleshooting

### Backend Issues
1. **Database connection error**: Ensure PostgreSQL is running and credentials in `appsettings.json` are correct
2. **Port 5189 in use**: Kill the process or change port in `launchSettings.json`
3. **Database not seeded**: Delete `__EFMigrationsHistory` table and restart

### Frontend Issues
1. **CORS errors**: Ensure backend is running and CORS is configured for `http://localhost:3001`
2. **API connection failed**: Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5189/api`
3. **Login not working**: Open browser console (F12) to see exact error message

### Testing the API
```bash
# Test health endpoint
curl http://localhost:5189/api/health

# Test login
curl -X POST http://localhost:5189/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agrilink.lk","password":"admin123"}'
```

## Important Notes
- Backend MUST be running before testing login
- Frontend is on port 3001 (3000 may be in use)
- Check browser console for detailed error messages
- Database is automatically seeded on first run
