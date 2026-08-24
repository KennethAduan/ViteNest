import AppProviders from '@/providers/AppProviders'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster as SileoToaster } from "sileo"

const RootLayout = () => (
    <AppProviders>
        <Outlet />
        <SileoToaster
            position="top-center"
            options={{
                fill: "var(--sileo-toast-bg)",
                roundness: 12,
                styles: {
                    title: "text-(--sileo-toast-fg)!",
                    description: "text-(--sileo-toast-fg)/80! text-center!",
                },
            }}
        />
    </AppProviders>
)

export const Route = createRootRoute({ component: RootLayout })