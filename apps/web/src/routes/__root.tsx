import AppProviders from '@/providers/AppProviders'
import { createRootRoute, Outlet } from '@tanstack/react-router'

const RootLayout = () => (
    <AppProviders>
        <Outlet />
    </AppProviders>
)

export const Route = createRootRoute({ component: RootLayout })