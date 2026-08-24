import { z } from 'zod';

/** Matches the Better Auth user row (see apps/server/prisma/schema/user.prisma). */
export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  role: z.string().nullable(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  banExpires: z.iso.datetime().nullable(),
});

export type User = z.infer<typeof userSchema>;

export const usersListSchema = z.array(userSchema);

/** Admin-only user creation, backed by Better Auth's admin plugin `createUser`. */
export const createUserSchema = z.object({
  name: z.string().min(1, 'name required'),
  email: z.email('invalid email'),
  password: z.string().min(8, 'password must be at least 8 characters'),
  role: z.union([z.literal('user'), z.literal('admin')]).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
