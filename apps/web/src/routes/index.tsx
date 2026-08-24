import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { API } from '@/lib/axios'
import API_ROUTE from '@/constants/API_ROUTE'
import { useState } from 'react'
import type { User } from '@contakt/contracts'
import { authClient, useSession } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const [users, setUsers] = useState<User[]>([])
    const { data: session, isPending } = useSession()
    const navigate = useNavigate()

    const handleClick = async () => {
        const res = await API.get(API_ROUTE.USER)
        setUsers(res.data.data)
    }

    const handleSignOut = async () => {
        await authClient.signOut()
        void navigate({ to: '/sign-in' })
    }

    return (
        <div className="flex min-h-svh p-6">
            <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
                <div>
                    <h1 className="font-medium">Project ready!</h1>
                    <p>You may now add components and start building.</p>
                    <p>We&apos;ve already added the button component for you.</p>
                    <Button className="mt-2" onClick={handleClick}>Button</Button>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                    (Press <kbd>d</kbd> to toggle dark mode)
                </div>
                {!isPending && (
                    <div className="flex items-center gap-2">
                        {session ? (
                            <>
                                <span>
                                    Signed in as {session.user.email}
                                    {session.user.role === 'admin' && ' (admin)'}
                                </span>
                                <Button size="sm" variant="outline" onClick={handleSignOut}>
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <Link to="/sign-in" className="underline">
                                Sign in
                            </Link>
                        )}
                    </div>
                )}
                <div>
                    {users.map((user) => (
                        <div key={user.id}>{user.name}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}