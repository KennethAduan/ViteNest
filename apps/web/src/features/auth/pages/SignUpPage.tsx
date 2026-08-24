import { Link } from '@tanstack/react-router'
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

const signUpSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

const SignUpPage = () => {
    const [error, setError] = useState<string | null>(null)
    const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

    const form = useForm({
        defaultValues: { name: '', email: '', password: '' },
        validators: { onChange: signUpSchema },
        onSubmit: async ({ value }) => {
            setError(null)

            const { error: signUpError } = await authClient.signUp.email({
                name: value.name,
                email: value.email,
                password: value.password,
                callbackURL: `${env.VITE_APP_URL}/email-verified`,
            })

            if (signUpError) {
                setError(signUpError.message ?? 'Unable to create account.')
                return
            }

            setSubmittedEmail(value.email)
        },
    })

    if (submittedEmail) {
        return (
            <AuthCard title="Check your email" description="We sent a verification link.">
                <p className="text-sm text-muted-foreground">
                    Click the link we sent to <span className="font-medium">{submittedEmail}</span>{' '}
                    to verify your account, then sign in.
                </p>
                <Link to="/sign-in" className="text-sm underline">
                    Back to sign in
                </Link>
            </AuthCard>
        )
    }

    return (
        <AuthCard
            title="Create account"
            description="Get started with ViteNest."
            footer={
                <>
                    Already have an account?{' '}
                    <Link to="/sign-in" className="underline">
                        Sign in
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
                <form.Field name="name">
                    {(field) => (
                        <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                            <FieldContent>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    autoComplete="name"
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
                                    autoComplete="new-password"
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

                {error && <p className="text-sm text-destructive">{error}</p>}

                <form.Subscribe
                    selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
                >
                    {({ canSubmit, isSubmitting }) => (
                        <Button type="submit" disabled={!canSubmit}>
                            {isSubmitting ? 'Creating account…' : 'Create account'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>
        </AuthCard>
    )
}

export default SignUpPage
