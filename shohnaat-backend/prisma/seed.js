const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. Create Roles ──
  const roleNames = ['super_admin', 'operator', 'merchant', 'rider'];
  const roles = {};
  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✓ Role: ${name}`);
  }

  // ── 2. Create Default Branch ──
  const branch = await prisma.branch.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      name: 'Headquarters Hub',
      code: 'HQ',
      isHub: true,
      address: '1200 Logistics Blvd',
      city: 'Austin',
      isActive: true,
    },
  });
  console.log(`  ✓ Branch: ${branch.name}`);

  // ── 3. Create Demo Users (matching login page ROLE_PRESETS) ──
  const demoUsers = [
    {
      email: 'admin@shohnaat.com',
      name: 'System Admin',
      phone: '+1-555-0100',
      role: 'super_admin',
      password: 'admin123',
    },
    {
      email: 'merchant@shohnaat.com',
      name: 'Demo Merchant',
      phone: '+1-555-0200',
      role: 'merchant',
      password: 'merchant123',
    },
    {
      email: 'rider@shohnaat.com',
      name: 'Demo Rider',
      phone: '+1-555-0300',
      role: 'rider',
      password: 'rider123',
    },
    {
      email: 'operator@shohnaat.com',
      name: 'Hub Operator',
      phone: '+1-555-0400',
      role: 'operator',
      password: 'operator123',
    },
  ];

  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: await bcrypt.hash(u.password, 12),
        status: 'ACTIVE',
        branchId: branch.id,
      },
    });

    // Assign role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: roles[u.role].id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: roles[u.role].id,
      },
    });

    // Create merchant profile for merchant user
    if (u.role === 'merchant') {
      await prisma.merchant.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          businessName: 'Demo Store LLC',
          businessType: 'E-Commerce',
          kycStatus: 'approved',
          isActive: true,
        },
      });
    }

    // Create rider profile for rider user
    if (u.role === 'rider') {
      await prisma.rider.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          vehicleType: 'van',
          isOnDuty: false,
        },
      });
    }

    console.log(`  ✓ User: ${u.email} (${u.role})`);
  }

  // ── 4. Create Default Zones ──
  const zoneNames = [
    'Downtown', 'North Side', 'South Side', 'East District', 'West District',
    'Metro Area', 'Suburban', 'Industrial',
  ];
  for (const name of zoneNames) {
    await prisma.zone.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true },
    });
  }
  console.log(`  ✓ Zones: ${zoneNames.length} created`);

  // ── 5. Create Default Rate Card ──
  const rateCard = await prisma.rateCard.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Standard Rate Card',
      isDefault: true,
    },
  });

  // Create sample rate rules
  const downtownZone = await prisma.zone.findUnique({ where: { name: 'Downtown' } });
  if (downtownZone) {
    const existingRules = await prisma.rateRule.findMany({
      where: { rateCardId: rateCard.id },
    });
    if (existingRules.length === 0) {
      await prisma.rateRule.createMany({
        data: [
          { rateCardId: rateCard.id, zoneId: downtownZone.id, serviceType: 'standard', baseCharge: 5.0, extraPerKg: 1.5 },
          { rateCardId: rateCard.id, zoneId: downtownZone.id, serviceType: 'express', baseCharge: 8.0, extraPerKg: 2.0 },
        ],
      });
    }
  }
  console.log(`  ✓ Rate card and rules created`);

  // ── Done ──
  console.log('\n✅ Seeding complete!');
  console.log('\n📋 Demo Credentials (all passwords: admin123):');
  console.log('  Superadmin : admin@shohnaat.com');
  console.log('  Merchant   : merchant@shohnaat.com');
  console.log('  Rider      : rider@shohnaat.com');
  console.log('  Operator   : operator@shohnaat.com');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
