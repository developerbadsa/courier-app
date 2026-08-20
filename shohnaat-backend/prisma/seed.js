const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create roles
  const roles = ['super_admin', 'operator', 'merchant', 'rider'];
  
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName }
    });
    console.log(`  ✓ Role: ${roleName}`);
  }

  // Create default branch
  const branch = await prisma.branch.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      name: 'Headquarters',
      code: 'HQ',
      isHub: true,
      address: '123 Logistics Avenue',
      city: 'Dhaka',
      isActive: true
    }
  });
  console.log(`  ✓ Branch: ${branch.name}`);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin#2026!Global', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@shohnaat.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@shohnaat.com',
      phone: '+8801700000000',
      passwordHash: adminPassword,
      status: 'ACTIVE',
      branchId: branch.id
    }
  });

  // Assign super_admin role to admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: (await prisma.role.findUnique({ where: { name: 'super_admin' } })).id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: (await prisma.role.findUnique({ where: { name: 'super_admin' } })).id
    }
  });
  console.log(`  ✓ Admin user: ${adminUser.email}`);

  // Create default zones
  const zones = ['Dhaka Metro', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];
  
  for (const zoneName of zones) {
    await prisma.zone.upsert({
      where: { name: zoneName },
      update: {},
      create: { name: zoneName, isActive: true }
    });
  }
  console.log(`  ✓ Zones: ${zones.length} created`);

  // Create default rate card
  const rateCard = await prisma.rateCard.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Standard Rate Card',
      isDefault: true
    }
  });

  // Create sample rate rules
  const dhakaZone = await prisma.zone.findUnique({ where: { name: 'Dhaka Metro' } });
  
  await prisma.rateRule.create({
    data: {
      rateCardId: rateCard.id,
      zoneId: dhakaZone.id,
      serviceType: 'standard',
      baseCharge: 5.00,
      extraPerKg: 1.50
    }
  });

  await prisma.rateRule.create({
    data: {
      rateCardId: rateCard.id,
      zoneId: dhakaZone.id,
      serviceType: 'express',
      baseCharge: 8.00,
      extraPerKg: 2.00
    }
  });

  console.log(`  ✓ Rate card and rules created`);

  console.log('\n✅ Seeding complete!');
  console.log('\n📋 Default credentials:');
  console.log('  Admin: admin@shohnaat.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
