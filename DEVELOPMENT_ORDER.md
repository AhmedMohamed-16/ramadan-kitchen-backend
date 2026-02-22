# Development Order - Ramadan Kitchen Management System

**VERSION:** 1.0  
**STATUS:** LOCKED  
**DATE:** 2025-02-15

---

## 📋 Implementation Sequence

Modules MUST be implemented in this exact order to maintain dependency integrity.

---

## Phase 3: Authentication & Users
**Order:** 1-2  
**Dependencies:** None

### 3.1 Authentication Module
- JWT token generation
- Login endpoint
- Token validation middleware
- Password hashing utilities

### 3.2 Users Module
- User CRUD operations
- Role management (ADMIN, DISTRIBUTOR, ACCOUNTANT)
- Password change
- User listing with filters

**Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/refresh (optional)
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

---

## Phase 4: Core Data Management
**Order:** 3-6  
**Dependencies:** Users (for authentication)

### 4.1 Locations Module
**Order:** 3

- Location CRUD
- Used by: donors, beneficiaries

**Endpoints:**
```
GET    /api/locations
GET    /api/locations/:id
POST   /api/locations
PUT    /api/locations/:id
DELETE /api/locations/:id
```

### 4.2 Donors Module
**Order:** 4  
**Depends on:** Locations

- Donor CRUD
- Search by phone
- Filter by location

**Endpoints:**
```
GET    /api/donors
GET    /api/donors/:id
GET    /api/donors/search?phone=xxx
POST   /api/donors
PUT    /api/donors/:id
DELETE /api/donors/:id
```

### 4.3 Donations Module
**Order:** 5  
**Depends on:** Donors

- Donation CRUD
- Filter by date range, donor
- Total calculations via queries

**Endpoints:**
```
GET    /api/donations
GET    /api/donations/:id
GET    /api/donations/total?startDate=xxx&endDate=xxx
POST   /api/donations
PUT    /api/donations/:id
DELETE /api/donations/:id
```

### 4.4 Beneficiaries Module
**Order:** 6  
**Depends on:** Locations

- Beneficiary CRUD
- FAST search by name or phone
- Filter by location, needLevel, isActive
- Pagination required

**Endpoints:**
```
GET    /api/beneficiaries
GET    /api/beneficiaries/:id
GET    /api/beneficiaries/search?q=xxx
POST   /api/beneficiaries
PUT    /api/beneficiaries/:id
DELETE /api/beneficiaries/:id (soft delete)
```

---

## Phase 5: Distribution System
**Order:** 7-9  
**Dependencies:** Beneficiaries

### 5.1 Beneficiary Schedule Module
**Order:** 7  
**Depends on:** Beneficiaries

- Assign days of week to beneficiaries
- Get eligible beneficiaries for specific day

**Endpoints:**
```
GET    /api/beneficiaries/:id/schedule
POST   /api/beneficiaries/:id/schedule
PUT    /api/beneficiaries/:id/schedule
DELETE /api/beneficiaries/:id/schedule/:dayId
GET    /api/beneficiaries/eligible?date=2025-02-15
```

### 5.2 Distribution Module
**Order:** 8  
**Depends on:** Beneficiaries, Schedule

- Create distribution day
- Load eligible beneficiaries automatically
- Mark received/not received
- Update meals delivered
- Filter by location, needLevel

**Endpoints:**
```
GET    /api/distribution/days
GET    /api/distribution/days/:id
POST   /api/distribution/days (auto-loads eligible)
GET    /api/distribution/days/:id/allocations
PUT    /api/distribution/allocations/:id (mark received)
```

### 5.3 Extra Distributions Module
**Order:** 9  
**Depends on:** Beneficiaries (optional link)

- Log extra meals given
- Search beneficiary or create ad-hoc entry
- Filter by date

**Endpoints:**
```
GET    /api/distribution/extra
GET    /api/distribution/extra/:id
POST   /api/distribution/extra
DELETE /api/distribution/extra/:id
```

---

## Phase 6: Financial Management
**Order:** 10  
**Dependencies:** None (independent)

### 6.1 Expenses Module
**Order:** 10

- Expense CRUD
- Filter by date range, category
- Total calculations via queries

**Endpoints:**
```
GET    /api/expenses
GET    /api/expenses/:id
GET    /api/expenses/total?startDate=xxx&endDate=xxx
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
```

---

## Phase 7: Reporting
**Order:** 11  
**Dependencies:** ALL previous modules

### 7.1 Reports Module
**Order:** 11

- Daily report (single day stats)
- Period report (date range stats)
- Excel export for donations, expenses, distributions

**Endpoints:**
```
GET    /api/reports/daily?date=2025-02-15
GET    /api/reports/period?startDate=xxx&endDate=xxx
GET    /api/reports/export/donations?startDate=xxx&endDate=xxx
GET    /api/reports/export/expenses?startDate=xxx&endDate=xxx
GET    /api/reports/export/distributions?startDate=xxx&endDate=xxx
```

---

## Phase 8: Automation (Optional)
**Order:** 12  
**Dependencies:** Reports

### 8.1 Scheduled Jobs
**Order:** 12

- Daily report generation (end of day)
- Email delivery (placeholder)
- Use node-cron or simple scheduler

**Implementation:**
```
src/jobs/
  dailyReport.job.ts
  scheduler.ts
```

---

## 🔄 Implementation Rules Per Module

For EACH module, follow this sequence:

1. **Validation schemas** (validation.ts)
2. **Service layer** (service.ts) - Business logic
3. **Controller layer** (controller.ts) - Request handling
4. **Routes** (routes.ts) - Endpoint definitions
5. **Mount in app.ts**
6. **Test manually** (Postman/curl)

---

## 🚫 FORBIDDEN During Implementation

- ❌ Jumping ahead to later modules
- ❌ Implementing multiple modules simultaneously
- ❌ Changing architecture mid-implementation
- ❌ Adding features not in spec
- ❌ Over-engineering solutions

---

## ✅ Module Completion Checklist

Before moving to next module:
- [ ] All endpoints implemented
- [ ] Validation working
- [ ] Error handling tested
- [ ] Authentication/authorization applied
- [ ] Manual testing completed
- [ ] Code follows architecture rules

---

## 📊 Progress Tracking

| Phase | Module | Status | Dependencies |
|-------|--------|--------|--------------|
| 1 | Database Schema | ✅ DONE | None |
| 2 | Project Bootstrap | ✅ DONE | None |
| 3.1 | Authentication | 🔲 TODO | None |
| 3.2 | Users | 🔲 TODO | Auth |
| 4.1 | Locations | 🔲 TODO | Users |
| 4.2 | Donors | 🔲 TODO | Locations |
| 4.3 | Donations | 🔲 TODO | Donors |
| 4.4 | Beneficiaries | 🔲 TODO | Locations |
| 5.1 | Beneficiary Schedule | 🔲 TODO | Beneficiaries |
| 5.2 | Distribution | 🔲 TODO | Schedule |
| 5.3 | Extra Distributions | 🔲 TODO | Distribution |
| 6.1 | Expenses | 🔲 TODO | Users |
| 7.1 | Reports | 🔲 TODO | All modules |
| 8.1 | Automation | 🔲 TODO | Reports |

---

**NEXT STEP:** Begin Phase 3.1 - Authentication Module

**END OF DEVELOPMENT ORDER**