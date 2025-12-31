# 📅 Meeting Scheduler

A full-stack meeting management application with JWT authentication, RSVP system, and real-time participant tracking.

**Live Demo**: [Deployed on DigitalOcean](http://167.99.250.33:5173)

---

## Features

- 🔐 JWT Authentication & Authorization
- 🔑 Change Password Functionality
- 👤 User Profile Management (View, Edit, Delete Account)
- 📆 Create, Edit, Delete Meetings
- 🗺️ **Google Maps Integration** - Worldwide location support with geocoding
- 🌍 Multi-Language Address Support (50+ languages including Hebrew, Arabic, Chinese, etc.)
- 📍 Smart Region Biasing - Auto-detects user's country for better search results
- 👥 Invite Multiple Participants via Email
- ✅ RSVP System (Pending, Confirmed, Declined, Attended)
- 🔍 Advanced Filtering (Status, Date Range, Ownership)
- 📊 Meeting History & Analytics
- 📱 Fully Responsive UI

---

## Tech Stack

**Backend**: Node.js, TypeScript, Express.js, PostgreSQL, JWT  
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router, Google Maps API  
**DevOps**: Docker, Docker Compose  
**APIs**: Google Maps Geocoding API, IP Geolocation API

---

## Architecture

Three-tier layered architecture following SOLID principles:

- **Routes Layer**: HTTP request/response handling
- **Service Layer**: Business logic and transaction orchestration
- **Repository Layer**: Data access and SQL queries

See `ARCHITECTURAL_LAYERS.md` for detailed documentation.

---

## Quick Start

### Prerequisites

- Node.js v18+
- Docker & Docker Compose

### Environment Setup

Create `.env` file in the root directory:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=meeting_scheduler
DB_PORT=5432

# Backend
BACKEND_PORT=3000
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

# Frontend
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

> **Note**: Get your Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/). Enable the **Maps JavaScript API** and **Geocoding API**.

### Run with Docker

```bash
docker-compose up --build
```

**Services**:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api/v1`
- Database: PostgreSQL on port `5432`

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/signup              # Register new user
POST   /api/v1/auth/login               # Login user
POST   /api/v1/auth/change-password     # Change password (authenticated)
```

### User Management
```
GET    /api/v1/users/profile            # Get current user profile
PUT    /api/v1/users/profile            # Update profile (fullName, email)
GET    /api/v1/users/:id                # Get user by ID
DELETE /api/v1/users/account            # Delete account
```

### Meetings
```
POST   /api/v1/meetings                 # Create meeting with participants & location
GET    /api/v1/meetings                 # Get all user meetings (owned + invited)
GET    /api/v1/meetings/owner/meetings  # Get meetings where user is owner
GET    /api/v1/meetings/:id             # Get meeting details
GET    /api/v1/meetings/:id/participants # Get meeting participants
PUT    /api/v1/meetings/:id             # Update meeting (owner only)
DELETE /api/v1/meetings/:id             # Delete meeting (owner only)
```

### Participants & RSVP
```
PATCH  /api/v1/meetings/:meetingId/attend-status            # Update own RSVP status
PATCH  /api/v1/meetings/:meetingId/participants/:userId     # Update participant status (owner only)
```

### Meeting Creation Body (with Google Maps)
```json
{
  "title": "Team Meeting",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "location": "Times Square, New York",
  "locationCountry": "US",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "notes": "Optional notes",
  "emails": ["user1@example.com", "user2@example.com"],
  "status": "pending"
}
```

---

## Database Schema

**Users** → **Meetings** ← **Meeting_Users** (join table with RSVP status)

### Tables

**Users**
- id, email, full_name, password
- Authentication and profile data

**Meetings**
- id, title, start_time, end_time, owner_id
- location (VARCHAR 500) - Address in any language
- location_country (VARCHAR 2) - ISO country code (US, IL, FR, etc.)
- latitude, longitude (NUMERIC) - Cached coordinates for map display
- notes (TEXT)

**Meeting_Users** (Join Table)
- meeting_id, user_id, status
- RSVP status: pending, confirmed, declined, attended
- responded_at timestamp

### Key Constraints
- `valid_meeting_time`: end_time > start_time
- `valid_latitude`: -90 to 90
- `valid_longitude`: -180 to 180
- `unique_meeting_user`: One record per user per meeting

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/         # API endpoints (auth, users, meetings)
│   │   ├── services/       # Business logic & transactions
│   │   ├── repositories/   # Data access layer
│   │   ├── middlewares/    # Auth, validation, error handling
│   │   └── database/       # Migrations (including location fields)
├── frontend/
│   ├── src/
│   │   ├── pages/          # Route components (Home, NewMeeting, etc.)
│   │   ├── components/     # UI components (MeetingMap, StatusBadge, etc.)
│   │   ├── services/       # API calls (auth, meetings, users)
│   │   ├── context/        # Auth context
│   │   ├── hooks/          # Custom hooks (useUserCountry, etc.)
│   │   └── lib/            # Utilities
└── docker-compose.yml
```

---

## Google Maps Integration

### Features
- 🌍 **Worldwide Support**: Works with addresses from any country
- 🗣️ **Multi-Language**: Supports 50+ languages (Hebrew, Arabic, Chinese, Japanese, etc.)
- 📍 **Smart Geocoding**: Auto-converts addresses to coordinates
- 🎯 **Region Biasing**: Detects user's country for better search results
- 🗺️ **Interactive Maps**: Visual map display on meeting details page
- 💾 **Coordinate Caching**: Stores lat/lng for performance

### How It Works
1. User enters address in any language (e.g., "דיזנגוף 50, תל אביב")
2. Frontend detects user's country via IP geolocation
3. Google Geocoding API converts address to coordinates
4. Coordinates are cached in database
5. Map displays location on meeting details page

### Example Addresses
```
English:  "Times Square, New York, USA"
Hebrew:   "דיזנגוף 50, תל אביב"
French:   "Tour Eiffel, Paris"
Japanese: "東京タワー"
Arabic:   "برج خليفة، دبي"
```

---

## Development

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Database migrations
npm run migrate
```

---

## Key Design Decisions

- **Transaction Management**: Handled at service layer for business logic reusability
- **Circular Dependencies**: Resolved via setter injection pattern (MeetingService ↔ MeetingUserService)
- **Type Safety**: Full TypeScript across frontend and backend
- **Database Constraints**: Time validation, lat/lng ranges, unique constraints enforced at DB level
- **Location Caching**: Store coordinates in DB to minimize API calls and improve performance
- **Optional Location Fields**: All location fields are optional - supports both online and in-person meetings
- **Region Biasing**: Auto-detect user's country for intelligent geocoding defaults

---

## License

Educational project for assignment purposes.
