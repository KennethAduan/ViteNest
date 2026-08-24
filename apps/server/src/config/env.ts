import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL required'),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
  FRONT_END_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET min 32 chars'),
  BETTER_AUTH_URL: z.url(),
  ELASTIC_MAIL_DOMAIN: z.string().min(1, 'ELASTIC_MAIL_DOMAIN required'),
  ELASTIC_MAIL_API_KEY: z.string().min(1, 'ELASTIC_MAIL_API_KEY required'),
  ELASTIC_MAIL_API_URL: z.url(),
  SUPER_ADMIN_NAME: z.string().min(1).default('Super Admin'),
  SUPER_ADMIN_EMAIL: z.union([z.email(), z.literal('')]).optional(),
  SUPER_ADMIN_PASSWORD: z.union([z.string().min(8), z.literal('')]).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error(z.treeifyError(parsed.error));
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

/** Validated env for modules outside Nest's DI graph (e.g. lib/auth.ts, lib/mail.ts). */
export const env = validateEnv(process.env);
