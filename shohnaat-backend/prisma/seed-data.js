const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

const randomTracking = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SH-${ts}${rand}`;
};

const randomPhone = () => `+1-555-${String(Math.floor(1000 + Math.random() * 9000))}-${String(Math.floor(1000 + Math.random() * 9000))}`;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const NAMES = [
  'Alexander Wright', 'Sophia Martinez', 'James Wilson', 'Emily Thornton',
  'Liam Davis', 'Olivia Brown', 'Noah Garcia', 'Ava Rodriguez',
  'William Johnson', 'Isabella Anderson', 'Benjamin Taylor', 'Mia Thomas',
  'Lucas Moore', 'Charlotte Jackson', 'Henry White', 'Amelia Harris',
  'Ethan Martin', 'Harper Clark', 'Mason Lewis', 'Evelyn Walker',
];

const BUSINESS_NAMES = [
  'Apex Global Trading', 'Pacific Electronics Hub', 'Metro Fashion Outlet',
  'Sunrise Health Store', 'TechNova Gadgets', 'GreenLeaf Organics',
  'Urban Style Co.', 'QuickShip Supplies', 'Golden Eagle Imports',
  'BlueWave Accessories', 'Pinnacle Sports Gear', 'FreshBite Foods',
];

const ADDRESSES = [
  '1200 Logistics Blvd, Dock #3, Austin, TX 78704',
  '4502 Elm Street, Suite 4B, Miami, FL 33101',
  '789 Commerce Ave, Building C, Seattle, WA 98101',
  '321 Market Street, Floor 5, San Francisco, CA 94105',
  '555 Industrial Park, Unit 12, Chicago, IL 60601',
  '888 Sunset Boulevard, Los Angeles, CA 90028',
  '234 Oak Lane, Dallas, TX 75201',
  '667 Pine Road, Denver, CO 80202',
  '999 Harbor Drive, Portland, OR 97201',
  '111 River Walk, Nashville, TN 37201',
  '432 Beach Road, San Diego, CA 92101',
  '765 Valley View, Phoenix, AZ 85001',
  '210 Park Avenue, Atlanta, GA 30303',
  '88 Main Street, Boston, MA 02101',
  '543 Lake Shore, Minneapolis, MN 55401',
];

const CITIES = ['Austin', 'Miami', 'Seattle', 'San Francisco', 'Chicago', 'Los Angeles', 'Dallas', 'Denver', 'Portland', 'Nashville'];

async function main() {
  console.log('🌱 Seeding realistic demo data...\n');

  // ── 1. Ensure Roles & Users exist ──
  const roles = {};
  for (const name of ['super_admin', 'operator', 'merchant', 'rider']) {
    roles[name] = await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }

  const branch = await prisma.branch.upsert({
    where: { code: 'HQ' },
    update: {},
    create: { name: 'Headquarters Hub', code: 'HQ', isHub: true, address: '1200 Logistics Blvd', city: 'Austin', isActive: true },
  });

  const branch2 = await prisma.branch.upsert({
    where: { code: 'MIA' },
    update: {},
    create: { name: 'Miami Distribution Center', code: 'MIA', isHub: true, address: '4502 Elm Street', city: 'Miami', isActive: true },
  });

  const password = await bcrypt.hash('admin123', 12);

  // ── 2. Create Merchants ──
  const merchantUsers = [];
  for (let i = 0; i < BUSINESS_NAMES.length; i++) {
    const email = `merchant${i + 1}@shohnaat.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: BUSINESS_NAMES[i],
        email,
        phone: randomPhone(),
        passwordHash: password,
        status: 'ACTIVE',
        branchId: branch.id,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roles.merchant.id } },
      update: {},
      create: { userId: user.id, roleId: roles.merchant.id },
    });

    const merchant = await prisma.merchant.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: BUSINESS_NAMES[i],
        businessType: pick(['E-Commerce', 'Fashion', 'Electronics', 'Health', 'Food', 'Sports']),
        kycStatus: 'approved',
        isActive: true,
      },
    });

    merchantUsers.push({ user, merchant });
    console.log(`  ✓ Merchant: ${BUSINESS_NAMES[i]}`);
  }

  // ── 3. Create Zones ──
  const zoneNames = ['Downtown', 'North Side', 'South Side', 'East District', 'West District', 'Metro Area', 'Suburban', 'Industrial'];
  const zones = [];
  for (const name of zoneNames) {
    const z = await prisma.zone.upsert({ where: { name }, update: {}, create: { name, isActive: true } });
    zones.push(z);
  }
  console.log(`  ✓ Zones: ${zones.length}`);

  // ── 4. Create Addresses for each merchant ──
  const merchantAddresses = [];
  for (const { merchant } of merchantUsers) {
    const addr = await prisma.address.create({
      data: {
        merchantId: merchant.id,
        type: 'PICKUP',
        label: 'Main Warehouse',
        line1: pick(ADDRESSES),
        city: pick(CITIES),
        zoneId: pick(zones).id,
        isDefault: true,
      },
    });
    merchantAddresses.push(addr);
  }
  console.log(`  ✓ Addresses: ${merchantAddresses.length}`);

  // ── 5. Create Riders ──
  const riderUsers = [];
  const riderNames = ['David Miller', 'Sarah Chen', 'Mike Thompson', 'Lisa Park', 'Carlos Rodriguez'];
  for (let i = 0; i < riderNames.length; i++) {
    const user = await prisma.user.upsert({
      where: { email: `rider${i + 1}@shohnaat.com` },
      update: {},
      create: {
        name: riderNames[i],
        email: `rider${i + 1}@shohnaat.com`,
        phone: randomPhone(),
        passwordHash: password,
        status: 'ACTIVE',
        branchId: pick([branch.id, branch2.id]),
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roles.rider.id } },
      update: {},
      create: { userId: user.id, roleId: roles.rider.id },
    });

    const rider = await prisma.rider.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        vehicleType: pick(['bike', 'van', 'truck']),
        isOnDuty: i < 3,
      },
    });

    riderUsers.push(rider);
    console.log(`  ✓ Rider: ${riderNames[i]}`);
  }

  // ── 6. Create Consignees ──
  const consignees = [];
  for (let i = 0; i < 20; i++) {
    const c = await prisma.consignee.create({
      data: {
        name: pick(NAMES),
        phone: randomPhone(),
      },
    });
    consignees.push(c);
  }
  console.log(`  ✓ Consignees: ${consignees.length}`);

  // ── 7. Create Shipments ──
  const STATUSES = ['PENDING', 'PICKUP_ASSIGNED', 'PICKED_UP', 'AT_HUB', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'FAILED'];
  const PAYMENT_TYPES = ['COD', 'COD', 'COD', 'PREPAID'];

  let created = 0;
  for (let i = 0; i < 50; i++) {
    const { merchant } = pick(merchantUsers);
    const consignee = pick(consignees);
    const addr = pick(merchantAddresses);
    const status = pick(STATUSES);
    const paymentType = pick(PAYMENT_TYPES);
    const weight = (Math.random() * 10 + 0.5).toFixed(1);
    const codAmount = paymentType === 'COD' ? parseFloat((Math.random() * 200 + 5).toFixed(2)) : 0;

    const daysAgo = Math.floor(Math.random() * 14);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber: randomTracking(),
        merchantId: merchant.id,
        consigneeId: consignee.id,
        pickupAddressId: addr.id,
        deliveryAddressId: addr.id,
        pickupAddressSnap: { line1: addr.line1, city: addr.city },
        deliveryAddressSnap: { line1: pick(ADDRESSES), city: pick(CITIES) },
        weightKg: parseFloat(weight),
        paymentType,
        codAmount,
        deliveryCharge: parseFloat((Math.random() * 10 + 3).toFixed(2)),
        currentStatus: status,
        currentBranchId: pick([branch.id, branch2.id]),
        deliveredAt: status === 'DELIVERED' ? new Date(createdAt.getTime() + Math.random() * 5 * 86400000) : null,
        pickedUpAt: ['PICKED_UP', 'AT_HUB', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status) ? new Date(createdAt.getTime() + 3600000) : null,
        createdAt,
      },
    });

    // Status history
    const historyStatuses = getStatusHistory(status);
    for (let j = 0; j < historyStatuses.length; j++) {
      await prisma.shipmentStatusHistory.create({
        data: {
          shipmentId: shipment.id,
          status: historyStatuses[j],
          note: getNoteForStatus(historyStatuses[j]),
          createdAt: new Date(createdAt.getTime() + j * 3600000),
        },
      });
    }

    // Assign rider for active shipments
    if (['PICKUP_ASSIGNED', 'PICKED_UP', 'AT_HUB', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(status)) {
      await prisma.riderAssignment.create({
        data: {
          riderId: pick(riderUsers).id,
          shipmentId: shipment.id,
          assignedAt: new Date(createdAt.getTime() + 1800000),
        },
      });
    }

    created++;
  }
  console.log(`  ✓ Shipments: ${created} created`);

  // ── 8. Create Ledger Entries for delivered shipments ──
  const deliveredShipments = await prisma.shipment.findMany({ where: { currentStatus: 'DELIVERED' }, take: 20 });
  let ledgerEntries = 0;
  for (const s of deliveredShipments) {
    const account = await prisma.ledgerAccount.findFirst({ where: { merchantId: s.merchantId } });
    if (account && parseFloat(s.codAmount) > 0) {
      await prisma.ledgerEntry.create({
        data: {
          transactionId: `COD-${s.trackingNumber}`,
          accountId: account.id,
          direction: 'CREDIT',
          amount: parseFloat(s.codAmount),
          type: 'COD_COLLECTED',
          shipmentId: s.id,
          note: `COD collected for ${s.trackingNumber}`,
        },
      });
      ledgerEntries++;
    }
  }
  console.log(`  ✓ Ledger entries: ${ledgerEntries}`);

  // ── 9. Rate Card ──
  const rateCard = await prisma.rateCard.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', name: 'Standard Rate Card', isDefault: true },
  });

  const existingRules = await prisma.rateRule.findMany({ where: { rateCardId: rateCard.id } });
  if (existingRules.length === 0) {
    for (const zone of zones.slice(0, 4)) {
      await prisma.rateRule.createMany({
        data: [
          { rateCardId: rateCard.id, zoneId: zone.id, serviceType: 'standard', baseCharge: 5.0, extraPerKg: 1.5 },
          { rateCardId: rateCard.id, zoneId: zone.id, serviceType: 'express', baseCharge: 8.0, extraPerKg: 2.0 },
        ],
      });
    }
  }
  console.log(`  ✓ Rate card with rules`);

  // ── Done ──
  console.log('\n✅ Realistic data seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  Merchants:    ${merchantUsers.length}`);
  console.log(`  Riders:       ${riderUsers.length}`);
  console.log(`  Consignees:   ${consignees.length}`);
  console.log(`  Shipments:    ${created}`);
  console.log(`  Ledger:       ${ledgerEntries}`);
  console.log(`\n📋 Demo Credentials (all passwords: admin123):`);
  console.log(`  Superadmin : admin@shohnaat.com`);
  console.log(`  Merchant 1 : merchant1@shohnaat.com`);
  console.log(`  Rider 1    : rider1@shohnaat.com`);
  console.log(`  Operator   : operator@shohnaat.com`);
}

