# Contakt — Project Documentation

**Last updated:** 2026-08-23  
**Product:** Contakt / Contakt PH  
**Architecture status:** Migration planning  
**Team:** 4 developers — 2 Frontend, 2 Backend

---

## 1. Project Overview

**Contakt** is a multi-tenant business operations platform for Philippine companies and organizations.

It is not a single-purpose application. A single platform serves multiple client companies under their own branding, domains, settings, users, permissions, and enabled modules.

Core product areas include:

- HR and payroll
- Timekeeping and attendance
- Leave and overtime
- Loans and cash advances
- Loyalty and rewards
- Digital business cards
- Inventory management
- Events
- Voting
- Email campaigns
- Asset tracking
- Organization and account management
- Public branded pages
- Super-admin tooling

Current approximate scale:

- ~5,000 registered users
- ~1,000 active users
- Multiple tenant companies
- Web PWA
- Companion mobile attendance/time-tracking application
- Public tenant-specific pages and flows

---

## 2. Migration Goal

The migration goal is to move Contakt away from a frontend-heavy Firebase BaaS architecture into a more secure and maintainable platform where:

- PostgreSQL becomes the primary system of record.
- Business logic moves from the browser into a real backend.
- Backend authorization becomes the primary security boundary.
- Frontend and backend are clearly separated.
- The application remains modular without introducing unnecessary microservices.
- Existing production functionality can be migrated gradually instead of through a big-bang rewrite.
- Firebase is retired progressively.

The target architecture is a **modular monolith**.

Microservices are **not** recommended during the initial migration.

---

# 3. Target Technology Stack

## Frontend

| Area | Technology |
|---|---|
| Framework | React |
| Build tool | Vite |
| Language | TypeScript |
| Router | TanStack Router |
| Server-state / API cache | TanStack Query |
| UI | shadcn/ui |
| Styling | Tailwind CSS |
| Forms | TanStack Form or project-standard form solution |
| Validation | Zod |
| Tables | TanStack Table |
| Testing | Vitest + Playwright |
| Hosting | Vercel Pro |
| PWA | Vite PWA integration where required |

The frontend remains an SPA.

Next.js is not required for the Contakt rebuild because the platform will have a dedicated backend and already includes non-web consumers such as mobile and public integrations.

---

## Backend

| Area | Technology |
|---|---|
| Framework | NestJS |
| HTTP adapter | Fastify |
| Runtime | Node.js |
| Language | TypeScript |
| ORM | Prisma |
| Authentication | Better Auth |
| Validation | DTO validation and shared schemas |
| Hosting | Railway |
| API style | REST-first |
| Architecture | Modular monolith |
| Background jobs | Separate Railway worker processes when needed |

### Why NestJS

Contakt contains many independent but related business domains.

NestJS provides useful conventions for:

- modules
- controllers
- services
- dependency injection
- guards
- interceptors
- background processing
- WebSockets
- testing
- large-team maintainability

The backend should be organized around business domains rather than generic technical folders.

---

## Database

| Area | Technology |
|---|---|
| Database | PostgreSQL |
| Provider | Neon |
| ORM | Prisma |
| Migration system | Prisma Migrate |
| Primary access | NestJS backend only |

Neon is preferred because Contakt already has a dedicated backend and does not require a full BaaS platform for database access.

The frontend must **not** access PostgreSQL directly.

---

## Authentication

Target authentication:

```text
Better Auth
    │
    ▼
NestJS
    │
    ▼
Neon PostgreSQL
```

Better Auth will run as part of the backend environment hosted on Railway.

Authentication and tenant membership must remain conceptually separate.

Example:

```text
Auth User
   │
   ├── Company Membership A
   │       └── Role / Permissions
   │
   └── Company Membership B
           └── Role / Permissions
```

Do not treat the authentication user record as the complete employee/member/company record.

---

# 4. Infrastructure

Target production infrastructure:

