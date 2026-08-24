import { z } from 'zod'

const envSchema = z.object({
    VITE_APP_URL: z.url(),
    VITE_API_URL: z.url(),
    VITE_ENCRYPTION_KEY: z.string(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
    console.error(z.treeifyError(parsed.error))
    throw new Error('Invalid environment variables')
}

export const env = parsed.data
