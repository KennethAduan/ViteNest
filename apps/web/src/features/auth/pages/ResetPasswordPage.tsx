import { Link, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthField } from '@/features/auth/components/AuthField'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

interface ResetPasswordPageProps {
    token?: string
}

const ResetPasswordPage = ({ token }: ResetPasswordPageProps) => {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    if (!token) {
        return (
            <AuthCard title="Invalid link" description="This reset link is missing its token.">
                <Link to="/forgot-password" className="text-sm underline">
                    Request a new link
                </Link>
            </AuthCard>
        )
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        const { error: resetError } = await authClient.resetPassword({
            newPassword: password,
            token,
        })
        setLoading(false)

        if (resetError) {
            setError(resetError.message ?? 'Unable to reset password.')
            return
        }

        void navigate({ to: '/sign-in' })
    }

    return (
        <AuthCard title="Reset password" description="Choose a new password.">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <AuthField
                    label="New password"
                    name="password"
                    isPassword
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <AuthField
                    label="Confirm password"
                    name="confirmPassword"
                    isPassword
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Resetting…' : 'Reset password'}
                </Button>
            </form>
        </AuthCard>
    )
}

export default ResetPasswordPage