```text
                         GitHub
                            │
                       Turborepo
                            │
             ┌──────────────┴──────────────┐
             │                             │
          apps/web                      apps/api
             │                             │
     React + Vite                         NestJS
     TanStack Router                      Fastify
     TanStack Query                       Prisma
     shadcn/ui                            Better Auth
             │                             │
          Vercel                        Railway
             │                             │
             └──────────── HTTPS ──────────┘
                                           │
                                           ▼
                                    Neon PostgreSQL
```

Optional supporting infrastructure may be added later for:

- object storage
- queues
- email
- scheduled jobs
- realtime
- observability
- caching

Do not add Redis, Kafka, or microservices until a real workload requires them.

---

# 5. Repository Strategy

Use a **Turborepo monorepo**.

Recommended tooling:

- Turborepo
- pnpm workspaces
- Node.js
- TypeScript

Recommended root structure:

```text
contakt/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── contracts/
│   ├── config/
│   └── tooling/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

Ownership:

```text
apps/web
→ Frontend team

apps/api
→ Backend team

packages/contracts
→ Shared FE + BE ownership

packages/config
→ Shared tooling/config ownership
```

Use `CODEOWNERS` to enforce review boundaries.

Example:

```text
/apps/web/             @frontend-team
/apps/api/             @backend-team
/packages/contracts/   @frontend-team @backend-team
```

---

# 6. Shared Contracts

Avoid a generic `packages/shared` dumping ground.

Prefer:

```text
packages/contracts/
```

This package should only contain API-facing contracts such as:

- request schemas
- response schemas
- enums
- API types
- shared validation
- public constants

Example:

```ts
export const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string(),
})

export type CreateLeaveRequest = z.infer<
  typeof createLeaveRequestSchema
>
```

Do not expose backend internals through this package.

Do not share:

- Prisma client
- repositories
- NestJS services
- database-specific logic
- private authorization rules

---

# 7. Backend Module Structure

Recommended backend structure:

```text
apps/api/src/
├── modules/
│   ├── auth/
│   ├── companies/
│   ├── memberships/
│   ├── users/
│   ├── branches/
│   ├── departments/
│   ├── permissions/
│   │
│   ├── attendance/
│   ├── schedules/
│   ├── leave/
│   ├── overtime/
│   ├── loans/
│   ├── benefits/
│   ├── payroll/
│   │
│   ├── loyalty/
│   ├── rewards/
│   ├── cards/
│   │
│   ├── inventory/
│   ├── stock-transfers/
│   │
│   ├── events/
│   ├── voting/
│   │
│   ├── email/
│   ├── certificates/
│   ├── assets/
│   │
│   ├── integrations/
│   └── audit/
│
├── common/
├── config/
├── database/
└── main.ts
```

Each business module should generally contain:

```text
module/
├── controller
├── service
├── dto
├── repository / data-access
├── guards if domain-specific
├── policies if domain-specific
└── tests
```

---

# 8. Modular Monolith Strategy

Contakt should start as one deployable backend application.

```text
NestJS API
├── Payroll
├── Attendance
├── Loyalty
├── Inventory
├── Events
├── Voting
├── Email
└── Assets
```

This provides:

- strong domain boundaries
- one deployment
- one database
- simpler debugging
- simpler transactions
- easier migrations
- lower infrastructure cost

Do not create separate microservices for each module during the initial rebuild.

---

# 9. Worker Strategy

Certain workloads may later move into separate worker processes without becoming independent microservices.

Candidates:

- payroll batch processing
- large email blasts
- PDF generation
- Excel generation
- certificate generation
- bulk imports
- scheduled reports
- notifications

Potential future topology:

```text
Railway

├── contakt-api
├── payroll-worker
├── email-worker
└── report-worker
```

All services may still live in the same monorepo.

---

# 10. Multi-Tenancy

Multi-tenancy must be a first-class concern in the database and backend.

Tenant-owned tables should explicitly contain company/tenant ownership where appropriate.

Example:

```text
companies
id

company_memberships
id
company_id
user_id

branches
id
company_id

departments
id
company_id

leave_requests
id
company_id
user_id

payroll_runs
id
company_id

inventory_items
id
company_id
```

Do not rely on indirect tenant discovery when explicit ownership is possible.

Every protected backend request should conceptually go through:

```text
Authentication
    ↓
