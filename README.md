# 📅 Meeting Scheduler

> A full-stack meeting management application built with modern technologies and clean architecture principles.

## 🎯 Overview

Meeting Scheduler is a comprehensive web application that enables users to create, manage, and track meetings with participants. Built as an educational assignment to demonstrate professional software architecture, SOLID principles, and modern full-stack development practices.

The application showcases a **layered architecture** with clear separation of concerns, transaction management at the service layer, and a responsive React frontend powered by TypeScript and Tailwind CSS.

---

## ✨ Features

### 🔐 User Management
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **User Registration & Login**: Full account management with validation
- **Protected Routes**: Secure endpoints with middleware-based authorization

### 📆 Meeting Management
- **Create Meetings**: Schedule meetings with title, time, location, and notes
- **Invite Participants**: Add multiple users via email to meetings
- **RSVP System**: Participants can confirm, decline, or remain pending
- **Meeting Status Tracking**: View attendance status for all participants
- **Edit & Delete**: Full CRUD operations for meeting owners
- **Time Validation**: Ensures end time is after start time with database constraints

### 🎨 User Interface
- **Modern Dashboard**: Clean, responsive design with Tailwind CSS
- **Advanced Filtering**: Filter meetings by status, date range, and ownership
- **Meeting Details View**: Comprehensive view with participant information
- **History Tracking**: Review past meetings and attendance
- **Status Badges**: Visual indicators for meeting and RSVP statuses
- **Mobile Responsive**: Optimized for all screen sizes

### 🏗️ Architecture Highlights
- **Service Layer Pattern**: Business logic and transaction orchestration
- **Repository Pattern**: Clean data access abstraction
- **Dependency Injection**: Managed circular dependencies with setter injection
- **Transaction Management**: ACID compliance with PostgreSQL transactions
- **Type Safety**: Full TypeScript implementation across the stack
- **Error Handling**: Centralized error middleware with custom error classes

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (v5)
- **Database**: PostgreSQL 15 with `pg` driver
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Development**: ts-node, nodemon

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Custom TypeScript migration runner
- **Environment Management**: dotenv
- **Hot Reload**: Enabled for both frontend and backend

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **PostgreSQL** (if running locally without Docker)
- **npm** or **yarn**

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd meeting-scheduler
```

### 2️⃣ Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=meeting_scheduler
DB_PORT=5432

# Backend Configuration
BACKEND_PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Frontend Configuration
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3000/api/v1
```

> **Note**: Change the `JWT_SECRET` and `DB_PASSWORD` to secure values. Never commit real secrets to version control.

### 3️⃣ Run with Docker Compose (Recommended)

This will start the PostgreSQL database, backend server, and frontend development server:

```bash
docker-compose up --build
```

**Services will be available at:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/v1`
- PostgreSQL: `localhost:5432`

### 4️⃣ Database Migrations

Migrations run automatically when the backend container starts. To run manually:

```bash
docker-compose exec backend npm run migrate
```

### 5️⃣ Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

Create an account and start scheduling meetings!

---

## 📁 Project Structure

```
meeting-scheduler/
├── backend/
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── database/         # Migrations and schema
│   │   ├── lib/              # Custom utilities (errors, etc.)
│   │   ├── middlewares/      # Auth, validation, error handling
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # API endpoints (controllers)
│   │   ├── services/         # Business logic layer
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Helper functions
│   │   ├── app.ts            # Express app configuration
│   │   └── index.ts          # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # Base UI elements
│   │   │   └── layouts/      # Layout components
│   │   ├── config/           # API configuration & interceptors
│   │   ├── context/          # React Context (Auth)
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript types
│   │   └── lib/              # Utility functions
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/signup          # Register new user
POST   /api/v1/auth/login           # Login user
GET    /api/v1/auth/me              # Get current user (authenticated)
```

### User Management
```
GET    /api/v1/users/profile        # Get user profile
PUT    /api/v1/users/profile        # Update user profile
```

### Meetings
```
POST   /api/v1/meetings             # Create meeting with participants
GET    /api/v1/meetings             # Get all user meetings (owned + invited)
GET    /api/v1/meetings/:id         # Get meeting by ID
GET    /api/v1/meetings/:id/participants  # Get meeting participants
PUT    /api/v1/meetings/:id         # Update meeting (owner only)
DELETE /api/v1/meetings/:id         # Delete meeting (owner only)
GET    /api/v1/meetings/owner/meetings    # Get meetings where user is owner
```

### RSVP / Status Management
```
PATCH  /api/v1/meetings/:meetingId/attend-status         # Update own RSVP status
PATCH  /api/v1/meetings/:meetingId/participants/:userId  # Update participant status (owner only)
```

---

## 🏛️ Architecture & Design Principles

### Layered Architecture

This project follows industry-standard **3-tier architecture**:

```
┌─────────────────────────────────────┐
│  Presentation Layer (Routes)        │  ← HTTP handling only
│  - Request/Response                 │
│  - Status codes                     │
│  - Call services                    │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Application Layer (Services)       │  ← Business logic & transactions
│  - Business rules                   │
│  - Transaction orchestration        │
│  - Coordinate repositories          │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Data Access Layer (Repositories)   │  ← SQL queries only
│  - Database operations              │
│  - Data mapping                     │
│  - Accept transaction clients       │
└─────────────────────────────────────┘
```

### Key Principles Demonstrated

**1. Single Responsibility Principle (SRP)**
- Each layer has one clear purpose
- Routes handle HTTP, services handle business logic, repositories handle data

**2. Open/Closed Principle (OCP)**
- New features can be added without modifying existing code
- Repository pattern allows switching databases

**3. Dependency Inversion Principle (DIP)**
- High-level modules depend on abstractions (interfaces)
- Services depend on repository interfaces, not concrete implementations

**4. Transaction Management**
```typescript
// Service layer orchestrates transactions
async createMeetingWithParticipants(...) {
  return await withTransaction(this.pool, async (client) => {
    // Step 1: Create meeting
    const meeting = await this.createMeeting(..., client);
    
    // Step 2: Add participants
    const participants = await this.addParticipants(..., client);
    
    // If any step fails, entire transaction rolls back
    return { meeting, participants };
  });
}
```

**5. Dependency Injection**
- Constructor injection for most dependencies
- Setter injection for circular dependencies (MeetingService ↔ MeetingUserService)

---

## 🧪 Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Meetings Table
```sql
meetings (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(255) NOT NULL,
  notes TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  CONSTRAINT valid_meeting_time CHECK (end_time > start_time)
)
```

### Meeting Users Table (Join Table)
```sql
meeting_users (
  id UUID PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id),
  user_id UUID REFERENCES users(id),
  status attending_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  CONSTRAINT unique_meeting_user UNIQUE (meeting_id, user_id)
)

