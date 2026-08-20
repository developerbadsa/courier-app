import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';

class LiveDeliveryMapView extends StatelessWidget {
  final String status;
  final String trackingNumber;
  final String riderName;
  final String eta;

  const LiveDeliveryMapView({
    super.key,
    required this.status,
    required this.trackingNumber,
    this.riderName = 'Alex Rodriguez (Rider #104)',
    this.eta = '12 mins',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 220,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: Stack(
        children: [
          // Visual Map Grid Background
          Positioned.fill(
            child: Opacity(
              opacity: 0.15,
              child: CustomPaint(
                painter: MapGridPainter(),
              ),
            ),
          ),

          // Route Simulation Polyline
          Center(
            child: CustomPaint(
              size: const Size(260, 120),
              painter: RouteLinePainter(),
            ),
          ),

          // Origin Warehouse Pin
          const Positioned(
            left: 24,
            top: 40,
            child: Column(
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: AppColors.primary,
                  child: Icon(LucideIcons.warehouse, size: 14, color: Colors.white),
                ),
                SizedBox(height: 2),
                Text('Austin Hub', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          ),

          // Moving Rider Marker
          const Positioned(
            left: 130,
            top: 80,
            child: Column(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: Color(0xFFF59E0B),
                  child: Icon(LucideIcons.bike, size: 16, color: Colors.white),
                ),
                SizedBox(height: 2),
                Text('Rider Moving', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          ),

          // Destination Delivery Pin
          const Positioned(
            right: 24,
            bottom: 40,
            child: Column(
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: AppColors.success,
                  child: Icon(LucideIcons.mapPin, size: 14, color: Colors.white),
                ),
                SizedBox(height: 2),
                Text('Destination', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          ),

          // Top Floating Telemetry Overlay
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B).withValues(alpha: 0.92),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.white12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'Live GPS Telemetry',
                        style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  Text(
                    'ETA: $eta',
                    style: const TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 0.5;

    for (double i = 0; i < size.width; i += 24) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    for (double j = 0; j < size.height; j += 24) {
      canvas.drawLine(Offset(0, j), Offset(size.width, j), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class RouteLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.primary
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    path.moveTo(0, 20);
    path.cubicTo(size.width * 0.4, 20, size.width * 0.5, size.height - 20, size.width, size.height - 20);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
