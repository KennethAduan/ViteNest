# Web Auth Feature

Client-side auth screens for Contakt, backed end-to-end by **Better Auth**.
There is no custom session/JWT layer — Better Auth owns identity, sessions,
and the `User` row on both sides of the stack.

## How Better Auth is wired

### Server (`apps/server`)

- `apps/server/src/lib/better-auth/auth.ts` creates the single `betterAuth()`
  instance: Prisma adapter (`@better-auth/prisma-adapter`) against the app's
  own Postgres DB, email/password enabled with
  `requireEmailVerification: true`, and the `admin` plugin
  (`defaultRole: 'user'`, `adminRoles: ['admin']`).
- `AppModule` mounts it via `AuthModule.forRoot({ auth })` from
  `@thallesp/nestjs-better-auth`. This does two things:
  - Exposes Better Auth's own HTTP handlers under `/api/auth/*`
    (sign-in, sign-up, sign-out, verify-email, reset-password, session, …).
    Those responses intentionally bypass `TransformInterceptor` — they are
    Better Auth's wire format, not the app's success envelope.
  - Installs a **global guard**: every other server route requires a valid
    session by default. Opt out per-route with `@AllowAnonymous()`
    (see `app.controller.ts`), or read the caller's session with
    `@Session() session: UserSession` (see `user.controller.ts`). Restrict
    further with `@Roles(['admin'])` — this is how `UserController`'s
    admin-only endpoints work.
- `main.ts` disables Nest's body parser (`bodyParser: false`, "Better Auth
  needs raw body") and enables CORS with `credentials: true` against
  `FRONT_END_URL`. This must stay in sync with the web client's origin and
  `credentials: 'include'` behavior — Better Auth auth is cookie-based, not
  bearer-token.

### Database

- Prisma models `User`, `Session`, `Account`, `Verification`
  (`apps/server/prisma/schema/*.prisma`) are Better Auth's own tables, mapped
  via the Prisma adapter. `User` also carries the `admin` plugin's extra
  columns: `role`, `banned`, `banReason`, `banExpires`.
- There is **no separate app-side user/profile table** — `UserService` reads
  and writes the same `User` row Better Auth manages. Any future custom user
  field should go through Better Auth's `user.additionalFields` config, not a
  second table or an ad hoc write path (see AGENTS.md: "Use Better Auth APIs
  for Better Auth-owned identity operations").

### Client (`apps/web`)

- `apps/web/src/lib/auth-client.ts` creates the client with
  `createAuthClient()` from `better-auth/react` (`baseURL: env.VITE_API_URL`,
  `adminClient()` plugin) and re-exports `useSession`, `signIn`, `signUp`,
  `signOut`, `requestPasswordReset`, `resetPassword`.
- `useSession()` is a reactive hook (nanostore-backed) — it is the single
  source of truth for "who is signed in" on the client. **No React Context
  wrapper is needed or should be added**; wrapping it in another Provider
  would just duplicate Better Auth's own store.
- For non-reactive, one-shot checks (e.g. inside a router `beforeLoad`, which
  runs outside React), call `authClient.getSession()` directly — it returns a
  promise, unlike the hook.

## Structure

```
features/auth/
  components/
    AuthCard.tsx    shared card shell (title/description/footer)
    AuthField.tsx   label + input wrapper (legacy, see Forms below)
  pages/
    SignInPage.tsx
    SignUpPage.tsx
    ForgotPasswordPage.tsx
    ResetPasswordPage.tsx
    EmailVerifiedPage.tsx
  docs/
    WEB.AUTH.md
```

Routes under `apps/web/src/routes/(auth)/` are thin wrappers: they own
`createFileRoute`, `validateSearch`, and any router-only concerns (e.g.
`reset-password.tsx` extracts the `token` search param and passes it down),
then render the matching page component. Pages hold all form state, handlers,
and Better Auth calls, and take no route-coupled props except what a route
explicitly passes (e.g. `token`).

`(auth)` is a route-group folder — cosmetic only, no URL segment.

## Auth flows

- **Sign up** — `SignUpPage` calls `authClient.signUp.email({ name, email,
  password, callbackURL: '{APP_URL}/email-verified' })`. Because
  `requireEmailVerification: true` server-side, the account exists but can't
  sign in until the verification link (sent via `sendVerificationEmail` in
  `auth.ts`) is clicked; the page shows a "check your email" state instead of
  navigating away.
- **Sign in** — `SignInPage` calls `authClient.signIn.email({ email,
  password })`. On `EMAIL_NOT_VERIFIED`, it offers a resend
  (`authClient.sendVerificationEmail`) instead of just failing.
  `autoSignInAfterVerification: true` server-side means clicking the
  verification link itself completes sign-in — `EmailVerifiedPage` is a
  landing page, not a trigger.
- **Forgot / reset password** — `ForgotPasswordPage` calls
  `authClient.requestPasswordReset({ email, redirectTo:
  '{APP_URL}/reset-password' })`; `auth.ts`'s `sendResetPassword` emails the
  link. `ResetPasswordPage` reads the `token` search param (validated by the
  route, not the page) and calls `authClient.resetPassword({ newPassword,
  token })`.
- **Sign out** — plain `authClient.signOut()` (see `routes/index.tsx`).
- **Route protection** — `routes/(protected)/route.tsx` guards its whole
  subtree in `beforeLoad`:

  ```tsx
  beforeLoad: async ({ location }) => {
      const { data: session } = await authClient.getSession()
      if (!session) {
          throw redirect({ to: '/sign-in', search: { redirect: location.href } })
      }
      return { user: session.user }
  },
  ```

  This runs before render (no flash of protected content) and is the pattern
  to copy for any new protected route group. Note: `SignInPage` does not yet
  read the `redirect` search param back — it always navigates to `/` after
  sign-in, so a user bounced from a deep link currently lands on the home
  page instead of back where they were headed.

## Forms

`SignInPage` and `SignUpPage` use `@tanstack/react-form` (`useForm`) with a
single Zod schema passed as `validators.onChange`, and render fields with the
shadcn `Field`/`FieldLabel`/`FieldContent`/`FieldError` primitives
(`@/components/ui/field.tsx`) instead of `AuthField`:

```tsx
const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: schema },
    onSubmit: async ({ value }) => { /* authClient call */ },
})

<form.Field name="email">
    {(field) => (
        <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <FieldContent>
                <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.isTouched && <FieldError errors={field.state.meta.errors} />}
            </FieldContent>
        </Field>
    )}
</form.Field>
```

Submit button gates on `form.Subscribe` selecting `canSubmit`/`isSubmitting`.
Errors surface via Zod issues on `field.state.meta.errors`, shown only once a
field is touched.

`ForgotPasswordPage` and `ResetPasswordPage` still use plain `useState` +
`AuthField` — not yet migrated to this pattern.

## Known gaps

- `AuthField` should be removed once `ForgotPasswordPage` and
  `ResetPasswordPage` move to `useForm` + `Field` primitives.
- `routes/(auth)/_layout.tsx` is not wired as a parent of the other `(auth)`
  routes (it has no path and no children in the generated route tree, and its
  component doesn't render an `Outlet`). It currently does nothing. Compare
  with `routes/(protected)/route.tsx`, which correctly parents its siblings —
  a `route.tsx` file inside a `(group)` folder is the working convention for
  a pathless group layout in this TanStack Router setup; renaming
  `_layout.tsx` to `route.tsx` (and adding `<Outlet />`) would fix it with no
  file moves needed.
- `SignInPage` ignores the `redirect` search param set by the `(protected)`
  guard — post sign-in it always sends the user to `/`.
