import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
export const Route = createFileRoute('/(protected)/account')({
    component: RouteComponent,
})

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

function getInitials(name?: string | null, email?: string | null) {
    if (name) {
        return name
            .split(' ')
            .map((n) => n[0]?.toUpperCase())
            .join('')
    }
    if (email) {
        return email[0]?.toUpperCase()
    }
    return '?'
}

function RouteComponent() {
    const { data: session } = useSession()
    const user = session?.user

    if (!user) {
        return null
    }

    return (
        <div className="flex justify-center py-10 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-col items-center">
                    <Avatar className="mb-2 h-16 w-16">
                        <AvatarFallback>
                            {getInitials(user.name, user.email)}
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-center">
                        {user.name || 'Account'}
                    </CardTitle>
                    <div className="text-muted-foreground text-sm">{user.email}</div>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-2 mt-4">
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase mb-0.5">User ID</div>
                        <div className="text-sm font-mono break-words">{user.id}</div>
                    </div>
                    {/* Add more user details here as desired */}
                </CardContent>
            </Card>
        </div>
    )
}
