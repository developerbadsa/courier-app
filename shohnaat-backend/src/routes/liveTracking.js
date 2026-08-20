const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

// ──────────────────────────────────────────────────────
// SSE: Live shipment tracking (public, no auth)
// GET /api/v1/live/track/:trackingNumber
// ──────────────────────────────────────────────────────
router.get('/track/:trackingNumber', async (req, res) => {
  const { trackingNumber } = req.params;
  const prisma = req.app.locals.prisma;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send initial data
  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Keep-alive ping every 30s
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000);

  // Fetch and send current state
  const fetchAndSend = async () => {
    try {
      const shipment = await prisma.shipment.findUnique({
        where: { trackingNumber },
        include: {
          statusHistory: { orderBy: { createdAt: 'desc' } },
          riderAssignments: {
            include: {
              rider: {
                include: { user: { select: { name: true } } },
              },
            },
            orderBy: { assignedAt: 'desc' },
            take: 1,
          },
          currentBranch: { select: { name: true } },
        },
      });

      if (!shipment) {
        sendEvent('error', { message: 'Shipment not found' });
        return false;
      }

      const timeline = shipment.statusHistory.map((h) => ({
        status: h.status,
        note: h.note,
        reasonCode: h.reasonCode,
        timestamp: h.createdAt,
      }));

      sendEvent('tracking', {
        trackingNumber: shipment.trackingNumber,
        currentStatus: shipment.currentStatus,
        currentHub: shipment.currentBranch?.name || null,
        riderName: shipment.riderAssignments[0]?.rider?.user?.name || null,
        pickedUpAt: shipment.pickedUpAt,
        deliveredAt: shipment.deliveredAt,
        timeline,
        eventCount: timeline.length,
      });

      return true;
    } catch (err) {
      sendEvent('error', { message: 'Failed to fetch tracking data' });
      return false;
    }
  };

  // Initial fetch
  const ok = await fetchAndSend();
  if (!ok) {
    clearInterval(keepAlive);
    res.end();
    return;
  }

  // Poll for changes every 10 seconds (WebSocket alternative)
  const pollInterval = setInterval(async () => {
    await fetchAndSend();
  }, 10000);

  // Rider GPS location broadcast (for active shipments)
  const gpsInterval = setInterval(async () => {
    try {
      const shipment = await prisma.shipment.findUnique({
        where: { trackingNumber },
        include: {
          riderAssignments: {
            where: { unassignedAt: null },
            include: { rider: true },
            take: 1,
          },
        },
      });

      if (shipment?.riderAssignments[0]?.rider) {
        // In production, this would come from rider's GPS updates
        // For now, send a heartbeat
        sendEvent('heartbeat', {
          timestamp: new Date().toISOString(),
          status: shipment.currentStatus,
        });
      }
    } catch {
      // Non-blocking
    }
  }, 15000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
    clearInterval(pollInterval);
    clearInterval(gpsInterval);
    res.end();
  });
});

// ──────────────────────────────────────────────────────
// Rider GPS location update (authenticated)
// POST /api/v1/live/location
// ──────────────────────────────────────────────────────
router.post('/location', auth, async (req, res) => {
  try {
    const { lat, lng, shipmentId } = req.body;
    const prisma = req.app.locals.prisma;

    // Store GPS location (for real-time tracking broadcast)
    const rider = await prisma.rider.findUnique({ where: { userId: req.user.id } });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    // Update rider's current location
    await prisma.rider.update({
      where: { id: rider.id },
      data: {
        isOnDuty: true,
        // In production, store location in a separate RiderLocation table
      },
    });

    res.json({ success: true, data: { lat, lng, updatedAt: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update location' });
  }
});

module.exports = router;
