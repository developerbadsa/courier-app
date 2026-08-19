const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

router.use(auth);

/**
 * MANIFEST / SCANNING / BAGGING API
 * Handles: Inbound receive, outbound bagging, manifest generation
 */

// ── State machine for shipment status at hub ──
const VALID_TRANSITIONS = {
  PICKED_UP: ['AT_HUB'],
  AT_HUB: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'],
  IN_TRANSIT: ['AT_HUB', 'OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: ['RESCHEDULED', 'RETURN_INITIATED', 'PICKUP_ASSIGNED'],
  RESCHEDULED: ['PICKUP_ASSIGNED', 'CANCELLED'],
  RETURN_INITIATED: ['RETURNED'],
  RETURNED: [],
  CANCELLED: [],
  PENDING: ['PICKUP_ASSIGNED'],
  PICKUP_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
};

// Generate manifest number
const generateManifestNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MNF-${timestamp}${random}`;
};

// ──────────────────────────────────────────────────────
// 1. CREATE OUTBOUND MANIFEST (bag parcels for linehaul)
// ──────────────────────────────────────────────────────
router.post('/manifests', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { fromBranchId, toBranchId, shipmentIds, type = 'OUTBOUND' } = req.body;

    if (!fromBranchId || !toBranchId || !shipmentIds?.length) {
      return res.status(400).json({
        success: false,
        message: 'fromBranchId, toBranchId, and shipmentIds array are required',
      });
    }

    // Create manifest
    const manifest = await prisma.manifest.create({
      data: {
        fromBranchId,
        toBranchId,
        type,
        createdByUserId: req.user.id,
      },
    });

    // Add items & transition shipments to IN_TRANSIT
    const items = [];
    const errors = [];

    for (const shipmentId of shipmentIds) {
      try {
        const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });

        if (!shipment) {
          errors.push({ shipmentId, error: 'Shipment not found' });
          continue;
        }

        // Validate status transition
        const validNext = VALID_TRANSITIONS[shipment.currentStatus] || [];
        if (!validNext.includes('IN_TRANSIT')) {
          errors.push({ shipmentId, error: `Cannot bag shipment in ${shipment.currentStatus} status` });
          continue;
        }

        // Add manifest item
        const item = await prisma.manifestItem.create({
          data: {
            manifestId: manifest.id,
            shipmentId,
          },
        });

        // Transition shipment to IN_TRANSIT
        await prisma.$transaction([
          prisma.shipment.update({
            where: { id: shipmentId },
            data: {
              currentStatus: 'IN_TRANSIT',
              currentBranchId: toBranchId,
            },
          }),
          prisma.shipmentStatusHistory.create({
            data: {
              shipmentId,
              status: 'IN_TRANSIT',
              note: `Bagged in manifest ${manifest.id}`,
              actorUserId: req.user.id,
            },
          }),
        ]);

        items.push(item);
      } catch (err) {
        errors.push({ shipmentId, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        manifest: {
          ...manifest,
          manifestNumber: generateManifestNumber(),
        },
        itemsAdded: items.length,
        errors,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────────────
// 2. DISPATCH MANIFEST (mark outbound as shipped)
// ──────────────────────────────────────────────────────
router.patch('/manifests/:id/dispatch', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const manifest = await prisma.manifest.update({
      where: { id: req.params.id },
      data: { dispatchedAt: new Date() },
      include: {
        fromBranch: { select: { name: true } },
        toBranch: { select: { name: true } },
        items: true,
      },
    });

    res.json({ success: true, data: manifest });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────────────
// 3. RECEIVE INBOUND MANIFEST (hub receives bag)
// ──────────────────────────────────────────────────────
router.patch('/manifests/:id/receive', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { scannedShipmentIds } = req.body; // Items actually scanned in

    const manifest = await prisma.manifest.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!manifest) {
      return res.status(404).json({ success: false, message: 'Manifest not found' });
    }

    // Mark manifest as received
    await prisma.manifest.update({
      where: { id: req.params.id },
      data: { receivedAt: new Date() },
    });

    // Transition scanned shipments to AT_HUB
    const received = [];
    const notFound = [];

    for (const item of manifest.items) {
      try {
        const shipment = await prisma.shipment.findUnique({ where: { id: item.shipmentId } });
        if (!shipment) {
          notFound.push(item.shipmentId);
          continue;
        }

        // Transition to AT_HUB
        await prisma.$transaction([
          prisma.shipment.update({
            where: { id: item.shipmentId },
            data: { currentStatus: 'AT_HUB', currentBranchId: manifest.toBranchId },
          }),
          prisma.shipmentStatusHistory.create({
            data: {
              shipmentId: item.shipmentId,
              status: 'AT_HUB',
              note: `Received at hub via manifest ${manifest.id}`,
              actorUserId: req.user.id,
            },
          }),
        ]);

        received.push(item.shipmentId);
      } catch (err) {
        notFound.push(item.shipmentId);
      }
    }

    res.json({
      success: true,
      data: {
        manifestId: manifest.id,
        totalItems: manifest.items.length,
        received: received.length,
        notFound: notFound.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────────────
// 4. SCAN SINGLE PARCEL (inbound receive at hub)
// ──────────────────────────────────────────────────────
router.post('/scan/receive', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { trackingNumber, branchId } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({ success: false, message: 'trackingNumber is required' });
    }

    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber },
    });

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found', scanned: false });
    }

    // Validate state machine
    const validNext = VALID_TRANSITIONS[shipment.currentStatus] || [];
    if (!validNext.includes('AT_HUB')) {
      return res.status(400).json({
        success: false,
        message: `Cannot receive: shipment is ${shipment.currentStatus}`,
        scanned: false,
        currentStatus: shipment.currentStatus,
      });
    }

    // Transition to AT_HUB
    await prisma.$transaction([
      prisma.shipment.update({
        where: { id: shipment.id },
        data: { currentStatus: 'AT_HUB', currentBranchId: branchId || shipment.currentBranchId },
      }),
      prisma.shipmentStatusHistory.create({
        data: {
          shipmentId: shipment.id,
          status: 'AT_HUB',
          note: 'Scanned and received at hub',
          actorUserId: req.user.id,
          locationBranchId: branchId,
        },
      }),
    ]);

    res.json({
      success: true,
      scanned: true,
      data: {
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
        currentStatus: 'AT_HUB',
        consigneeName: shipment.consigneeId,
        weightKg: shipment.weightKg,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────────────
// 5. SCAN SINGLE PARCEL (outbound bag into manifest)
// ──────────────────────────────────────────────────────
router.post('/scan/bag', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { trackingNumber, manifestId } = req.body;

    if (!trackingNumber || !manifestId) {
      return res.status(400).json({ success: false, message: 'trackingNumber and manifestId required' });
    }

    const shipment = await prisma.shipment.findFirst({ where: { trackingNumber } });
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found', scanned: false });
    }

    // Check not already in this manifest
    const existing = await prisma.manifestItem.findFirst({
      where: { manifestId, shipmentId: shipment.id },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already scanned into this manifest', scanned: false });
    }

    // Add to manifest
    const item = await prisma.manifestItem.create({
      data: { manifestId, shipmentId: shipment.id },
    });

    res.json({
      success: true,
      scanned: true,
      data: {
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
        manifestItemId: item.id,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────────────
// 6. GET MANIFESTS LIST
// ──────────────────────────────────────────────────────
router.get('/manifests', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 20, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(type && { type }),
      ...(status === 'dispatched' && { dispatchedAt: { not: null }, receivedAt: null }),
      ...(status === 'received' && { receivedAt: { not: null } }),
      ...(status === 'pending' && { dispatchedAt: null }),
    };

    const [manifests, total] = await Promise.all([
      prisma.manifest.findMany({
        where,
        include: {
          fromBranch: { select: { name: true, code: true } },
          toBranch: { select: { name: true, code: true } },
          _count: { select: { items: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.manifest.count({ where }),
    ]);

    res.json({
      success: true,
      data: manifests,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────────────
// 7. GET SINGLE MANIFEST WITH ITEMS
// ──────────────────────────────────────────────────────
router.get('/manifests/:id', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const manifest = await prisma.manifest.findUnique({
      where: { id: req.params.id },
      include: {
        fromBranch: { select: { name: true, code: true } },
        toBranch: { select: { name: true, code: true } },
        items: {
          include: {
            shipment: {
              select: { id: true, trackingNumber: true, currentStatus: true, weightKg: true, codAmount: true },
            },
          },
        },
      },
    });

    if (!manifest) {
      return res.status(404).json({ success: false, message: 'Manifest not found' });
    }

    res.json({ success: true, data: manifest });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────────────
// 8. GET SCAN STATS (hub dashboard)
// ──────────────────────────────────────────────────────
router.get('/stats', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const [pending, inTransit, atHub, outboundToday, manifestsActive] = await Promise.all([
      prisma.shipment.count({ where: { currentStatus: 'PENDING', deletedAt: null } }),
      prisma.shipment.count({ where: { currentStatus: 'IN_TRANSIT', deletedAt: null } }),
      prisma.shipment.count({ where: { currentStatus: 'AT_HUB', deletedAt: null } }),
      prisma.shipment.count({ where: { currentStatus: 'OUT_FOR_DELIVERY', deletedAt: null } }),
      prisma.manifest.count({ where: { receivedAt: null } }),
    ]);

    res.json({
      success: true,
      data: { pending, inTransit, atHub, outboundToday, manifestsActive },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
