# ViteNest

ViteNest is an agent-ready full-stack TypeScript monorepo starter. It pairs a
React and Vite SPA with a NestJS modular monolith, PostgreSQL, shared Zod
contracts, and production-minded workspace tooling.

See [`docs/TECH_STACK.md`](docs/TECH_STACK.md) for the implementation-level
stack, package boundaries, data flow, and current starter scope.

Repository guidance is designed for both developers and coding agents:

- [`AGENTS.md`](AGENTS.md) gives Codex and other compatible agents one canonical
  source of repository-wide guidance.
- [`CLAUDE.md`](CLAUDE.md) directs Claude Code to those shared instructions.
- [`.agents/skills`](.agents/skills) contains task-specific implementation and
  review guidance usable by compatible coding agents.

## Current Stack

- `apps/web`: React 19, Vite, TanStack Router and Query, shadcn/ui, Tailwind CSS
  4, and the Better Auth client.
- `apps/server`: NestJS using its current Express adapter, Better Auth, Prisma,
  Neon PostgreSQL, Zod, and Jest.
- `packages/contracts`: shared public API schemas and types.
- Workspace tooling: pnpm 9 and Turborepo.

ViteNest is a foundation, not a finished SaaS product. Current code includes
authentication, user management, shared contracts, and reusable frontend
infrastructure. Product domains such as organizations, billing, and tenancy are
left to the application built from this starter.

## Requirements

- Node.js 20.19 or newer in the 20.x line, or Node.js 22.12 or newer
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
pnpm --filter @vitenest/contracts check-types
pnpm --filter @vitenest/contracts build

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
