# Quick Start Guide

## Current Status ✅

Your project is now separated into frontend and backend folders and **both servers are running!**

- **Backend**: http://localhost:4000 (GraphQL: http://localhost:4000/graphql)
- **Frontend**: http://localhost:5173

## Project Structure

```
project 10/
├── frontend/          ← React frontend (Apollo Client)
│   ├── src/
│   ├── .env          ← Points to http://localhost:4000/graphql
│   └── package.json
│
├── backend/          ← Express GraphQL API
│   ├── src/
│   ├── .env          ← Database & API keys
│   └── package.json
│
└── package.json      ← Root workspace commands
```

## Development Commands

### Start Both Servers (in separate terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Alternative: Start from root (requires concurrently)
```bash
# Install root dependencies first
npm install

# Start both servers together
npm run dev
```

## Quick Test

1. **Open Frontend**: http://localhost:5173
2. **Test Admin Dashboard**: Navigate to `/admin`, password: `shaastra2025`
3. **Check GraphQL Playground**: http://localhost:4000/graphql

## Connection Verified ✅

- Frontend Apollo Client → `http://localhost:4000/graphql`
- Backend CORS allows → `http://localhost:5173`
- Both servers running successfully

## Seed Test Data

```bash
cd backend
npx ts-node seedTestUser.ts
npx ts-node seedAccommodations.ts
npx ts-node seedRooms.ts
npx ts-node seedSupportTickets.ts
```

## Test User Credentials

- **Shaastra ID**: TEST12345
- **Password**: Test@1234

## Admin Access

- **URL**: http://localhost:5173/admin
- **Password**: shaastra2025

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

**Frontend can't connect to backend?**
- Check backend is running on port 4000
- Verify `frontend/.env` has `VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql`
- Check browser console for CORS errors

**Database connection error?**
- Ensure PostgreSQL is running
- Check `backend/.env` DATABASE_URL is correct

## Next Steps

1. ✅ Project restructured (frontend + backend separated)
2. ✅ Both servers running
3. ✅ Apollo Client connected
4. Ready to develop! 🚀

Access your app at: **http://localhost:5173**