Tenant resolution
    ↓
Membership validation
    ↓
Permission check
    ↓
Business rule validation
    ↓
Database operation
```

---

# 11. Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> What is the user allowed to do?

Do not use frontend route visibility as the security boundary.

Frontend navigation permissions are only for UX.

The backend must independently enforce permissions.

Suggested concepts:

- platform role
- company membership
- company role
- module permissions
- approver permissions
- branch restrictions
- department restrictions
- special security PIN / elevated access where required

Sensitive modules such as payroll must enforce authorization server-side.

---

# 12. Payroll Architecture

Payroll is a critical domain and should become a centralized backend engine.

Current browser-heavy calculations should progressively move into backend services.

Target concept:

```text
Attendance
    │
Schedules
    │
Leave / OT
    │
Benefits / Deductions
    │
Government Contributions
    │
    ▼
Payroll Engine
    │
    ▼
Payroll Run
    │
    ▼
Payroll Items
```

The payroll engine should support:

- daily and hourly rates
- employee schedules
- lateness
- undertime
- overtime
- night differential
- holidays
- allowances
- commissions
- benefits
- deductions
- SSS
- PhilHealth
- Pag-IBIG
- loans
- cash advances
- payroll cutoffs
- client-specific rules

Existing payroll tests must be treated as migration safety checks.

For identical input, the old and new payroll engine should produce equivalent results before cutover.

---

# 13. Realtime Strategy

Do not reproduce Firestore realtime behavior everywhere.

Classify features based on whether realtime is actually required.

Likely realtime candidates:

- live voting results
- attendance monitoring
- selected scanner flows
- selected live store/transaction views

Likely non-realtime candidates:

- settings
- employee directory
- payroll setup
- inventory catalog
- company settings
- historical reports

For normal CRUD data use:

```text
TanStack Query
+
cache invalidation
+
refetch
```

For true realtime requirements evaluate:

- NestJS WebSocket gateways
- Server-Sent Events
- database/realtime service if justified

---

# 14. Frontend Architecture

Recommended web app structure:

```text
apps/web/src/
├── routes/
├── features/
│   ├── auth/
│   ├── companies/
│   ├── users/
│   ├── payroll/
│   ├── attendance/
│   ├── loyalty/
│   ├── inventory/
│   ├── events/
│   ├── voting/
│   └── assets/
│
├── components/
│   └── ui/
├── hooks/
├── lib/
├── config/
└── main.tsx
```

Prefer feature-based architecture over global technical buckets.

The frontend should progressively stop using Firebase controllers directly.

Target:

```text
React Feature
    ↓
TanStack Query
    ↓
API client
    ↓
NestJS
    ↓
PostgreSQL
```

---

# 15. API Conventions

Prefer predictable REST resources.

Examples:

```text
GET    /companies
GET    /companies/:companyId
POST   /companies

GET    /companies/:companyId/users
POST   /companies/:companyId/users

GET    /companies/:companyId/leave-requests
POST   /companies/:companyId/leave-requests

POST   /companies/:companyId/payroll-runs
GET    /companies/:companyId/payroll-runs/:runId
```

Do not blindly preserve the existing Firebase controller response format if a cleaner API contract is possible.

A recommended API envelope should be kept minimal.

Example:

```json
{
  "data": {}
}
```

Errors should use consistent HTTP status codes and a standardized error shape.

---

# 16. Authentication Migration

Do not migrate Firebase Auth at the same time as all business data.

Recommended sequence:

## Phase 1

Keep Firebase Auth.

```text
Web
  ↓
Firebase Auth
  ↓ ID token
NestJS
  ↓
Verify Firebase token
```

The backend becomes the authorization boundary while Firebase remains the identity provider.

## Phase 2

Migrate business domains from Firestore to PostgreSQL.

## Phase 3

Introduce Better Auth.

Plan identity mapping carefully.

## Phase 4

Migrate users to Better Auth.

## Phase 5

Remove Firebase Auth after a verified cutover.

---

# 17. Firebase Migration Strategy

Use a **strangler migration**.

Do not rewrite all modules before shipping.

Target model:

```text
Existing Contakt
      │
      ├── Firebase domains
      │
      └── NestJS/Postgres domains
