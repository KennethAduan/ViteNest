# API Mutation Guide

Use `defineApiMutation` and `useApiMutation` for typed writes from the Vite web app to the NestJS API. This is the web application's equivalent of the clean action-definition pattern used by `next-safe-action`, adapted to an SPA with a separate backend.

Source: [`use-api-mutation.ts`](./use-api-mutation.ts)

## Responsibility Boundaries

```text
TanStack Form
    -> useApiMutation
    -> configured Axios client
    -> NestJS controller
    -> service
    -> Prisma
```

Each layer has one job:

- TanStack Form owns field state and form validation feedback.
- Shared Zod schemas define the request contract.
- `defineApiMutation` describes one reusable server write.
- `useApiMutation` owns pending, success, error, and cache invalidation state.
- `API` sends cookie-authenticated HTTP requests.
- NestJS repeats input validation and enforces authentication, permissions, tenant ownership, and business rules.
- Services own business logic and Prisma writes.

Client validation improves UX. It is not a security boundary. Never remove server validation or authorization because a mutation uses a shared schema.

## When to Use It

Use an API mutation for operations that change server state:

- create, update, or delete records
- submit approval or workflow decisions
- assign assets or employees
- start payroll, inventory, payment, or reporting jobs
- upload or finalize files
- other form submissions sent to NestJS

Do not use it for:

- reads; use `useQuery` or route loaders
- local UI state; use component state or Jotai
- Better Auth client operations such as `authClient.signIn.email()` or `authClient.signUp.email()`
- authorization checks in the browser

Better Auth already provides its own typed client, request lifecycle, cookies, and error response. Keep those flows on `authClient` unless a concrete product requirement needs another layer.

## 1. Define a Mutation

Keep definitions inside their owning feature. Recommended location:

```text
apps/web/src/features/<domain>/api/<operation>.mutation.ts
```

Example using the current admin user-creation endpoint:

```ts
import {
  apiSuccessSchema,
  createUserSchema,
  userSchema,
} from "@vitenest/contracts"
import { API } from "@/lib/axios"
import { defineApiMutation } from "@/hooks/use-api-mutation"

const createUserResponseSchema = apiSuccessSchema(userSchema)

export const createUserMutation = defineApiMutation({
  actionName: "createUser",
  inputSchema: createUserSchema,
  mutationKey: ["users", "create"],
  mutationFn: async (parsedInput) => {
    const response = await API.post("/user", parsedInput)
    return createUserResponseSchema.parse(response.data).data
  },
  invalidateQueries: [{ queryKey: ["users"] }],
})
```

`parsedInput` is inferred from `createUserSchema`. Invalid input throws a `ZodError` before the request is sent. The NestJS endpoint must still validate the same input.

If `mutationKey` is omitted, the hook uses:

```ts
["api", actionName]
```

`actionName` is also stored in TanStack Query mutation metadata for debugging and observability.

## 2. Use It in a Form

```tsx
import { useForm } from "@tanstack/react-form"
import { createUserSchema } from "@vitenest/contracts"
import { useApiMutation } from "@/hooks/use-api-mutation"
import { createUserMutation } from "../api/create-user.mutation"

export function CreateUserForm() {
  const {
    mutateAsync: createUser,
    isPending,
    error,
  } = useApiMutation(createUserMutation, {
    onSuccess: () => {
      // Show success feedback or close the form here.
    },
    onError: (mutationError) => {
      // Show a toast or map a known API error to a form field.
      console.error(mutationError)
    },
  })

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user" as const,
    },
    validators: { onChange: createUserSchema },
    onSubmit: async ({ value, formApi }) => {
      await createUser(value)
      formApi.reset()
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      {/* Render form.Field controls here. */}

      {error && <p role="alert">{error.message}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create user"}
      </button>
    </form>
  )
}
```

Use `mutate` for callback-driven execution. Use `mutateAsync` when the form must await completion before resetting, navigating, or continuing another operation.

