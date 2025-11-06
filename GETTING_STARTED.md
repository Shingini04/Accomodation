# Getting Started - Accommodation Portal

Quick start guide to get the Accommodation Portal running on your local machine.

## What You've Got

A complete full-stack accommodation management system with:

### Backend (Express + TypeORM + TypeGraphQL)
- **Location**: `./backend/` directory
- **Tech**: Node.js, Express, Apollo Server, TypeGraphQL, TypeORM, PostgreSQL
- **Features**: GraphQL API, Razorpay payments, SendGrid emails, room management

### Frontend (React + TypeScript)
- **Location**: `./src/` directory
- **Tech**: React, TypeScript, Apollo Client, Tailwind CSS, React Router
- **Features**: User registration, admin dashboard, support system, data export

## Prerequisites

Before starting, install:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
3. **Git** - [Download here](https://git-scm.com/)

## Setup Steps

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 2. Set Up PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE accommodation_portal;

# Exit
\q
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/accommodation_portal
PORT=4000

# Get from https://dashboard.razorpay.com/
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_SECRET=your_secret_key

# Get from https://sendgrid.com/
SENDGRID_API_KEY=SG.xxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@shaastra.org

FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env`):
```bash
cd ..
cp .env.example .env
```

Edit `.env`:
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

### 4. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend will start at: http://localhost:4000
GraphQL Playground: http://localhost:4000/graphql

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Frontend will start at: http://localhost:5173

### 5. Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Register Now"
3. Fill the accommodation form
4. Test payment flow (use Razorpay test cards)

## Key Features to Test

### User Features
- **Home Page** (`/`) - Landing page with information
- **Registration** (`/accommodation`) - Complete accommodation form
- **Support** (`/support`) - Submit support tickets

### Admin Features
- **Dashboard** (`/admin`) - View analytics and statistics
- **Room Management** (`/admin/rooms`) - Create and manage rooms
- **Data Export** (`/admin/export`) - Export CSV reports

## Testing Payments

Use Razorpay test cards:

**Successful Payment:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: 4111 1111 1111 1234

## API Endpoints

### GraphQL Playground
Access at: http://localhost:4000/graphql

### Example Queries

**Get Dashboard Stats:**
```graphql
query {
  getDashboardStats {
    totalAccommodations
    paidAccommodations
    totalRevenue
    occupancyRate
  }
}
```

**Get All Rooms:**
```graphql
query {
  getRooms {
    roomNumber
    hostelName
    capacity
    occupied
    available
  }
}
```

**Create Room:**
```graphql
mutation {
  createRoom(data: {
    roomNumber: "101"
    hostelName: "Hostel A"
    roomType: "Double"
    capacity: 2
  }) {
    id
    roomNumber
  }
}
```

## Project Structure

```
project/
├── backend/              # Express backend
│   ├── src/
│   │   ├── entities/    # Database models
│   │   ├── resolvers/   # GraphQL resolvers
│   │   ├── services/    # Business logic
│   │   └── index.ts     # Server entry
│   └── package.json
│
├── src/                  # React frontend
│   ├── components/      # React components
│   ├── graphql/         # GraphQL queries
│   ├── lib/            # Apollo Client
│   └── types/          # TypeScript types
│
├── README.md            # Main documentation
├── DEPLOYMENT.md        # Deployment guide
└── package.json
```

## Common Issues & Solutions

### Issue: Backend won't start
**Error**: `Database connection failed`
**Solution**:
- Check PostgreSQL is running: `sudo service postgresql status`
- Verify DATABASE_URL in backend/.env
- Ensure database exists: `psql -l`

### Issue: Payment verification fails
**Error**: `Invalid signature`
**Solution**:
- Verify RAZORPAY_SECRET in backend/.env
- Check Razorpay dashboard for correct keys
- Ensure using test keys for development

### Issue: Frontend can't connect to backend
**Error**: `Network error` or `CORS error`
**Solution**:
- Ensure backend is running on port 4000
- Check VITE_GRAPHQL_ENDPOINT in .env
- Verify FRONTEND_URL in backend/.env

### Issue: Emails not sending
**Error**: `SendGrid error`
**Solution**:
- Verify SENDGRID_API_KEY
- Check sender email is verified
- Review SendGrid dashboard logs

## Database Management

### View Tables
```bash
psql -U postgres -d accommodation_portal
\dt
```

### Reset Database
```bash
psql -U postgres
DROP DATABASE accommodation_portal;
CREATE DATABASE accommodation_portal;
\q
```

### Run Migrations
```bash
cd backend
npm run migration:run
```

## Development Workflow

1. **Make Changes**
   - Backend: Edit files in `backend/src/`
   - Frontend: Edit files in `src/`

2. **Hot Reload**
   - Backend: Auto-restarts on file changes
   - Frontend: Auto-refreshes in browser

3. **Test Changes**
   - Backend: Use GraphQL Playground
   - Frontend: Test in browser at localhost:5173

4. **Build for Production**
   ```bash
   # Frontend
   npm run build

   # Backend
   cd backend
   npm run build
   ```

## Next Steps

1. **Add Real Users**: Integrate with Shaastra SSO
2. **Add Authentication**: Implement JWT or session-based auth
3. **Deploy**: Follow DEPLOYMENT.md guide
4. **Customize**: Update branding, colors, content
5. **Scale**: Add caching, CDN, load balancing

## Getting Help

- **Documentation**: Check README.md and DEPLOYMENT.md
- **GraphQL Schema**: Visit http://localhost:4000/graphql
- **Logs**: Check terminal output for errors
- **Issues**: Review common issues section above

## Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter

# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Compile TypeScript
npm start           # Start production server
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations

# Database
psql -U postgres -d accommodation_portal  # Connect to DB
\dt                  # List tables
\d+ table_name      # Describe table
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [TypeGraphQL](https://typegraphql.com/)
- [TypeORM](https://typeorm.io/)
- [Razorpay API](https://razorpay.com/docs/api/)
- [SendGrid API](https://docs.sendgrid.com/)

## Support

For questions or issues:
1. Check this documentation
2. Review error logs
3. Test with GraphQL Playground
4. Check environment variables
5. Verify database connection

Happy coding! 🚀
