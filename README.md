# Contakt PH

Contakt is a multi-tenant business operations platform for Philippine companies
and organizations. This repository is the Turborepo foundation for its gradual
migration from a frontend-heavy Firebase architecture to a React SPA backed by
a NestJS modular monolith and PostgreSQL.

Read [`docs/PROJECT_DOCS.md`](docs/PROJECT_DOCS.md) for product context,
architecture decisions, security requirements, and the migration plan.

## Current Stack

- `apps/web`: React 19, Vite, TanStack Router and Query, shadcn/ui, Tailwind CSS
  4, and the Better Auth client.
- `apps/server`: NestJS using its current Express adapter, Better Auth, Prisma,
  Neon PostgreSQL, Zod, and Jest.
- `packages/contracts`: shared public API schemas and types.
- Workspace tooling: pnpm 9 and Turborepo.

The project documentation includes target-state decisions that may not be
implemented yet. For example, it discusses a future `apps/api` layout and
Fastify, while the current backend remains `apps/server` on Express. Treat the
checked-in code and configuration as the source of truth for current behavior.

## Requirements

- Node.js 18 or newer
- pnpm 9

Install dependencies from the repository root:

```sh
pnpm install
```

Keep one root `pnpm-lock.yaml`. See
[`docs/pnpm-workspace.md`](docs/pnpm-workspace.md) before adding or removing
workspace dependencies.

## Environment

Keep environment files inside the app that consumes them and never commit their
values.

The server validates its environment in `apps/server/src/config/env.ts`. Its
required integration settings include the database, Better Auth, frontend URL,
and email provider configuration.

The web app validates these public build-time variables in
`apps/web/src/config/env.ts`:

```text
VITE_APP_URL
VITE_API_URL
VITE_ENCRYPTION_KEY
```

Only put browser-safe values in `VITE_*` variables.

## Development

Run the complete workspace or one app:

```sh
pnpm dev
pnpm --filter web dev
pnpm --filter server dev
```

Common package-scoped checks:

```sh
pnpm --filter @contakt/contracts check-types
pnpm --filter @contakt/contracts build

pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build

pnpm --filter server test
pnpm --filter server build
pnpm --filter server lint
```

The server lint script currently applies fixes. Review its resulting diff.
Root `pnpm check-types` only runs in workspaces that define a `check-types`
script, so it does not replace the web typecheck or server build.

## Frontend Feature Structure

Product code is organized by feature. TanStack route files stay thin and render
pages owned by the corresponding feature.

```text
apps/web/src/features/<feature>/
├── components/
├── pages/
├── hooks/
├── atom/                    # Jotai atoms
├── utils/
└── docs/
    └── <feature>.docs.md
```

Keep feature-specific code inside its feature. Move code to shared root folders
only after it has a genuine cross-feature consumer:

- reusable UI primitives: `apps/web/src/components/ui`
- cross-feature hooks: `apps/web/src/hooks`
- shared clients and utilities: `apps/web/src/lib`
- application providers: `apps/web/src/providers`
- application configuration: `apps/web/src/config`

Do not edit `apps/web/src/routeTree.gen.ts` manually; the TanStack Router plugin
generates it from the route files.

## Agent Guidance

Coding agents must read [`AGENTS.md`](AGENTS.md). Claude Code loads the same
canonical instructions through [`CLAUDE.md`](CLAUDE.md).
