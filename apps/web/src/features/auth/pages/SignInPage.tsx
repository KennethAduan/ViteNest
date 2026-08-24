import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { z } from 'zod'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import PasswordInput from '@/components/PasswordInput'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { env } from '@/config/env'

const signInSchema = z.object({
    email: z.email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
})

const SignInPage = () => {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [needsVerification, setNeedsVerification] = useState(false)
    const [resent, setResent] = useState(false)

    const form = useForm({
        defaultValues: { email: '', password: '' },
        validators: { onChange: signInSchema },
        onSubmit: async ({ value }) => {
            setError(null)
            setNeedsVerification(false)
            setResent(false)

            const { error: signInError } = await authClient.signIn.email({
                email: value.email,
                password: value.password,
            })

            if (signInError) {
                setError(signInError.message ?? 'Unable to sign in.')
                if (signInError.code === 'EMAIL_NOT_VERIFIED') {
                    setNeedsVerification(true)
                }
                return
            }

            void navigate({ to: '/account' })
        },
    })

    const handleResend = async () => {
        await authClient.sendVerificationEmail({
            email: form.getFieldValue('email'),
            callbackURL: `${env.VITE_APP_URL}/email-verified`,
        })
        setResent(true)
    }

    return (
        <AuthCard
            title="Sign in"
            description="Welcome back to Contakt."
            footer={
                <>
                    No account?{' '}
                    <Link to="/sign-up" className="underline">
                        Sign up
                    </Link>
                </>
            }
        >
            <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    void form.handleSubmit()
                }}
            >
                <form.Field name="email">
                    {(field) => (
                        <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                            <FieldContent>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="email"
                                    autoComplete="email"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.isTouched && (
                                    <FieldError errors={field.state.meta.errors} />
                                )}
                            </FieldContent>
                        </Field>
                    )}
                </form.Field>

                <form.Field name="password">
                    {(field) => (
                        <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    id={field.name}
                                    name={field.name}
                                    autoComplete="current-password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.isTouched && (
                                    <FieldError errors={field.state.meta.errors} />
                                )}
                            </FieldContent>
                        </Field>
                    )}
                </form.Field>

                <div className="flex justify-end text-sm">
                    <Link to="/forgot-password" className="text-muted-foreground underline">
                        Forgot password?
                    </Link>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                {needsVerification && (
                    <Button type="button" variant="outline" onClick={handleResend} disabled={resent}>
                        {resent ? 'Verification email sent' : 'Resend verification email'}
                    </Button>
                )}

                <form.Subscribe
                    selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
                >
                    {({ canSubmit, isSubmitting }) => (
                        <Button type="submit" disabled={!canSubmit}>
                            {isSubmitting ? 'Signing in…' : 'Sign in'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>
        </AuthCard>
    )
}

export default SignInPage