## Cache Invalidation

Static invalidation:

```ts
invalidateQueries: [
  { queryKey: ["employees"] },
  { queryKey: ["dashboard", "summary"] },
]
```

Dynamic invalidation can use returned data and submitted variables:

```ts
invalidateQueries: (employee, input) => [
  { queryKey: ["employees"] },
  { queryKey: ["employees", employee.id] },
  { queryKey: ["companies", input.companyId, "employees"] },
]
```

The hook awaits every configured invalidation before running the component-level `onSuccess`. This keeps the mutation pending until active dependent queries are synchronized.

Prefer hierarchical query keys so prefix invalidation remains predictable:

```ts
["employees"]
["employees", employeeId]
["employees", { status, page }]
```

## Errors

Mutation functions must reject or throw when the operation fails. Do not return a failed result as successful data:

```ts
// Avoid: TanStack Query treats this as success.
return { success: false, message: "Unable to create employee" }
```

Axios already rejects non-2xx responses. NestJS should use appropriate HTTP exceptions for expected failures. TanStack Query then exposes the failure through `error`, `isError`, and `onError`.

Use client Zod errors for field feedback. Use API errors for server-only rules such as duplicate records, stale versions, permissions, or invalid workflow state. Do not expose stack traces, SQL details, secrets, or internal exception data to the browser.

## Advanced Lifecycle Options

The second argument accepts normal TanStack Query mutation options except `mutationFn`, `mutationKey`, and `meta`, which belong to the reusable definition:

```ts
const mutation = useApiMutation(updateEmployeeMutation, {
  retry: false,
  scope: { id: "employee-update" },
  onMutate: async (input) => {
    // Cancel related queries and snapshot cached data for optimistic updates.
    return { previousEmployee }
  },
  onError: (_error, _input, context) => {
    // Roll back with context?.previousEmployee.
  },
  onSettled: () => {
    // Optional cleanup that runs after success or failure.
  },
})
```

For optimistic updates, cancel matching queries before changing cached data and restore the snapshot in `onError`. Configured invalidation still runs after a successful mutation.

## Server-Side Equivalent

Do not recreate `authActionClient` in the browser. NestJS already provides the server-side equivalents:

```ts
@Post()
@Roles(["admin"])
create(
  @Body(new ZodValidationPipe(createUserSchema)) body: CreateUserDto,
) {
  return this.userService.create(body)
}
```

Mapping from the Next.js action pattern:

| Next.js action concern | ViteNest equivalent                                          |
| ---------------------- | ------------------------------------------------------------ |
| `inputSchema`          | Shared Zod schema plus `ZodValidationPipe`                   |
| auth action middleware | Better Auth session and NestJS guards/decorators             |
| action metadata        | TanStack Query `meta.actionName` plus server request logging |
| server action body     | NestJS controller plus service                               |
| action error handler   | NestJS exceptions and exception filters                      |
| `useAction` lifecycle  | `useApiMutation` lifecycle                                   |
| revalidation           | TanStack Query invalidation                                  |

Route visibility, disabled buttons, and client schemas are UX controls only. Every protected tenant operation must verify session, permission, membership, and tenant ownership on the server.

## Checklist

Before adding a mutation:

- Reuse or add a public Zod schema in `@vitenest/contracts`.
- Keep the definition inside the owning feature.
- Use the shared `API` client; do not create another Axios instance.
- Parse the standard API success envelope when consuming normal NestJS endpoints.
- Choose a stable `actionName` and hierarchical mutation/query keys.
- Invalidate every query made stale by the write.
- Await `mutateAsync` from forms when later steps depend on success.
- Render pending and error states.
- Validate input and enforce authorization again in NestJS.
- Use a transaction for multi-step financial, payroll, loyalty, inventory, payment, loan, or asset-assignment writes.
- Never log passwords, tokens, full form payloads, or sensitive personal data.