```

Move one bounded domain at a time.

Recommended general process:

1. Design PostgreSQL schema.
2. Backfill historical data.
3. Validate migrated data.
4. Add API endpoints.
5. Point new frontend flow to NestJS.
6. Shadow or synchronize writes when necessary.
7. Validate production behavior.
8. Switch source of truth.
9. Stop Firestore writes for that domain.
10. Retire old Firebase code.

Avoid uncontrolled dual-writes.

A dual-write failure can create divergence:

```text
Firestore success
Postgres failure
```

or:

```text
Postgres success
Firestore failure
```

Use dual-write only with an explicit consistency and retry strategy.

---

# 18. Recommended Migration Order

## Phase 0 — Platform Foundation

- Turborepo
- pnpm
- `apps/web`
- `apps/api`
- shared contracts
- NestJS bootstrap
- Fastify
- Prisma
- Neon
- Railway deployment
- Vercel integration
- CI/CD
- logging
- environment configuration

## Phase 1 — Core Identity Domain

Migrate:

- companies
- users/profile data
- company memberships
- branches
- departments
- settings
- permissions
- audit logs

Keep Firebase Auth temporarily.

## Phase 2 — Contained Business Domain

Migrate one lower-risk domain to prove the architecture.

Recommended candidates:

- account management
- asset management
- organization settings

## Phase 3 — HR Foundation

Migrate:

- schedules
- attendance
- leave
- overtime
- benefits
- deductions

## Phase 4 — Payroll Engine

Move calculation logic server-side.

Validate every calculation against the existing payroll test suite.

## Phase 5 — Remaining Domains

Suggested sequence:

1. Loyalty
2. Digital cards
3. Events
4. Voting
5. Inventory
6. Email campaigns
7. Public flows

Actual order should follow business priority and production risk.

## Phase 6 — Authentication Cutover

Firebase Auth → Better Auth.

## Phase 7 — Firebase Retirement

Remove remaining:

- Firestore reads/writes
- Firebase Storage if replaced
- Firebase Functions/backend dependencies
- Firebase Auth
- unused SDK code

---

# 19. Storage Strategy

Firebase Storage should not automatically be replaced during the first migration slice.

Evaluate object storage separately.

Potential targets:

- Cloudflare R2
- S3-compatible object storage
- existing Firebase Storage temporarily

Storage migration should be treated independently from database migration.

Prefer storing only metadata in PostgreSQL.

Example:

```text
documents
├── id
├── company_id
├── storage_key
├── mime_type
├── original_filename
├── size
└── created_at
```

---

# 20. Deployment

## Frontend

Host:

```text
Vercel Pro
```

Root:

```text
apps/web
```

## Backend

Host:

```text
Railway
```

Root:

```text
apps/api
```

Railway may host multiple services under the same workspace as the platform grows.

Initial production deployment should contain one API service.

Add workers only when justified.

---

# 21. Environments

Recommended environments:

```text
development
staging
production
```

Do not use one shared database across all environments.

Recommended separation:

```text
Development
→ local / development Neon branch or DB

Staging
→ staging database

Production
→ production database
```

Environment variables should never be committed.

Typical backend variables:

```text
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
WEB_APP_URL=
NODE_ENV=
```

Additional integration secrets should be namespaced and managed through Railway/Vercel.

---

# 22. CI/CD

Recommended checks on every pull request:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Playwright against important end-to-end flows.

High-priority E2E coverage:

- login
- tenant access
- permission checks
- time in/out
- leave request
- payroll generation
- loyalty points
- voting
- inventory transactions

Turborepo should run only affected builds/tests where practical.

---

# 23. Testing

## Frontend

- Vitest
- React Testing Library where useful
- Playwright

## Backend

- NestJS unit tests
- service tests
- integration tests
- API E2E tests

## Payroll

Payroll requires extensive regression testing.

Maintain fixture-based payroll scenarios covering:

- regular day
- holiday
- overtime
- night differential
- lateness
- undertime
- absence
- leave
- combinations of earnings/deductions
- government contributions
- loan deductions
- client-specific configurations

---

# 24. Security Requirements

The migration must improve the current security posture.

Required principles:

- No direct browser access to production PostgreSQL.
- No permissive database access from the frontend.
- Backend validates every protected operation.
- Tenant ownership is checked on every tenant-scoped resource.
- Sensitive fields are encrypted when required.
- Secrets remain server-side.
- Passwords are never stored directly.
- Audit important administrative actions.
- Apply rate limits to sensitive endpoints.
- Validate all external input.
- Avoid trusting frontend-supplied roles or company IDs without authorization checks.

Security should follow:

```text
Request
  ↓