-- Enum: attending_status = 'pending' | 'confirmed' | 'declined' | 'attended'
```

### Indexes
- Email lookup optimization
- Meeting owner queries
- Time range queries (GIST index)
- Participant status filtering

---

## 🔧 Development

### Running Backend Only

```bash
cd backend
npm install
npm run dev
```

### Running Frontend Only

```bash
cd frontend
npm install
npm run dev
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Database Migrations

```bash
# Run migrations
npm run migrate

# Add new migration
# Create a new .sql file in backend/src/database/migrations/
# Format: 00X_description.sql
```

---

## 🎓 Learning Objectives

This project was built as an assignment to demonstrate:

✅ **Clean Architecture**: Proper separation of concerns across layers  
✅ **SOLID Principles**: Applied throughout the codebase  
✅ **TypeScript**: Full type safety on frontend and backend  
✅ **Database Design**: Normalized schema with proper constraints  
✅ **Transaction Management**: ACID compliance for complex operations  
✅ **Authentication & Security**: JWT tokens, password hashing, protected routes  
✅ **Modern React**: Hooks, Context API, TypeScript, Tailwind CSS  
✅ **API Design**: RESTful endpoints with proper HTTP semantics  
✅ **Docker**: Containerization for consistent development environments  
✅ **Error Handling**: Centralized error management with custom classes  

---

## 📝 Development Notes

### Why Service Layer Owns Transactions?

The project follows **industry best practices** from:
- Martin Fowler's "Patterns of Enterprise Application Architecture"
- Eric Evans' "Domain-Driven Design"
- Robert C. Martin's "Clean Architecture"

**The Logic**: Business operations (like "create meeting with participants") are **business rules**, not HTTP concerns. They should live in the Service layer, not in Routes/Controllers. This makes the code:
- ✅ Reusable across different interfaces (HTTP, CLI, GraphQL, etc.)
- ✅ Testable without HTTP mocking
- ✅ Maintainable with clear responsibilities

See `ARCHITECTURAL_LAYERS.md` for detailed explanation.

### Circular Dependency Resolution

MeetingService and MeetingUserService have a circular dependency:
- MeetingService needs MeetingUserService (to add participants)
- MeetingUserService needs MeetingService (to validate meetings)

**Solution**: Setter injection pattern (also used in Spring, Angular, and NestJS)

```typescript
const meetingService = new MeetingService(meetingRepository, pool);
const meetingUserService = new MeetingUserService(meetingUsersRepository, meetingService, userRepository);

// Inject circular dependency after construction
meetingService.setMeetingUserService(meetingUserService);
```

---

## 🐛 Known Limitations

This is an educational project, not production-ready software. Known limitations:

- No email notifications for meeting invitations
- No calendar integration (Google Calendar, Outlook, etc.)
- No real-time updates (WebSocket/SSE)
- Limited test coverage (focus was on architecture)
- Basic error messages (could be more user-friendly)
- No file attachments for meetings
- No recurring meeting support

---

## 🤝 Contributing

This is an assignment project and not open for contributions. However, feel free to fork and experiment!

---

## 📄 License

This project is for educational purposes. See `LICENSE` file for details (if applicable).

---

## 🙏 Acknowledgments

Built with love and attention to software craftsmanship principles. Special thanks to the open-source community for the amazing tools and frameworks that made this possible.

---

## 📧 Contact

For questions about this assignment project, please contact the repository owner.

---

**Happy Coding!** 🚀

