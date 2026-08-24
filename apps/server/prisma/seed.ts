import 'dotenv/config';
import { auth } from '../src/lib/better-auth/auth';
import { prisma } from '../src/lib/prisma/db';

async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME ?? 'Super Admin';

  if (!email || !password) {
    console.log(
      'SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set, skipping super admin seed.',
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super admin ${email} already exists, skipping.`);
    return;
  }

  const { user } = await auth.api.createUser({
    body: { email, password, name, role: 'admin' },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });
  console.log(`Super admin ${email} created.`);
}

seedSuperAdmin()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
