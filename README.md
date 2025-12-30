# 📅 Meeting Scheduler

A full-stack meeting management application with JWT authentication, RSVP system, and real-time participant tracking.

**Live Demo**: [Deployed on DigitalOcean](http://167.99.250.33:5173)

---

## Features

- 🔐 JWT Authentication & Authorization
- 📆 Create, Edit, Delete Meetings
- 👥 Invite Multiple Participants via Email
- ✅ RSVP System (Pending, Confirmed, Declined, Attended)
- 🔍 Advanced Filtering (Status, Date Range, Ownership)
- 📊 Meeting History & Analytics
- 📱 Fully Responsive UI

---

## Tech Stack

**Backend**: Node.js, TypeScript, Express.js, PostgreSQL, JWT  
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router  
**DevOps**: Docker, Docker Compose

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

Create `.env` file:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=meeting_scheduler
DB_PORT=5432
BACKEND_PORT=3000
FRONTEND_PORT=5173
JWT_SECRET=your_jwt_secret
VITE_API_URL=http://localhost:3000/api/v1
```

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
POST   /api/v1/auth/signup          # Register
POST   /api/v1/auth/login           # Login
GET    /api/v1/auth/me              # Get current user
```

### Meetings
```
POST   /api/v1/meetings             # Create meeting with participants
GET    /api/v1/meetings             # Get all user meetings
GET    /api/v1/meetings/:id         # Get meeting details
PUT    /api/v1/meetings/:id         # Update meeting
DELETE /api/v1/meetings/:id         # Delete meeting
```

### Participants & RSVP
```
GET    /api/v1/meetings/:id/participants                    # Get participants
PATCH  /api/v1/meetings/:meetingId/attend-status            # Update own status
PATCH  /api/v1/meetings/:meetingId/participants/:userId     # Update participant (owner only)
```

---

## Database Schema

**Users** → **Meetings** ← **Meeting_Users** (join table with RSVP status)

- Users: Authentication and profile data
- Meetings: Title, time, location, notes, owner
- Meeting_Users: Participant status (pending, confirmed, declined, attended)

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access
│   │   ├── middlewares/    # Auth, validation, errors
│   │   └── database/       # Migrations
├── frontend/
│   ├── src/
│   │   ├── pages/          # Route components
│   │   ├── components/     # UI components
│   │   ├── services/       # API calls
│   │   └── context/        # Auth context
└── docker-compose.yml
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
- **Circular Dependencies**: Resolved via setter injection pattern
- **Type Safety**: Full TypeScript across frontend and backend
- **Database Constraints**: Time validation, unique constraints enforced at DB level

---

## License

Educational project for assignment purposes.
