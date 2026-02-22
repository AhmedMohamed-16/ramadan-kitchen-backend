# Architecture Rules - Ramadan Kitchen Management System

**VERSION:** 1.0  
**STATUS:** LOCKED  
**DATE:** 2025-02-15

---

## 🔒 CRITICAL RULES - NEVER VIOLATE

These rules are **NON-NEGOTIABLE** for all future development phases.

---

## 1. Architecture Rules

### Folder Structure (LOCKED)
```
src/
  modules/
    [module-name]/
      controller.ts
      service.ts
      routes.ts
      validation.ts
  shared/
    database/
    middleware/
    utils/
  config/
```

**Rules:**
- ✅ Each module has: controller, service, routes, validation
- ✅ Controllers stay THIN (just request/response handling)
- ✅ Business logic ONLY in services
- ✅ NO generic base classes
- ✅ NO abstract repositories unless absolutely necessary
- ❌ NEVER mix business logic in controllers
- ❌ NEVER create "manager" or "handler" layers
- ❌ NO microservices
- ❌ NO CQRS
- ❌ NO event sourcing
- ❌ NO message queues (unless explicit requirement)

### Keep Simple Express
- ✅ Standard Express REST API
- ✅ Middleware for cross-cutting concerns
- ✅ Direct service calls from controllers
- ❌ NO over-engineered patterns
- ❌ NO framework within framework

---

## 2. Database Rules

### Prisma Schema (SOURCE OF TRUTH)
- ✅ Prisma schema from Phase 1 is final
- ✅ Use Prisma Client directly in services
- ✅ Create simple repository methods ONLY if logic is repeated 3+ times
- ❌ NEVER redesign schema without explicit approval
- ❌ NO generic base repositories by default
- ❌ NO query builders on top of Prisma

### Data Rules
- ✅ UUID primary keys ONLY
- ✅ `createdAt` / `updatedAt` on all tables
- ✅ Soft deletes via `isActive` flag where needed
- ✅ Totals ALWAYS calculated via SUM queries
- ❌ NEVER store computed totals in database
- ❌ NO manual ID generation

### Indexes (LOCKED)
- ✅ Search fields: `phone`, `fullName`, `locationId`
- ✅ Filter fields: `date`, `isActive`, `needLevel`
- ✅ Foreign keys already indexed by Prisma
- ❌ NEVER remove existing indexes

---

## 3. API Rules

### REST Style (LOCKED)
```
GET    /api/[resource]           - List
GET    /api/[resource]/:id       - Get one
POST   /api/[resource]           - Create
PUT    /api/[resource]/:id       - Update
DELETE /api/[resource]/:id       - Delete
```

### Response Format (LOCKED)
**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### API Rules
- ✅ Use HTTP status codes correctly (200, 201, 400, 401, 404, 500)
- ✅ Pagination on ALL list endpoints (default: 10 per page)
- ✅ Search endpoints for beneficiaries (phone, name)
- ✅ Filter by location, date, status where applicable
- ❌ NO GraphQL
- ❌ NO custom response wrappers beyond standard format

---

## 4. Coding Rules

### TypeScript Style
- ✅ Use TypeScript for type safety
- ✅ Define interfaces for DTOs
- ✅ Use Prisma generated types where possible
- ✅ Explicit types on function parameters and returns
- ❌ NO `any` type (use `unknown` if needed)
- ❌ NO overly complex generics

### Code Quality
- ✅ Prefer explicit over clever code
- ✅ Junior-friendly naming (`createDonation` not `persist`)
- ✅ Small functions (under 50 lines)
- ✅ Single responsibility
- ❌ NO magic numbers (use constants)
- ❌ NO deep nesting (max 3 levels)
- ❌ NO premature optimization

### Comments
- ✅ Comment WHY, not WHAT
- ✅ Explain business rules
- ✅ Document complex queries
- ❌ NO commented-out code in production

---

## 5. Module Patterns (LOCKED)

### Controller Pattern
```typescript
// ALWAYS thin - just request/response handling
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await service.create(data);
    return successResponse(res, result, 201);
  } catch (error) {
    next(error);
  }
};
```

### Service Pattern
```typescript
// ALL business logic here
export const create = async (data: CreateDTO) => {
  // 1. Validation (if not done by middleware)
  // 2. Business logic
  // 3. Database operations via Prisma
  // 4. Return result
  return await prisma.entity.create({ data });
};
```

### Validation Pattern
```typescript
// Use Zod schemas
export const createSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
});

// Apply in routes
router.post('/', validate(createSchema), controller.create);
```

### Error Handling Pattern
```typescript
// Use AppError class
throw new AppError('Resource not found', 404);

// Caught by global error middleware
```

---

## 6. Authentication & Authorization (When Implemented)

### Auth Rules
- ✅ JWT tokens ONLY
- ✅ Role-based access control (RBAC)
- ✅ Roles: ADMIN, DISTRIBUTOR, ACCOUNTANT
- ✅ Middleware: `authenticate`, `authorize([roles])`
- ❌ NO OAuth (unless explicit requirement)
- ❌ NO session-based auth

### Security Rules
- ✅ Hash passwords with bcrypt
- ✅ Validate JWT on protected routes
- ✅ Check user role for authorization
- ❌ NO password in responses
- ❌ NO tokens in logs

---

## 7. Testing Rules (Future)

When tests are added:
- ✅ Unit tests for services
- ✅ Integration tests for APIs
- ✅ Use test database
- ❌ NO tests in controllers (too thin)
- ❌ NO snapshot tests

---

## 8. Performance Rules

### Query Optimization
- ✅ Use `select` to limit fields
- ✅ Use `include` for relations carefully
- ✅ Pagination on large datasets
- ✅ Indexes on search fields (already done)
- ❌ NO N+1 queries
- ❌ NO fetching entire tables without limits

### Caching (Future)
- ❌ NO caching until proven bottleneck
- ❌ NO Redis unless explicitly required

---

## 9. Deployment Rules (Future)

- ✅ Environment variables for config
- ✅ Database migrations before deploy
- ✅ Health check endpoint
- ❌ NO hardcoded credentials
- ❌ NO direct database access in production

---

## 10. Documentation Rules

- ✅ README.md with setup instructions
- ✅ API documentation (Postman or simple markdown)
- ✅ Inline comments for business logic
- ❌ NO auto-generated docs initially

---

## 🚨 VIOLATION PROTOCOL

If any future implementation violates these rules:
1. STOP immediately
2. Refer back to this document
3. Use the simplest compliant solution
4. Update this document ONLY if new requirement explicitly demands it

---

## ✅ APPROVAL CHECKLIST

Before implementing ANY module:
- [ ] Does it follow the folder structure?
- [ ] Is the controller thin?
- [ ] Is business logic in the service?
- [ ] Does it use the standard response format?
- [ ] Is it junior-friendly code?
- [ ] Does it avoid over-engineering?

---

**END OF ARCHITECTURE RULES**