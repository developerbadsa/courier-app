const express = require('express');
const router = express.Router();
const { cacheMiddleware } = require('../lib/cache');

/**
 * PUBLIC Tracking API — No Authentication Required
 * GET /api/v1/tracking/:trackingNumber
 * Sub-millisecond cached responses via Redis
 */
router.use('/:trackingNumber', cacheMiddleware('tracking', 30));


// Status display labels
const STATUS_LABELS = {
  PENDING: 'Order Placed',
  PICKUP_ASSIGNED: 'Rider Assigned',
  PICKED_UP: 'Picked Up',
  AT_HUB: 'At Sorting Hub',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Delivery Failed',
  RESCHEDULED: 'Rescheduled',
  CANCELLED: 'Cancelled',
  RETURN_INITIATED: 'Return Initiated',
  RETURNED: 'Returned',
};

const STATUS_ICONS = {
  PENDING: 'clipboard',
  PICKUP_ASSIGNED: 'user-check',
  PICKED_UP: 'package-check',
  AT_HUB: 'warehouse',
  IN_TRANSIT: 'truck',
  OUT_FOR_DELIVERY: 'map-pin',
  DELIVERED: 'check-circle',
  FAILED: 'x-circle',
  CANCELLED: 'ban',
};

// Progress percentage by status
const PROGRESS = {
  PENDING: 5,
  PICKUP_ASSIGNED: 15,
  PICKED_UP: 30,
  AT_HUB: 45,
  IN_TRANSIT: 60,
  OUT_FOR_DELIVERY: 80,
  DELIVERED: 100,
  FAILED: 80,
  CANCELLED: 0,
  RETURN_INITIATED: 90,
  RETURNED: 100,
};

// GET /api/v1/tracking/:trackingNumber — Full public tracking data
router.get('/:trackingNumber', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { trackingNumber } = req.params;

    if (!trackingNumber || trackingNumber.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Valid tracking number required' });
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        trackingNumber: { contains: trackingNumber.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
      include: {
        consignee: { select: { name: true } },
        pickupAddress: { select: { line1: true, city: true } },
        deliveryAddress: { select: { line1: true, city: true } },
        currentBranch: { select: { name: true, code: true } },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        riderAssignments: {
          include: {
            rider: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found. Please check your tracking number.',
      });
    }

    // Build timeline from status history
    const timeline = shipment.statusHistory.map((entry) => ({
      status: entry.status,
      label: STATUS_LABELS[entry.status] || entry.status,
      note: entry.note,
      reasonCode: entry.reasonCode,
      timestamp: entry.createdAt.toISOString(),
      branch: entry.locationBranchId,
      actorId: entry.actorUserId,
    }));

    // Calculate ETA
    let eta = null;
    let etaLabel = '';
    const now = new Date();

    if (shipment.currentStatus === 'DELIVERED') {
      eta = shipment.deliveredAt?.toISOString();
      etaLabel = 'Delivered';
    } else if (shipment.currentStatus === 'CANCELLED' || shipment.currentStatus === 'RETURNED') {
      etaLabel = 'N/A';
    } else if (['OUT_FOR_DELIVERY'].includes(shipment.currentStatus)) {
      eta = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(); // +4 hours
      etaLabel = 'Today';
    } else if (['IN_TRANSIT', 'AT_HUB'].includes(shipment.currentStatus)) {
      eta = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // +1 day
      etaLabel = 'Tomorrow';
    } else {
      eta = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(); // +2 days
      etaLabel = 'Within 2 days';
    }

    // ETA countdown
    let countdown = null;
    if (eta && shipment.currentStatus !== 'DELIVERED' && shipment.currentStatus !== 'CANCELLED') {
      const diff = new Date(eta).getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        countdown = { hours, minutes, totalMinutes: Math.floor(diff / (1000 * 60)) };
      }
    }

    // Rider info
    const rider = shipment.riderAssignments[0]?.rider;

    // Build response
    res.json({
      success: true,
      data: {
        trackingNumber: shipment.trackingNumber,
        currentStatus: shipment.currentStatus,
        statusLabel: STATUS_LABELS[shipment.currentStatus] || shipment.currentStatus,
        progress: PROGRESS[shipment.currentStatus] || 0,

        // Addresses
        origin: shipment.pickupAddress
          ? `${shipment.pickupAddress.line1}, ${shipment.pickupAddress.city}`
          : 'Origin',
        destination: shipment.deliveryAddress
          ? `${shipment.deliveryAddress.line1}, ${shipment.deliveryAddress.city}`
          : 'Destination',
        consigneeName: shipment.consignee?.name || 'Consignee',

        // Current location
        currentHub: shipment.currentBranch?.name || null,

        // Timeline
        timeline,
        eventCount: timeline.length,

        // ETA
        eta,
        etaLabel,
        countdown,

        // Rider
        riderName: rider?.user?.name || null,

        // Timestamps
        createdAt: shipment.createdAt.toISOString(),
        pickedUpAt: shipment.pickedUpAt?.toISOString() || null,
        deliveredAt: shipment.deliveredAt?.toISOString() || null,

        // Shipment info
        paymentType: shipment.paymentType,
        weightKg: shipment.weightKg ? parseFloat(shipment.weightKg) : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
