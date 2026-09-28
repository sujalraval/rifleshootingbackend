import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@rifleshooting.com';
  // Never fall back to a well-known password: generate a random one if none is supplied
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
  }
  const name = process.env.ADMIN_NAME || 'Super Admin';
  const role = 'SuperAdmin';

  console.log(`Checking if user ${email} exists...`);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User ${email} already exists. Skipping creation.`);
    return;
  }

  console.log(`Creating user ${email}...`);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  });

  console.log(`✅ Super Admin created successfully!`);
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${user.role}`);
  console.log(`----------------------------------------`);
  console.log(`Make sure to change the password after logging in!`);
}

main()
  .catch((e) => {
    console.error('Error creating super admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
