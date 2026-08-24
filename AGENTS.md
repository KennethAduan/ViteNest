# ViteNest Agent Guide

This file is the canonical instruction set for coding agents working in this
repository. Keep it concise, current, and based on checked-in behavior.

## Start Here

Before changing code:

1. Read `README.md` and any feature or package documentation relevant to the
   task.
2. Inspect the affected package's `package.json`, configuration, neighboring
   implementation, and tests. Current code and configuration are the source of
   truth for current behavior.
3. Run `git status --short`. Preserve all unrelated and pre-existing changes.
4. If the task matches a repository skill, read the corresponding
   `.agents/skills/<skill-name>/SKILL.md` before implementing.

The current backend is `apps/server` and uses NestJS with the Express adapter.
Do not rename the app or switch adapters unless the task explicitly includes
that migration.

## Repository Map

- `apps/web`: React 19 + Vite SPA, TanStack Router/Query/Table, shadcn/ui,
  Tailwind CSS 4, Better Auth client.
- `apps/server`: NestJS modular monolith, Better Auth, Prisma, Neon PostgreSQL,
  Zod validation, Jest.
- `packages/contracts`: compiled public API schemas and types shared by web and
  server. It must not contain Prisma, NestJS services, repositories, or private
  authorization logic.
- `docs/pnpm-workspace.md`: canonical dependency-install and workspace-command
  guidance.
- `.agents/skills`: task-specific implementation and review guidance.

Use `pnpm` from the repository root. Filters use the package `name` (`web`,
`server`, or `@vitenest/contracts`), not the directory name. Keep a single root
`pnpm-lock.yaml`; never create nested lockfiles or workspace files.

## Working Method

1. Identify the requested behavior and affected workspace packages.
2. Trace the existing runtime path end to end before editing. For cross-stack
   work, trace route/component -> API client -> controller -> service -> Prisma.
3. Note boundary effects: API contract, authentication, authorization, tenant
   scope, database migration, generated code, and dependent packages.
4. Make the smallest coherent change. Follow nearby patterns and add or update
   tests for changed behavior.
5. Run the narrowest relevant checks first, then broader checks when the change
   crosses package boundaries.
6. Review the final diff for accidental formatter edits, generated artifacts,
   secrets, and unrelated changes.

Do not create speculative abstractions, generic shared dumping grounds, new
infrastructure, or compatibility layers without a demonstrated need.

## Architecture Boundaries

### Web

- Keep file routes in `apps/web/src/routes`. Never hand-edit
  `apps/web/src/routeTree.gen.ts`.
- Organize product code by feature under `apps/web/src/features/<feature>`.
  Route files should stay thin and import the feature page instead of owning
  domain UI or business behavior.

```text
features/<feature>/
├── components/              # Feature-private UI
├── pages/                   # Route-level feature screens
├── hooks/                   # Feature behavior and server-state hooks
├── atom/                    # Feature-scoped Jotai atoms
├── utils/                   # Feature-specific pure helpers
└── docs/
    └── <feature>.docs.md     # Behavior, flows, contracts, and decisions
```

- Keep code inside its feature unless it is genuinely reused. Shared UI
  primitives belong in `components/ui`; cross-feature infrastructure belongs in
  root `lib`, `hooks`, `providers`, or `config`.
- Update `<feature>.docs.md` when a change alters the feature's workflow, API
  contract, authorization rules, important state, or non-obvious decisions.
- Use TanStack Query for server state and the configured API/auth clients for
  network access. Do not scatter raw `fetch` or one-off Axios clients through
  components.
- Reuse `@vitenest/contracts` schemas and types when an API contract exists.
- Reuse existing shadcn primitives and semantic Tailwind tokens. Preserve
  keyboard access, responsive behavior, light/dark themes, and reduced-motion
  preferences.
- Treat route visibility and hidden controls as UX only; authorization belongs
  on the server.

### Server

- Organize business capabilities as NestJS modules. Keep controllers thin,
  business rules in services/domain code, and persistence behind Prisma-backed
  services or repositories.
- Validate external input at the server boundary. Prefer shared Zod request
  schemas from `@vitenest/contracts` when they are part of the public API.
- Preserve the standard success envelope produced by `TransformInterceptor`.
  Better Auth endpoints under `/api/auth` intentionally bypass that envelope.
- Authentication, tenant membership, and permissions are separate concerns.
  Every protected tenant resource must verify membership, permission, and
  tenant ownership server-side.
- Use transactions for multi-step financial, payroll, loyalty, inventory, loan,
  payment, and asset-assignment writes.
- Use Better Auth APIs for Better Auth-owned identity operations; do not bypass
  its invariants with ad hoc user/session/account writes.

### Contracts and Database

- Public request/response schemas belong in `packages/contracts/src` and must be
  exported through its public entry point. Build contracts before validating
  dependent apps.
- Prisma source lives in `apps/server/prisma/schema`; generated client code lives
  in `apps/server/src/generated/prisma` and must not be hand-edited.
- Add new migrations for schema changes. Never rewrite an already-applied
  migration unless the user explicitly requests a disposable local reset.
- Never run seeds or migrations against staging, production, or another shared
  database without explicit authorization.
- Keep secrets server-side. Never commit `.env` files, credentials, tokens, or
  production data. Browser environment variables must be safe to expose.
- Preserve cookie authentication across the stack: the web client uses
  credentials, while server CORS and Better Auth trusted origins must remain
  aligned with the frontend URL.

## Commands

Common development commands:

```sh
pnpm install
pnpm dev
pnpm --filter web dev
pnpm --filter server dev
```

Use package-scoped validation for focused changes:

```sh
# Contracts
pnpm --filter @vitenest/contracts check-types
pnpm --filter @vitenest/contracts build

# Web
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build

# Server
pnpm --filter server test
pnpm --filter server build
pnpm --filter server lint
pnpm --filter server test:e2e
```

Validation notes:

- `server`'s `lint` script currently includes `--fix`; inspect the diff after it
  runs.
- Root `pnpm check-types` only reaches workspaces that define a `check-types`
  script. It does not replace `pnpm --filter web typecheck` or a server build.
- Run server E2E tests only when the required test environment/database is
  configured; report clearly when it is unavailable.
- For cross-package changes, finish with `pnpm lint`, `pnpm check-types`, and
  `pnpm build` after the scoped checks.
- For documentation-only changes, inspect rendered Markdown, links, and the
  diff; runtime tests are normally unnecessary.

Keep task logic in package scripts and let root scripts delegate through
`turbo run`. When changing `turbo.json`, declare real task dependencies and
cache outputs that match the current tools (`dist/**` for the current Vite,
NestJS, and compiled-contract builds).

## Safety and Handoff

- Do not discard user changes or use destructive Git commands.
- Do not commit, push, deploy, publish, or mutate external services unless the
  user explicitly asks.
- Do not weaken authentication, authorization, tenancy checks, validation, or
  auditability to make a test pass.
- State exactly what changed, which commands ran and their outcomes, and any
  remaining risk or validation that could not be completed.
- Never claim a check passed if it was not run successfully.
