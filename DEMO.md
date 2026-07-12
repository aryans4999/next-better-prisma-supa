# TransitOps - Smart Transport Operations Platform

## Getting Started

### Authentication
This platform uses **email and password authentication only** (Google login has been removed).

### Demo Account Setup

#### Option 1: Create a New Account
1. Go to `http://localhost:3000/signup`
2. Enter a test email (e.g., `demo@test.com`)
3. Create a password (minimum 8 characters)
4. Click "Sign Up"
5. You'll be redirected to the dashboard

#### Option 2: Use Seed Data
To populate the database with dummy fleet data:

```bash
# Run the seed script
npm run seed
```

This will create:
- **5 Vehicles**: Various trucks and vans with different statuses (AVAILABLE, ON_TRIP, IN_SHOP)
- **5 Drivers**: With license information and safety scores
- **3 Trips**: Both completed and active trips
- **3 Maintenance Logs**: Vehicle maintenance records
- **4 Fuel Logs**: Fuel consumption tracking
- **5 Expenses**: Various operational expenses

### Test Credentials (After Signup)
- Email: Any email you used during signup
- Password: The password you created

## Features Implemented

### Dashboard Features
- **Real-time KPIs**: Vehicle fleet status overview
- **Vehicle Registry**: Add, update, and manage fleet vehicles
- **Driver Management**: Track drivers with license expiry alerts
- **Trip Management**: Create and dispatch trips, track completion
- **Maintenance Tracking**: Log vehicle maintenance and repairs
- **Fuel & Expenses**: Track fuel consumption and operational costs
- **Reports & Analytics**: Visual insights with charts and metrics
- **Settings**: Account management

### Key Features
- ✅ Email/Password authentication (credential-based login)
- ✅ Dark theme with orange and teal accents
- ✅ Responsive design
- ✅ Real-time data validation
- ✅ Business rule enforcement (license expiry, vehicle capacity, etc.)
- ✅ Charts and visualizations with Recharts
- ✅ Server-side data persistence with PostgreSQL

## Platform Structure

### Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js Server Actions, API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Better Auth (email/password only)
- **Charts**: Recharts
- **UI**: shadcn/ui components

### Navigation
- **Dashboard**: Overview of fleet metrics
- **Vehicles**: Manage fleet vehicles
- **Drivers**: Manage drivers and licenses
- **Trips**: Create and manage trips
- **Maintenance**: Log maintenance activities
- **Fuel & Expenses**: Track costs
- **Reports**: View analytics
- **Settings**: Account settings

## Important Notes

### Authentication Changes
- Google OAuth has been **completely removed**
- Only **email and password** authentication is available
- Better Auth is configured for credential-based authentication only

### Data Persistence
All data is stored in PostgreSQL and persists across sessions. The seed script is optional and provides sample data for demonstration purposes.

### Demo Vehicles
The seed data includes 5 vehicles with realistic statuses:
- TRN-001: Cargo Truck (AVAILABLE)
- TRN-002: Delivery Van (ON_TRIP)
- TRN-003: Cargo Truck (IN_SHOP)
- TRN-004: Pickup Truck (AVAILABLE)
- TRN-005: Flatbed Truck (AVAILABLE)

### Demo Drivers
5 drivers with various license categories and safety scores are included in the seed data.

## Troubleshooting

### Seed Script Issues
If the seed script fails:
1. Ensure DATABASE_URL is set in `.env.development.local`
2. Make sure the database is running and accessible
3. Run `npm run seed` again

### Login Issues
- Ensure you've created an account via the signup page
- Check that your email and password are correct
- Clear browser cache if experiencing persistent issues

## Development

### Running the Project
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Seed database with demo data
npm run seed
```

## Future Enhancements
- Multi-factor authentication (MFA)
- Social login options (if needed)
- Advanced reporting and exports
- Mobile app
- Real-time GPS tracking
- Automated alerts and notifications
