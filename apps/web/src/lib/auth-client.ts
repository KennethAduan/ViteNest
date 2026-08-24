import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { env } from '@/config/env'

export const authClient = createAuthClient({
    baseURL: env.VITE_API_URL,
    plugins: [adminClient()],
})

export const {
    useSession,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    resetPassword,
} = authClient
