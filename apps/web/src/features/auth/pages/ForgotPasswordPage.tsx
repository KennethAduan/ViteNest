import { Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthField } from '@/features/auth/components/AuthField'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { env } from '@/config/env'

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setLoading(true)

        const { error: forgotError } = await authClient.requestPasswordReset({
            email,
            redirectTo: `${env.VITE_APP_URL}/reset-password`,
        })

        setLoading(false)
        if (forgotError) {
            setError(forgotError.message ?? 'Unable to send reset email.')
            return
        }

        setSent(true)
    }

    if (sent) {
        return (
            <AuthCard title="Check your email" description="We sent a password reset link.">
                <p className="text-sm text-muted-foreground">
                    Click the link we sent to <span className="font-medium">{email}</span> to
                    reset your password.
                </p>
                <Link to="/sign-in" className="text-sm underline">
                    Back to sign in
                </Link>
            </AuthCard>
        )
    }

    return (
        <AuthCard
            title="Forgot password"
            description="We'll email you a reset link."
            footer={
                <Link to="/sign-in" className="underline">
                    Back to sign in
                </Link>
            }
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <AuthField
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send reset link'}
                </Button>
            </form>
        </AuthCard>
    )
}

export default ForgotPasswordPage
