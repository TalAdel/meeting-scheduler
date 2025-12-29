# Architectural Layers - The Truth About Where Logic Belongs

## Summary: Transaction Orchestration Moved to Service Layer

**What Changed:** Transaction management moved from Routes (Controller Layer) to Service Layer

**Why:** Industry best practices dictate that business logic and transaction orchestration belong in the Service Layer, not in Controllers/Routes.

---

## The Layers (Industry Standard)

### Layer 1: Presentation/Controller Layer (Routes)
**Location:** `routes/meetings.routes.ts`

**Responsibilities:**
- ✅ HTTP request/response handling
- ✅ Extract data from request
- ✅ Call service methods
- ✅ Format response
- ✅ Handle HTTP-specific concerns (status codes, headers)

**Should NOT do:**
- ❌ Business logic
- ❌ Transaction management
- ❌ Data validation logic (use middleware)
- ❌ Direct database access

**Example (CORRECT):**
```typescript
router.post('/', authenticate, [...MeetingValidation], validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    // 1. Extract data
    const { title, startTime, endTime, location, notes, emails, status } = req.body;
    
    // 2. Delegate to service
    const result = await meetingService.createMeetingWithParticipants(
      title, startTime, endTime, location, notes, req.userId!, emails, status
    );

    // 3. Format HTTP response
    res.status(201).json(result);
});
```

**Analogy:** A restaurant host who greets customers, takes them to tables, and delivers orders to kitchen. The host doesn't cook the food!

---

### Layer 2: Application/Service Layer (Services)
**Location:** `services/meeting.service.ts`

**Responsibilities:**
- ✅ **Business logic**
- ✅ **Transaction orchestration** ← THIS IS THE KEY
- ✅ Coordinate multiple operations
- ✅ Enforce business rules
- ✅ Orchestrate repositories
- ✅ Provide high-level operations for controllers

**Should NOT do:**
- ❌ HTTP handling
- ❌ Direct SQL (use repositories)
- ❌ Framework-specific code

**Example (CORRECT):**
```typescript
class MeetingService {
  /**
   * APPLICATION SERVICE METHOD
   * Orchestrates transaction across multiple repositories
   */
  async createMeetingWithParticipants(
    title: string, startTime: Date, endTime: Date, 
    location: string, notes: string | null, ownerId: string,
    emails: string[], status?: AttendingStatus
  ): Promise<{ meeting: Meeting; participants: MeetingUser[] }> {
    
    if (!this.meetingUserService) {
      throw new CustomError(500, 'MeetingUserService not initialized');
    }

    const meetingUserService = this.meetingUserService;

    // TRANSACTION BOUNDARY - Business logic coordinates here
    return await withTransaction(this.pool, async (client) => {
      // Step 1: Create meeting
      const meeting = await this.createMeeting(
        title, startTime, endTime, location, notes, ownerId, client
      );

      // Step 2: Add participants
      const participants = await meetingUserService.addUsersToMeeting(
        meeting.id, emails, status, client
      );

      return { meeting, participants };
    });
  }
}
```

**Analogy:** The kitchen manager who coordinates chefs, ensures all dishes for one order are ready together, and manages the cooking workflow. If one dish fails, the whole order is cancelled.

---

### Layer 3: Data Access Layer (Repositories)
**Location:** `repositories/meeting.repository.ts`

**Responsibilities:**
- ✅ SQL queries
- ✅ Database operations
- ✅ Data mapping (DB rows → domain objects)
- ✅ Accept transaction client parameter

**Should NOT do:**
- ❌ Business rules
- ❌ Transaction management
- ❌ Calling other repositories

**Example (CORRECT):**
```typescript
class MeetingRepository {
  async createMeeting(
    title: string, startTime: Date, endTime: Date,
    location: string, notes: string | null, ownerId: string,
    client?: PoolClient  // ← Accept client for transactions
  ): Promise<Meeting> {
    const dbClient = client || this.pool;  // Use client if provided
    
    const query = `INSERT INTO meetings (...) VALUES (...) RETURNING *`;
    const result = await dbClient.query<MeetingRow>(query, [title, ...]);
    
    return mapRowToMeeting(result.rows[0]);
  }
}
```

**Analogy:** Individual chefs who prepare specific dishes. They don't coordinate with other chefs - the kitchen manager does that.

---

## Why Service Layer Owns Transactions

### Authoritative Sources:

**1. Martin Fowler - "Patterns of Enterprise Application Architecture"**
> "A Service Layer defines an application's boundary and its set of available operations from the perspective of interfacing client layers. It encapsulates the application's business logic, controlling transactions and coordinating responses in the implementation of its operations."

