import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins/admin';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { prisma } from '../prisma/db';
import { sendEmail } from '../email/mail';
import {
  resetPasswordTemplate,
  verifyEmailTemplate,
} from '../email/email-templates';

export const auth = betterAuth({
  appName: 'Contakt',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        recipients: [user.email],
        subject: 'Reset your Contakt password',
        htmlContent: resetPasswordTemplate(url),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        recipients: [user.email],
        subject: 'Verify your Contakt email',
        htmlContent: verifyEmailTemplate(url),
      });
    },
  },
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
  ],
  trustedOrigins: [process.env.FRONT_END_URL!].filter(Boolean),
  advanced: {
    database: {
      joins: true,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
