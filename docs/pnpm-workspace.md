# pnpm workspace guidelines

This repo is a **pnpm monorepo** (Turborepo). Treat apps and packages as workspace members, not as separate projects.

## Rules

1. Run install and add/remove commands from the **repo root**.
2. Keep **one** lockfile: `pnpm-lock.yaml` at the root.
3. Do **not** create or keep a lockfile inside `apps/`* or `packages/*`.
4. Do **not** add a nested `pnpm-workspace.yaml` inside an app or package.
5. Ignore `.pnpm-store/` if it appears locally. Do not commit it.

## Why

The root `pnpm-workspace.yaml` lists workspace members:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

When you install from the root, pnpm:

- updates the shared root lockfile
- links packages across apps
- reuses one content store

When you install inside `apps/web`, pnpm can treat that folder as its own project. That often creates a second lockfile and breaks the monorepo model.

You *can* run `pnpm` inside an app. Prefer not to.

## Commands

Replace `web` with the package `name` from that package’s `package.json`.

### Install all dependencies

```sh
pnpm install
```



### Add a dependency to one app

```sh
pnpm add <package> --filter web
pnpm add -D <package> --filter web
```



### Remove a dependency from one app

```sh
pnpm remove <package> --filter web
```



### Run a script for one app

```sh
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
```



### Run a script for all packages (via Turbo)

```sh
pnpm dev
pnpm build
pnpm lint
```

## CLI tools (shadcn and similar)

`--filter` only targets **pnpm** actions (`add`, `remove`, `run`, `install`).

Tools run with `pnpm dlx` (for example shadcn) are separate CLIs. They write files into a project folder. Point them at an app with **`--cwd`**, not `--filter`.

```sh
# init
pnpm dlx shadcn@latest init --preset b0 --template vite --pointer --cwd apps/web

# add a component
pnpm dlx shadcn@latest add tooltip --cwd apps/web

# apply a preset to an existing app
pnpm dlx shadcn@latest apply b0 --cwd apps/web
```

| Goal | Use |
| --- | --- |
| Add an npm package to web | `pnpm add <pkg> --filter web` |
| Run a web script | `pnpm --filter web dev` |
| Run shadcn against web | `pnpm dlx shadcn@latest … --cwd apps/web` |

After a shadcn command, if it creates `apps/web/pnpm-lock.yaml` or `apps/web/pnpm-workspace.yaml`, delete those files. Then run `pnpm install` from the repo root.

## Do / don’t


| Do                                       | Don’t                                           |
| ---------------------------------------- | ----------------------------------------------- |
| `pnpm add lodash --filter web` from root | `cd apps/web && pnpm add lodash` as the default |
| Keep one root `pnpm-lock.yaml`           | Commit `apps/web/pnpm-lock.yaml`                |
| Use `--filter <name>` for pnpm actions   | Nest another `pnpm-workspace.yaml` under an app |
| Use `--cwd apps/web` for shadcn / dlx    | Rely on `--filter` for shadcn file writes       |
| Delete stray `.pnpm-store/`              | Commit `.pnpm-store/`                           |


## Package names

Filters use the `"name"` field in each `package.json`, not the folder name.


| Folder        | Typical filter                             |
| ------------- | ------------------------------------------ |
| `apps/web`    | `--filter web`                             |
| `packages/ui` | `--filter @repo/ui` (check `package.json`) |


Confirm with:

```sh
pnpm m ls
```