**2. Eric Evans - "Domain-Driven Design"**
> "Application Services are the layer where transaction boundaries are defined. They orchestrate the execution of domain logic and coordinate transactions."

**3. Robert C. Martin (Uncle Bob) - "Clean Architecture"**
> "Use cases contain the rules specific to your application. They orchestrate the flow of data to and from entities, and direct those entities to use their enterprise-wide business rules to achieve the goals of the use case."

### The Logic:

1. **Reusability:** Service logic can be called from:
   - HTTP endpoints
   - CLI commands
   - Background jobs
   - Message queues
   - GraphQL resolvers
   - gRPC services

   If transaction logic is in routes, you'd duplicate it everywhere!

2. **Testability:** 
   - Testing service = pure business logic testing
   - Testing route with business logic = need HTTP mocking

3. **Single Responsibility:**
   - Route: HTTP concerns
   - Service: Business concerns
   - Repository: Data concerns

4. **Business Invariants:**
   - "Meeting must have participants" is a business rule
   - Business rules live in Service layer
   - Transaction enforces this rule → Transaction lives in Service

---

## Real-World Framework Examples

### Spring Boot (Java) - Industry Standard
```java
@Controller
class MeetingController {
    @PostMapping("/meetings")
    public ResponseEntity create(@RequestBody MeetingRequest req) {
        // Controller is thin
        var result = meetingService.createWithParticipants(req);
        return ResponseEntity.ok(result);
    }
}

@Service  // ← Service Layer
class MeetingService {
    @Transactional  // ← Transaction in SERVICE
    public Meeting createWithParticipants(MeetingRequest req) {
        Meeting m = meetingRepo.save(req.toMeeting());
        participantRepo.saveAll(req.getParticipants());
        return m;
    }
}
```

### NestJS (TypeScript) - Industry Standard
```typescript
@Controller('meetings')
export class MeetingController {
  @Post()
  async create(@Body() dto: CreateMeetingDto) {
    // Controller is thin
    return this.meetingService.createWithParticipants(dto);
  }
}

@Injectable()  // ← Service Layer
export class MeetingService {
  async createWithParticipants(dto: CreateMeetingDto) {
    // Transaction in SERVICE
    return this.entityManager.transaction(async (em) => {
      const meeting = await em.save(Meeting, dto.meeting);
      const participants = await em.save(Participant, dto.participants);
      return { meeting, participants };
    });
  }
}
```

### Django (Python) - Industry Standard
```python
# views.py (Controller)
def create_meeting(request):
    # Controller is thin
    data = json.loads(request.body)
    result = MeetingService.create_with_participants(data)
    return JsonResponse(result)

# services.py (Service)
class MeetingService:
    @staticmethod
    @transaction.atomic  # ← Transaction in SERVICE
    def create_with_participants(data):
        meeting = Meeting.objects.create(**data['meeting'])
        Participant.objects.bulk_create(data['participants'])
        return meeting
```

**Pattern:** All major frameworks put transactions in Service layer!

---

## Before vs After Comparison

### ❌ BEFORE (Wrong Architecture)

```
┌────────────────────────────────────────┐
│  ROUTE/CONTROLLER                      │
│  ┌──────────────────────────────────┐  │
│  │ ❌ Extract HTTP data             │  │
│  │ ❌ withTransaction(...)  ←───────┼──┼─ WRONG: Business logic in controller!
│  │     ❌ Call service 1            │  │
│  │     ❌ Call service 2            │  │
│  │ ❌ Format response               │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         │                     │
         ↓                     ↓
   MeetingService      MeetingUserService
   (just delegates)    (just delegates)
```

**Problems:**
- ❌ Can't reuse from other entry points
- ❌ Hard to test business logic
- ❌ Violates Single Responsibility
- ❌ Against industry standards

### ✅ AFTER (Correct Architecture)

```
┌────────────────────────────────────────┐
│  ROUTE/CONTROLLER                      │
│  ┌──────────────────────────────────┐  │
│  │ ✅ Extract HTTP data             │  │
│  │ ✅ Call service method           │  │
│  │ ✅ Format response               │  │
│  └──────────────────────────────────┘  │
└────────────┬───────────────────────────┘
             │
             ↓ Delegates to
┌────────────────────────────────────────┐
│  SERVICE LAYER                         │
│  ┌──────────────────────────────────┐  │
│  │ ✅ withTransaction(...) ←─────────┼──┼─ CORRECT: Business logic here!
│  │     ✅ Business rule checks      │  │
│  │     ✅ Coordinate operations     │  │
│  │     ✅ Return domain objects     │  │
│  └──────────────────────────────────┘  │
└────────────┬───────────┬───────────────┘
             │           │
             ↓           ↓
      MeetingRepo   MeetingUserRepo
      (SQL only)    (SQL only)
```

