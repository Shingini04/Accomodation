# Shaastra Accommodation Registration Portal

Full-stack accommodation management system with **separate frontend and backend folders**.

## Tech Stack

### Backend
- **Node.js + Express** - Web server
- **Apollo Server** - GraphQL server
- **TypeGraphQL** - Type-safe GraphQL schema
- **TypeORM** - Database ORM
- **PostgreSQL** - Database
- **Razorpay** - Payment processing
- **SendGrid** - Email notifications

### Frontend
- **React + TypeScript** - UI framework
- **Apollo Client** - GraphQL client
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Lucide React** - Icons

## Project Structure

```
project 10/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── graphql/           # GraphQL queries/mutations
│   │   ├── lib/               # Apollo Client setup
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── .env                   # Frontend config (GraphQL endpoint)
│
├── backend/                   # Express + TypeORM backend
│   ├── src/
│   │   ├── entities/          # TypeORM entities
│   │   │   ├── User.ts
│   │   │   ├── Accommodation.ts
│   │   │   ├── Room.ts
│   │   │   ├── Allotment.ts
│   │   │   ├── PaymentTransaction.ts
│   │   │   └── SupportTicket.ts
│   │   ├── resolvers/         # GraphQL resolvers
│   │   │   ├── AccommodationResolver.ts
│   │   │   ├── RoomResolver.ts
│   │   │   ├── SupportResolver.ts
│   │   │   ├── DashboardResolver.ts
│   │   │   └── ExportResolver.ts
│   │   ├── inputs/            # GraphQL input types
│   │   ├── types/             # GraphQL object types
│   │   ├── services/          # Business logic
│   │   │   ├── emailService.ts
│   │   │   └── exportService.ts
│   │   ├── data-source.ts     # TypeORM configuration
│   │   └── index.ts           # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                   # Backend config (DB, API keys)
│
└── README.md                  # This file
```

## Features

### User Features
1. **Accommodation Registration**
   - Complete registration form with personal details
   - ID verification (Aadhar, PAN, Passport, etc.)
   - Date selection with automatic pricing
   - Terms & conditions acceptance
   - Integrated Razorpay payment

2. **Support System**
   - Submit support tickets
   - Track ticket status
   - View responses from admin

### Admin Features
1. **Dashboard Analytics**
   - Total accommodations and revenue
   - Occupancy rates
   - Gender distribution
   - Payment statistics
   - Check-in/check-out tracking

2. **Room Management**
   - Create and manage rooms
   - Track capacity and occupancy
   - View available rooms

3. **Data Export**
   - Export accommodations as CSV
   - Export rooms as CSV
   - Export payments as CSV

4. **Support Management**
   - View all tickets
   - Respond to tickets
   - Track ticket status

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ database
- Razorpay account (for payments)
- SendGrid account (for emails)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/accommodation_portal
PORT=4000

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_SECRET=your_razorpay_secret

SENDGRID_API_KEY=SG.xxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@shaastra.org

FRONTEND_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run dev
```

The backend will start on `http://localhost:4000` with GraphQL playground at `http://localhost:4000/graphql`.

### Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

5. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`.

## Database Setup

### Using PostgreSQL

1. Create database:
```sql
CREATE DATABASE accommodation_portal;
```

2. TypeORM will automatically create tables on first run (synchronize: true in development).

3. For production, disable synchronize and use migrations:
```bash
cd backend
npm run migration:generate -- src/migrations/InitialSchema
npm run migration:run
```

## API Documentation

### GraphQL Endpoints

The GraphQL API is available at `http://localhost:4000/graphql`.

#### Key Mutations

**Create Accommodation:**
```graphql
mutation CreateAccommodation($data: CreateAccommodationInput!) {
  createAccommodation(data: $data) {
    accoId
    orderId
    amount
  }
}
```

**Verify Payment:**
```graphql
mutation VerifyRazorpayPayment(
  $orderId: String!
  $paymentId: String!
  $signature: String!
) {
  verifyRazorpayPayment(
    orderId: $orderId
    paymentId: $paymentId
    signature: $signature
  ) {
    accoId
    paid
  }
}
```

**Create Room:**
```graphql
mutation CreateRoom($data: CreateRoomInput!) {
  createRoom(data: $data) {
    id
    roomNumber
    hostelName
  }
}
```

#### Key Queries

**Get Dashboard Stats:**
```graphql
query GetDashboardStats {
  getDashboardStats {
    totalAccommodations
    paidAccommodations
    totalRevenue
    occupancyRate
  }
}
```

**Get Accommodations:**
```graphql
query GetAccommodations {
  getAccommodations {
    accoId
    name
    email
    amount
    paid
  }
}
```

## Payment Integration

### Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com)
2. Get API keys from Dashboard > Settings > API Keys
3. Use test keys for development:
   - Key ID: `rzp_test_xxxxxxxxxx`
   - Key Secret: `your_secret_here`
4. For production, use live keys

### Payment Flow

1. User fills accommodation form
2. Backend creates Razorpay order
3. Frontend opens Razorpay checkout
4. User completes payment
5. Backend verifies payment signature
6. Confirmation email sent

## Email Notifications

### SendGrid Setup

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key
3. Verify sender email
4. Add to `.env` file

### Email Templates

- Payment confirmation
- Room allotment
- Support ticket created
- Support ticket resolved

## Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `VITE_GRAPHQL_ENDPOINT`: Your backend URL
   - `VITE_RAZORPAY_KEY_ID`: Your Razorpay key
4. Deploy

### Database (Railway/Render PostgreSQL)

1. Create PostgreSQL database
2. Copy connection string
3. Update `DATABASE_URL` in backend environment

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
PORT=4000
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_SECRET=...
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@shaastra.org
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```env
VITE_GRAPHQL_ENDPOINT=https://your-backend.railway.app/graphql
VITE_RAZORPAY_KEY_ID=rzp_...
```

## Testing

### Backend Testing
```bash
cd backend
npm run dev
# Visit http://localhost:4000/graphql for GraphQL playground
```

### Frontend Testing
```bash
npm run dev
# Visit http://localhost:5173
```

## Security Considerations

1. **Payment Security**: Razorpay signature verification prevents tampering
2. **Database**: Use environment variables for credentials
3. **CORS**: Configured to allow only frontend domain
4. **Validation**: Input validation on both frontend and backend
5. **SQL Injection**: Protected by TypeORM parameterized queries

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

### Payment verification fails
- Verify Razorpay secret key
- Check signature calculation
- Review webhook logs

### Emails not sending
- Verify SendGrid API key
- Check sender email is verified
- Review SendGrid dashboard logs

### Frontend can't connect to backend
- Ensure backend is running
- Check VITE_GRAPHQL_ENDPOINT URL
- Verify CORS configuration

## Support

For issues and questions:
- Email: support@shaastra.org
- Create a support ticket in the portal

## License

MIT License - See LICENSE file for details

## Contributors

Built for Shaastra 2025
