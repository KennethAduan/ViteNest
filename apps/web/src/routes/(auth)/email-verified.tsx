import { createFileRoute } from '@tanstack/react-router'
import EmailVerifiedPage from '@/features/auth/pages/EmailVerifiedPage'

export const Route = createFileRoute('/(auth)/email-verified')({
    component: EmailVerifiedPage,
})