function getStatusHistory(currentStatus) {
  const flow = {
    PENDING: ['PENDING'],
    PICKUP_ASSIGNED: ['PENDING', 'PICKUP_ASSIGNED'],
    PICKED_UP: ['PENDING', 'PICKUP_ASSIGNED', 'PICKED_UP'],
    AT_HUB: ['PENDING', 'PICKUP_ASSIGNED', 'PICKED_UP', 'AT_HUB'],
    IN_TRANSIT: ['PENDING', 'PICKUP_ASSIGNED', 'PICKED_UP', 'AT_HUB', 'IN_TRANSIT'],
    OUT_FOR_DELIVERY: ['PENDING', 'PICKUP_ASSIGNED', 'PICKED_UP', 'AT_HUB', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'],
    DELIVERED: ['PENDING', 'PICKUP_ASSIGNED', 'PICKED_UP', 'AT_HUB', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'],
    FAILED: ['PENDING', 'PICKUP_ASSIGNED', 'PICKED_UP', 'AT_HUB', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'FAILED'],
  };
  return flow[currentStatus] || ['PENDING'];
}

function getNoteForStatus(status) {
  const notes = {
    PENDING: 'Shipment created and awaiting pickup',
    PICKUP_ASSIGNED: 'Rider assigned for pickup',
    PICKED_UP: 'Package picked up from merchant',
    AT_HUB: 'Received at sorting hub',
    IN_TRANSIT: 'In transit to destination hub',
    OUT_FOR_DELIVERY: 'Out for final delivery',
    DELIVERED: 'Successfully delivered to consignee',
    FAILED: 'Delivery attempt failed',
  };
  return notes[status] || 'Status updated';
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
