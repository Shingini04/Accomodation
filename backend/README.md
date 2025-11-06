# Backend - Accommodation Portal API

Express + TypeORM + TypeGraphQL + Apollo Server backend for the Shaastra Accommodation Portal.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (copy .env.example to .env):
```bash
cp .env.example .env
```

3. Configure your .env file with database and API credentials

4. Start development server:
```bash
npm run dev
```

Server will start on http://localhost:4000
GraphQL Playground: http://localhost:4000/graphql

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## Database Schema

### User
- id (uuid, primary key)
- shaastraId (string, unique)
- name (string)
- email (string)
- mobile (string)
- role (string) - 'participant' | 'admin'
- verified (boolean)
- createdAt (timestamp)

### Accommodation
- accoId (uuid, primary key)
- user (relation to User)
- name, email, mobile, dob, gender
- idType, idNumber, address
- organization
- arrivalDate, departureDate
- numberOfPeople (integer)
- accommodationType (string)
- accommodationDates (string)
- amount (float)
- paid (boolean)
- orderId, paymentId, paymentSignature
- termsAndConditions (boolean)
- checkInAt, checkOutAt (timestamp)
- createdAt, updatedAt (timestamp)

### Room
- id (uuid, primary key)
- roomNumber (string)
- hostelName (string)
- roomType (string)
- capacity (integer)
- occupied (integer)
- available (boolean)

### Allotment
- id (uuid, primary key)
- accommodation (relation)
- room (relation)
- allottedBy (string)
- notes (string, optional)
- createdAt (timestamp)

### PaymentTransaction
- id (uuid, primary key)
- accommodationId (string)
- orderId, paymentId, signature
- amount (float)
- currency (string)
- status (string)
- method (string)
- errorCode, errorDescription
- createdAt (timestamp)

### SupportTicket
- id (uuid, primary key)
- userId, name, email
- category, message
- status (string) - 'open' | 'resolved'
- response, respondedBy
- respondedAt (timestamp)
- createdAt, updatedAt (timestamp)

## GraphQL API

### Mutations

**createAccommodation**
```graphql
mutation CreateAccommodation($data: CreateAccommodationInput!) {
  createAccommodation(data: $data) {
    accoId
    orderId
    amount
    paid
  }
}
```

**verifyRazorpayPayment**
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
    paymentId
  }
}
```

**createRoom**
```graphql
mutation CreateRoom($data: CreateRoomInput!) {
  createRoom(data: $data) {
    id
    roomNumber
    hostelName
  }
}
```

**createAllotment**
```graphql
mutation CreateAllotment($data: CreateAllotmentInput!) {
  createAllotment(data: $data) {
    id
    accommodation { accoId }
    room { roomNumber }
  }
}
```

**createSupportTicket**
```graphql
mutation CreateSupportTicket($data: CreateSupportTicketInput!) {
  createSupportTicket(data: $data) {
    id
    status
  }
}
```

### Queries

**getDashboardStats**
```graphql
query GetDashboardStats {
  getDashboardStats {
    totalAccommodations
    paidAccommodations
    pendingAccommodations
    totalRevenue
    occupancyRate
    checkedIn
    checkedOut
  }
}
```

**getAccommodations**
```graphql
query GetAccommodations {
  getAccommodations {
    accoId
    name
    email
    amount
    paid
    user { name }
  }
}
```

**getRooms**
```graphql
query GetRooms {
  getRooms {
    id
    roomNumber
    hostelName
    capacity
    occupied
    available
  }
}
```

**exportAccommodationsCSV**
```graphql
query ExportAccommodationsCSV {
  exportAccommodationsCSV
}
```

## Razorpay Integration

### Order Creation
```typescript
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const order = await razorpay.orders.create({
  amount: amount * 100, // Amount in paise
  currency: "INR",
  receipt: `receipt_${Date.now()}`,
});
```

### Payment Verification
```typescript
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest("hex");

if (expectedSignature === signature) {
  // Payment verified
}
```

## SendGrid Email Service

### Email Templates
- Payment confirmation
- Room allotment
- Support ticket creation
- Support ticket response

### Usage
```typescript
await sendEmail({
  to: "user@example.com",
  subject: "Payment Confirmed",
  html: "<p>Your payment was successful</p>",
});
```

## Deployment

### Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add PostgreSQL:
```bash
railway add postgresql
```

4. Set environment variables:
```bash
railway variables set RAZORPAY_KEY_ID=rzp_...
railway variables set RAZORPAY_SECRET=...
railway variables set SENDGRID_API_KEY=SG...
railway variables set FRONTEND_URL=https://...
```

5. Deploy:
```bash
railway up
```

### Render

1. Connect GitHub repository
2. Select "Web Service"
3. Build Command: `cd backend && npm install && npm run build`
4. Start Command: `cd backend && npm start`
5. Add environment variables in dashboard
6. Deploy

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Server
PORT=4000

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_SECRET=your_secret_key

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@shaastra.org

# Frontend (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Development Tips

### Testing GraphQL Queries
Use the GraphQL Playground at http://localhost:4000/graphql

### Database Migrations
Generate migration after schema changes:
```bash
npm run migration:generate -- src/migrations/YourMigrationName
```

Run migrations:
```bash
npm run migration:run
```

### Debugging
Enable TypeORM logging in data-source.ts:
```typescript
logging: true,
```

## Production Considerations

1. **Disable synchronize**: Set `synchronize: false` in data-source.ts
2. **Use migrations**: Generate and run migrations for schema changes
3. **Environment variables**: Never commit .env file
4. **HTTPS**: Use SSL for database connections
5. **Rate limiting**: Add rate limiting middleware
6. **Monitoring**: Set up error tracking (Sentry, etc.)

## Common Issues

### TypeORM connection fails
- Verify DATABASE_URL format
- Check database credentials
- Ensure PostgreSQL is running

### GraphQL schema errors
- Run `npm run build` to check TypeScript errors
- Verify all decorators are correct
- Check imports and entity relationships

### Payment verification fails
- Verify Razorpay secret key
- Check signature calculation
- Log the expected vs received signature

## Support

For backend issues, check:
1. Server logs
2. Database logs
3. GraphQL errors in playground
4. Environment variable configuration
