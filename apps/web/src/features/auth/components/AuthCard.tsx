import type { ReactNode } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

type AuthCardProps = {
    title: string
    description?: string
    children: ReactNode
    footer?: ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
    return (
        <div className="flex min-h-svh items-center justify-center p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {children}
                    {footer && <div className="text-sm text-muted-foreground">{footer}</div>}
                </CardContent>
            </Card>
        </div>
    )
}
