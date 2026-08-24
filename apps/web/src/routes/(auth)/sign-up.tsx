import { createFileRoute } from '@tanstack/react-router'
import SignUpPage from '@/features/auth/pages/SignUpPage'

export const Route = createFileRoute('/(auth)/sign-up')({
    component: SignUpPage,
})
