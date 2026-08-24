# ViteNest Technology Stack

This document describes the implementation currently checked into the
repository. Package manifests and runtime configuration remain the source of
truth when this document and code differ.

## Repository Shape

```text
vitenest/
├── apps/
│   ├── web/                 # React SPA
│   └── server/              # NestJS API
├── packages/
│   └── contracts/           # Shared public Zod schemas and TypeScript types
├── .agents/skills/          # Task-specific coding-agent guidance
├── AGENTS.md                # Canonical repository guidance
├── CLAUDE.md                # Claude Code entry point
├── pnpm-workspace.yaml
└── turbo.json
```

Workspace packages use one root `pnpm-lock.yaml`. Run dependency commands from
the repository root and target workspaces by package name.

## Runtime and Workspace

| Area | Current implementation |
| --- | --- |
| Runtime | Node.js 20.19+ in the 20.x line, or Node.js 22.12+ |
| Package manager | pnpm 9 workspaces |
| Task runner | Turborepo 2 |
| Language | TypeScript; versions are declared per workspace |
| Formatting | Prettier 3 |
| Git hooks | Husky 9 |
| Static analysis | ESLint, Fallow, and React Doctor |

Turbo coordinates `dev`, `build`, `lint`, and `check-types`. Builds depend on
upstream workspace builds, so `@vitenest/contracts` compiles before consuming
applications.

## Web Application

`apps/web` is a client-rendered SPA.

| Concern | Technology |
| --- | --- |
| UI runtime | React 19 |
| Build tool | Vite 8 |
| Language | TypeScript 6 |
| Routing | TanStack Router with generated file routes and automatic code splitting |
| Server state | TanStack Query 5 |
| Forms | TanStack Form 1 |
| Tables | TanStack Table 9 |
| Local state | Jotai 2 |
| URL state | nuqs 2 |
| UI primitives | shadcn, Base UI, and Lucide icons |
| Styling | Tailwind CSS 4 and `tw-animate-css` |
| Validation | Zod 4 |
| HTTP | Shared Axios client |
| Authentication | Better Auth React client with admin plugin |

The shared Axios client reads `VITE_API_URL` and enables credentials for cookie
authentication. Better Auth uses the same API base URL. Route files live under
`apps/web/src/routes`; product implementation belongs under
`apps/web/src/features`.

Do not edit `apps/web/src/routeTree.gen.ts` manually. TanStack Router generates
it from route files.

## Server Application

`apps/server` is a NestJS 11 modular monolith using the current Express adapter.

| Concern | Technology |
| --- | --- |
| Framework | NestJS 11 |
| HTTP adapter | Express |
| API style | REST |
| Authentication | Better Auth 1 with NestJS integration and admin plugin |
| ORM | Prisma 7 |
| Database | PostgreSQL on Neon through `@prisma/adapter-neon` |
| Validation | Zod 4 and a NestJS validation pipe |
| Configuration | Nest Config with Zod environment validation |
| Email | Elastic Email integration |
| Unit tests | Jest 30 with `ts-jest` |
| E2E tests | Jest and Supertest |

Better Auth, NestJS services, and the shared Prisma service use one Prisma
client. Runtime database traffic uses `DATABASE_URL`; Prisma CLI operations use
`DATABASE_URL_UNPOOLED` when provided.

Normal NestJS endpoints use the success envelope produced by
`TransformInterceptor`. Better Auth endpoints bypass that envelope and keep
Better Auth's native response format.

## Database and Authentication

Prisma schema files live in `apps/server/prisma/schema`. Generated client code
lives in `apps/server/src/generated/prisma` and must not be edited manually.

Current database models are Better Auth identity models:

- `User`
- `Session`
- `Account`
- `Verification`

Current authentication includes email and password sign-up, email verification,
password reset, cookie sessions, admin roles, bans, and impersonation support.
Authentication is implemented; organization membership, tenant ownership,
billing, and product-specific authorization are not included yet.

## Shared Contracts

`packages/contracts` publishes the private workspace package
`@vitenest/contracts`. It contains compiled public request/response schemas and
their inferred TypeScript types.

Current contracts include:

- standard API success envelopes
- user responses
- admin user-creation input

Contracts must stay independent from Prisma, NestJS services, repositories, and
private authorization logic.

## Request Flow

```text
React route or feature
  -> TanStack Query or shared Axios client
  -> NestJS controller
  -> service
  -> Prisma
  -> Neon PostgreSQL
```

Public request and response shapes cross the web/server boundary through
`@vitenest/contracts`. Browser requests include credentials; server CORS and
Better Auth trusted origins use the configured frontend URL.

## Environment Boundaries

Environment files stay inside the app that consumes them.

Server configuration:

- `DATABASE_URL`
- optional `DATABASE_URL_UNPOOLED`
- `FRONT_END_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- Elastic Email settings
- optional super-admin seed settings

Browser-safe web configuration:

- `VITE_APP_URL`
- `VITE_API_URL`
- `VITE_ENCRYPTION_KEY`

Never place server secrets in `VITE_*` variables.

## Agent Support

ViteNest keeps agent instructions inside the repository:

- `AGENTS.md` is the shared source of truth for Codex and other compatible
  coding agents.
- `CLAUDE.md` directs Claude Code to `AGENTS.md` and holds only Claude-specific
  additions.
- `.agents/skills` provides focused guidance for Better Auth, Fallow, NestJS,
  React Doctor, shadcn, TanStack libraries, Turborepo, and React practices.

Agent guidance does not replace runtime enforcement. Authentication,
authorization, validation, tests, and database constraints remain code-level
responsibilities.

## Current Starter Scope

Included now:

- React and NestJS workspace wiring
- compiled shared contracts
- Better Auth email/password flows
- Prisma and Neon integration
- user API examples
- reusable UI and data-table infrastructure
- package-scoped and root workspace commands
- checked-in guidance for developers and coding agents

Not included now:

- organization or tenant models
- billing or subscriptions
- product-specific business modules
- deployment-provider configuration
- queues, caches, or microservices
