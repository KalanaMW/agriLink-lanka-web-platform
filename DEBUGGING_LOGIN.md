# Debugging Login Issues

## Current Status
✅ Backend API is running on `http://localhost:5189`
✅ Frontend is running on `http://localhost:3001`
✅ CORS is configured for both ports 3000 and 3001
✅ Database is seeded with test users
✅ Environment variables are set correctly

## How to Debug

### Step 1: Verify Backend is Running
```bash
# Check if port 5189 is open
lsof -i :5189

# Or check with curl
curl http://localhost:5189/api/health
```

### Step 2: Test Login API Directly
Run the test script:
```bash
./test-login.sh
```

Or test manually:
```bash
curl -X POST http://localhost:5189/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agrilink.lk","password":"admin123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "Admin User",
    "email": "admin@agrilink.lk",
    "role": "Admin",
    ...
  }
}
```

### Step 3: Open Browser Console
1. Open your browser (Chrome/Firefox/Safari)
2. Navigate to `http://localhost:3001/login`
3. Press `F12` or `Cmd+Option+I` to open Developer Tools
4. Go to the **Console** tab
5. Go to the **Network** tab
6. Try to login with: `admin@agrilink.lk` / `admin123`
7. Look for errors in both tabs

### Step 4: Common Issues & Solutions

#### Issue: "Network Error" or "ERR_CONNECTION_REFUSED"
**Cause**: Backend is not running
**Solution**: 
```bash
cd backend/AgriLink.API
dotnet run
```

#### Issue: "CORS Error" in browser console
**Cause**: CORS not configured for your port
**Solution**: Check `backend/AgriLink.API/Program.cs` includes your port

#### Issue: "401 Unauthorized" or "Invalid credentials"
**Cause**: Password hashing mismatch
**Solution**: 
1. Check database to verify password is hashed correctly
2. Try re-seeding the database:
```bash
# In PostgreSQL
DELETE FROM "Users";
# Then restart backend to re-seed
```

#### Issue: "Cannot read properties of undefined"
**Cause**: Response format mismatch
**Solution**: Check Network tab to see the actual API response

### Step 5: Check Network Tab Details

When you try to login, check:
1. **Request URL**: Should be `http://localhost:5189/api/auth/login`
2. **Request Method**: Should be `POST`
3. **Request Headers**: Should include `Content-Type: application/json`
4. **Request Payload**: Should show `{"email":"...","password":"..."}`
5. **Response Status**: Should be `200 OK` for success
6. **Response Body**: Should contain `token` and `user` fields

### Step 6: What to Tell Me

If login still doesn't work, tell me:
1. What you see in the **Console** tab (any red errors?)
2. What you see in the **Network** tab for the `/auth/login` request:
   - Status code (200, 400, 401, 500, etc.)
   - Response body
3. The exact error message shown on the login page

## Quick Test Checklist

- [ ] Backend running? Check with: `lsof -i :5189`
- [ ] Frontend running? Check with: `lsof -i :3001`
- [ ] Can curl the API? Run: `./test-login.sh`
- [ ] Browser console open? Press F12
- [ ] Network tab recording? Try login and check request
- [ ] What's the response status code?
- [ ] What's the response body?

## Emergency Reset

If nothing works, try this complete reset:

```bash
# 1. Stop everything
# Press Ctrl+C in both terminal windows

# 2. Clear frontend cache
rm -rf .next
npm install

# 3. Reset database (optional)
# In PostgreSQL: DROP DATABASE agrilink_db; CREATE DATABASE agrilink_db;

# 4. Start backend
cd backend/AgriLink.API
dotnet run

# 5. In another terminal, start frontend
npm run dev

# 6. Try login again with browser console open
```
