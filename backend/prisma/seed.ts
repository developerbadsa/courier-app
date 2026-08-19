import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Roles
  const roles = [
    { name: 'super_admin', description: 'Full system control & root operations' },
    { name: 'operator', description: 'Branch/warehouse operations & dispatch manager' },
    { name: 'rider', description: 'Delivery agent/field rider' },
    { name: 'merchant', description: 'E-commerce business/client' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles seeded (super_admin, operator, rider, merchant)');

  // 2. Seed Default Branch (Main Hub)
  const defaultBranch = await prisma.branch.upsert({
    where: { code: 'HUB-01' },
    update: {},
    create: {
      name: 'Central Logistics Hub',
      code: 'HUB-01',
      isHub: true,
      address: '742 Evergreen Terrace',
      city: 'Capital City',
      isActive: true,
    },
  });
  console.log('✅ Default Hub Branch created:', defaultBranch.name);

  // 3. Seed Default Admin User
  const adminEmail = 'admin@shohnaat.com';
  const adminPhone = '+10000000001';
  const passwordHash = await bcrypt.hash('Admin@Shohnaat2026!', 10);

  const adminRole = await prisma.role.findUnique({
    where: { name: 'super_admin' },
  });

  if (adminRole) {
    const adminUser = await prisma.user.upsert({
      where: { phone: adminPhone },
      update: {},
      create: {
        name: 'System Super Admin',
        email: adminEmail,
        phone: adminPhone,
        passwordHash,
        status: 'ACTIVE',
        branchId: defaultBranch.id,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });
    console.log('✅ Default Admin User created:', adminUser.email);
  }

  // 4. Seed Default Rate Card
  const defaultRateCard = await prisma.rateCard.upsert({
    where: { id: 'default-rate-card' },
    update: {},
    create: {
      id: 'default-rate-card',
      name: 'Standard International USD Rate Card',
      isDefault: true,
    },
  });
  console.log('✅ Default Rate Card created:', defaultRateCard.name);

  console.log('🎉 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