Authentication
  ↓
Tenant validation
  ↓
Authorization
  ↓
Input validation
  ↓
Business rules
  ↓
Database transaction
```

---

# 25. Database Conventions

Recommended practices:

- UUID or consistent stable IDs
- explicit `company_id`
- created/updated timestamps
- soft delete only when business requirements justify it
- foreign keys
- database constraints
- unique indexes
- indexes for tenant + frequently filtered columns
- transactions for multi-step financial/inventory operations

Example:

```text
@@index([companyId, createdAt])
@@index([companyId, status])
@@unique([companyId, employeeCode])
```

Do not rely entirely on application validation when the database can enforce integrity.

---

# 26. Financial and Transactional Operations

Treat these as transactional:

- payroll finalization
- loyalty point deductions
- rewards redemption
- inventory stock movement
- loan releases
- payment records
- asset assignment changes

Use database transactions.

Do not perform multi-step financial writes as unrelated independent database updates.

---

# 27. Logging and Audit

Separate technical logs from business audit logs.

Technical logging:

- request errors
- integrations
- latency
- server errors
- failed jobs

Business audit:

- who changed payroll
- who approved leave
- who issued loyalty points
- who modified company settings
- who transferred inventory
- previous value
- new value
- timestamp
- tenant

Audit data should be queryable and tenant-aware.

---

# 28. Coding Guidelines

## General

- TypeScript strict mode.
- Prefer explicit domain names.
- Keep controllers thin.
- Keep business rules in services/domain logic.
- Keep database queries out of controllers.
- Avoid cross-module imports that bypass module boundaries.
- Do not expose Prisma directly to frontend code.
- Avoid duplicated FE/BE validation where a shared contract is appropriate.

## Backend

Preferred dependency direction:

```text
Controller
   ↓
Service
   ↓
Repository / Prisma
```

Not:

```text
Controller
   ↓
Prisma everywhere
```

## Frontend

Preferred dependency direction:

```text
Route / Page
   ↓
Feature hook
   ↓
TanStack Query
   ↓
API client
```

Avoid feature components directly calling raw `fetch()` everywhere.

---

# 29. What We Are Intentionally Not Doing

At this migration stage, do **not** introduce:

- Kubernetes
- Kafka
- many independent microservices
- multiple databases per module
- unnecessary Redis
- event-driven architecture everywhere
- premature CQRS
- premature event sourcing
- a full Next.js rewrite
- a big-bang Firebase replacement

The priority is a secure, modular, maintainable platform that the existing four-person team can operate.

---

# 30. Final Architecture Decision

The target stack for Contakt is:

```text
MONOREPO
Turborepo + pnpm

FRONTEND
React
Vite
TanStack Router
TanStack Query
shadcn/ui
Tailwind CSS
Vercel Pro

BACKEND
NestJS
Fastify
Node.js
Railway

DATABASE
PostgreSQL
Neon
Prisma

AUTH
Firebase Auth during early migration
Better Auth as target authentication platform

ARCHITECTURE
Modular monolith

MIGRATION
Strangler migration by domain
```

This architecture is chosen because Contakt is a multi-domain platform with a dedicated backend team, mobile/public consumers, complex payroll logic, multi-tenancy, realtime requirements in selected modules, and business rules that should no longer live primarily in the browser.

The objective is not simply to replace Firebase.

The objective is to establish a backend platform that can support Contakt's next stage of development without introducing unnecessary infrastructure complexity.