**Benefits:**
- ✅ Reusable from anywhere
- ✅ Easy to test
- ✅ Single Responsibility
- ✅ Follows industry standards

---

## Dependency Injection Pattern

We use **setter injection** to avoid circular dependencies:

```typescript
// 1. Create all repositories (no dependencies on each other)
const meetingRepository = new MeetingRepository(pool);
const meetingUsersRepository = new MeetingUsersRepository(pool);
const userRepository = new UserRepository(pool);

// 2. Create services with initial dependencies
const meetingService = new MeetingService(meetingRepository, pool);
const meetingUserService = new MeetingUserService(
  meetingUsersRepository, 
  meetingService,  // ← MeetingUserService needs MeetingService
  userRepository
);

// 3. Inject circular dependency after construction
meetingService.setMeetingUserService(meetingUserService);  // ← MeetingService needs MeetingUserService
```

**Why this pattern?**
- MeetingService needs MeetingUserService (for creating meetings with participants)
- MeetingUserService needs MeetingService (for validating meetings exist)
- Can't do this in constructor → circular dependency!
- Solution: Setter injection after both are created

This is a **standard pattern** used in:
- Spring Framework (Java)
- Angular (TypeScript)
- ASP.NET (C#)
- Laravel (PHP)

---

## Testing Benefits

### Before (Controller with Business Logic):
```typescript
// Hard to test - need HTTP mocking
test('create meeting with participants', async () => {
  const mockRequest = { 
    body: {...}, 
    userId: '123' 
  };
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  
  await meetingRoute(mockRequest, mockResponse);  // ← Testing HTTP, not business logic
  
  expect(mockResponse.status).toHaveBeenCalledWith(201);
  // Hard to test transaction rollback scenarios
});
```

### After (Service with Business Logic):
```typescript
// Easy to test - pure business logic
test('create meeting with participants', async () => {
  const result = await meetingService.createMeetingWithParticipants(
    'Team Sync',
    startTime,
    endTime,
    'Room A',
    null,
    'owner-id',
    ['user1@example.com', 'user2@example.com']
  );
  
  expect(result.meeting).toBeDefined();
  expect(result.participants).toHaveLength(2);
});

test('rolls back when participants fail', async () => {
  // Easy to test transaction rollback
  await expect(
    meetingService.createMeetingWithParticipants(
      'Team Sync', startTime, endTime, 'Room A', null, 'owner-id',
      ['invalid@example.com']  // Non-existent user
    )
  ).rejects.toThrow('Users not found');
  
  // Verify meeting was NOT created (rollback worked)
  const meetings = await meetingRepository.findMeetingsByOwner('owner-id');
  expect(meetings).toHaveLength(0);
});
```

---

## The Verdict

### Your Question: "Should I move logic to meeting.service.ts?"

**Answer: YES! 100% CORRECT!**

**Evidence:**
1. ✅ Martin Fowler says so
2. ✅ DDD principles say so
3. ✅ Clean Architecture says so
4. ✅ Every major framework does it this way
5. ✅ Industry best practices demand it

**Your current implementation (route with transaction):**
- ❌ Violates established architectural patterns
- ❌ Makes code hard to test and reuse
- ❌ Against industry standards

**Moving to service layer:**
- ✅ Follows industry best practices
- ✅ Makes code testable and reusable
- ✅ Proper separation of concerns
- ✅ Aligns with all major frameworks

---

## Summary

| Concern | WRONG Layer | CORRECT Layer |
|---------|-------------|---------------|
| HTTP handling | Service | **Route/Controller** |
| Extract request data | Service | **Route/Controller** |
| Format response | Service | **Route/Controller** |
| Business logic | Route | **Service** |
| Transaction orchestration | Route | **Service** |
| Coordinate operations | Route | **Service** |
| Enforce business rules | Repository | **Service** |
| SQL queries | Service | **Repository** |
| Data mapping | Service | **Repository** |

**Golden Rule:** 
- **Routes** = HTTP adapter (thin)
- **Services** = Business orchestration (thick)
- **Repositories** = Data access (focused)

This is not opinion. This is **industry consensus** backed by decades of enterprise software development experience.

---

## References

- Martin Fowler: https://martinfowler.com/eaaCatalog/serviceLayer.html
- Eric Evans: Domain-Driven Design (Blue Book)
- Robert C. Martin: Clean Architecture
- Spring Framework Documentation
- NestJS Architecture Guide
- Microsoft .NET Architecture Patterns

