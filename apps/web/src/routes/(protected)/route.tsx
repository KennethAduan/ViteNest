import { createFileRoute, isRedirect, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/(protected)')({
    component: RouteComponent,
    beforeLoad: async ({ location }) => {
        try {
            const { data: session } = await authClient.getSession() // might throw on network error
            if (!session) {
                throw redirect({
                    to: '/sign-in',
                    search: { redirect: location.href },
                })
            }
            return { user: session.user }
        } catch (error) {
            // Re-throw redirects (they're intentional, not errors)
            if (isRedirect(error)) throw error

            // Auth check failed (network error, etc.) - redirect to login
            throw redirect({
                to: '/sign-in',
                search: { redirect: location.href },
            })
        }
    },
})

function RouteComponent() {
    return <div>
        <Outlet />
    </div>
}
