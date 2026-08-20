import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/status_badge_widget.dart';
import '../cubit/runsheet_cubit.dart';
import '../cubit/runsheet_state.dart';
import '../models/delivery_task_model.dart';

class RiderRouteMapScreen extends StatefulWidget {
  const RiderRouteMapScreen({super.key});

  @override
  State<RiderRouteMapScreen> createState() => _RiderRouteMapScreenState();
}

class _RiderRouteMapScreenState extends State<RiderRouteMapScreen> {
  int _selectedStopIndex = 0;

  void _openGoogleMaps(String address) async {
    final uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(address)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _callRecipient(String phone) async {
    if (phone.isEmpty) return;
    final uri = Uri.parse('tel:${phone.replaceAll(RegExp(r'[^\d+]'), '')}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navyBackground,
      appBar: AppBar(
        backgroundColor: AppColors.navyBackground,
        elevation: 0,
        title: const Row(
          children: [
            Icon(LucideIcons.map, color: AppColors.cyanAccent, size: 20),
            SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'LIVE ROUTE DISPATCH MAP',
                  style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, letterSpacing: 1.1, color: Colors.white),
                ),
                Text(
                  'Multi-Stop Route Navigation Engine',
                  style: TextStyle(fontSize: 10, color: AppColors.textMuted),
                ),
              ],
            ),
          ],
        ),
      ),
      body: BlocBuilder<RunsheetCubit, RunsheetState>(
        builder: (context, state) {
          final tasks = state is RunsheetLoaded ? state.tasks : <DeliveryTaskModel>[];
          final activeTasks = tasks.where((t) => !t.isCompleted).toList();
          final currentTask = activeTasks.isNotEmpty
              ? (_selectedStopIndex < activeTasks.length ? activeTasks[_selectedStopIndex] : activeTasks.first)
              : (tasks.isNotEmpty ? tasks.first : null);

          return Stack(
            children: [
              // High-Tech Stylized Dark Map Grid Simulator
              Positioned.fill(
                child: CustomPaint(
                  painter: _TechMapPainter(
                    stopsCount: tasks.length,
                    activeStopIndex: _selectedStopIndex,
                  ),
                ),
              ),

              // Top Live Status Overlay Pill
              Positioned(
                top: 16,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.navySurface.withValues(alpha: 0.92),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cyanAccent.withValues(alpha: 0.5)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.4),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              color: AppColors.success,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(color: AppColors.success, blurRadius: 8, spreadRadius: 2),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'GPS Tracking: Online',
                            style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      Text(
                        '${activeTasks.length} Active Drops Remaining',
                        style: const TextStyle(color: AppColors.cyanAccent, fontSize: 11.5, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),

              // Stop Waypoint Selector Rail (Horizontal Pills)
              if (activeTasks.isNotEmpty)
                Positioned(
                  top: 72,
                  left: 0,
                  right: 0,
                  height: 46,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: activeTasks.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, idx) {
                      final isSel = idx == _selectedStopIndex;
                      final t = activeTasks[idx];
                      return GestureDetector(
                        onTap: () => setState(() => _selectedStopIndex = idx),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            gradient: isSel ? AppColors.primaryGradient : null,
                            color: isSel ? null : AppColors.navyCard,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSel ? AppColors.cyanAccent : AppColors.navyBorder,
                              width: isSel ? 1.5 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Text(
                                'Stop ${idx + 1}',
                                style: TextStyle(
                                  color: isSel ? Colors.white : AppColors.textMuted,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                t.destinationCity.split(',').first,
                                style: TextStyle(
                                  color: isSel ? Colors.white70 : AppColors.textMuted,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

              // Bottom Active Stop Navigation Card
              if (currentTask != null)
                Positioned(
                  bottom: 20,
                  left: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: AppColors.darkCardGradient,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: AppColors.cyanAccent.withValues(alpha: 0.5), width: 1.4),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.35),
                          blurRadius: 20,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Card Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    gradient: AppColors.primaryGradient,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    'STOP ${_selectedStopIndex + 1} OF ${activeTasks.length}',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 10.5),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  currentTask.trackingNumber,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12.5,
                                  ),
                                ),
                              ],
                            ),
                            StatusBadgeWidget(status: currentTask.status),
                          ],
                        ),

                        const SizedBox(height: 12),

                        // Recipient Name & Address
                        Text(
                          currentTask.recipientName,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(LucideIcons.mapPin, color: AppColors.cyanAccent, size: 14),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                '${currentTask.deliveryAddress}, ${currentTask.destinationCity}',
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 10),

                        // ETA & COD
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(LucideIcons.clock, color: Colors.amberAccent, size: 14),
                                const SizedBox(width: 5),
                                Text(
                                  'ETA: ~${(_selectedStopIndex + 1) * 12} mins (2.${_selectedStopIndex + 1} km)',
                                  style: const TextStyle(color: Colors.amberAccent, fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            if (currentTask.codAmount > 0)
                              Text(
                                'COD: \$${currentTask.codAmount.toStringAsFixed(2)}',
                                style: const TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 12),
                              )
                            else
                              const Text(
                                'PREPAID',
                                style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                          ],
                        ),

                        const SizedBox(height: 14),

                        // Turn-by-Turn Navigation Launch Button
                        Row(
                          children: [
                            IconButton.filledTonal(
                              icon: const Icon(LucideIcons.phone, size: 18),
                              style: IconButton.styleFrom(
                                backgroundColor: AppColors.navyCard,
                                foregroundColor: Colors.white,
                              ),
                              tooltip: 'Call Customer',
                              onPressed: () => _callRecipient(currentTask.recipientPhone),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: AppButton(
                                text: 'Start Turn-by-Turn GPS Navigation',
                                icon: const Icon(LucideIcons.navigation, size: 16),
                                onPressed: () => _openGoogleMaps('${currentTask.deliveryAddress}, ${currentTask.destinationCity}'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _TechMapPainter extends CustomPainter {
  final int stopsCount;
  final int activeStopIndex;

  _TechMapPainter({required this.stopsCount, required this.activeStopIndex});

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = const Color(0xFF070D1E);
    canvas.drawRect(Offset.zero & size, bgPaint);

    final gridPaint = Paint()
      ..color = const Color(0xFF132042).withValues(alpha: 0.4)
      ..strokeWidth = 1.0;

    const gridSize = 40.0;
    for (double x = 0; x < size.width; x += gridSize) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += gridSize) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // Dynamic Tech Route Path
    final pathPaint = Paint()
      ..color = AppColors.cyanAccent.withValues(alpha: 0.8)
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke;

    final glowPaint = Paint()
      ..color = AppColors.primary.withValues(alpha: 0.4)
      ..strokeWidth = 10.0
      ..style = PaintingStyle.stroke;

    final path = Path();
    final start = Offset(size.width * 0.25, size.height * 0.65);
    final p1 = Offset(size.width * 0.4, size.height * 0.45);
    final p2 = Offset(size.width * 0.65, size.height * 0.5);
    final p3 = Offset(size.width * 0.8, size.height * 0.3);

    path.moveTo(start.dx, start.dy);
    path.cubicTo(p1.dx, start.dy, p1.dx, p1.dy, p1.dx, p1.dy);
    path.cubicTo(p2.dx, p1.dy, p2.dx, p2.dy, p2.dx, p2.dy);
    path.cubicTo(p3.dx, p2.dy, p3.dx, p3.dy, p3.dx, p3.dy);

    canvas.drawPath(path, glowPaint);
    canvas.drawPath(path, pathPaint);

    // Draw Waypoint Pins
    final waypoints = [start, p1, p2, p3];
    for (int i = 0; i < waypoints.length; i++) {
      final isSel = i == activeStopIndex;
      final wp = waypoints[i];

      // Outer Pulse Ring
      if (isSel) {
        canvas.drawCircle(
          wp,
          18,
          Paint()..color = AppColors.cyanAccent.withValues(alpha: 0.3),
        );
      }

      // Pin Body
      canvas.drawCircle(
        wp,
        isSel ? 12 : 9,
        Paint()..color = isSel ? AppColors.cyanAccent : AppColors.primary,
      );

      canvas.drawCircle(
        wp,
        isSel ? 6 : 4,
        Paint()..color = Colors.white,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _TechMapPainter oldDelegate) {
    return oldDelegate.activeStopIndex != activeStopIndex || oldDelegate.stopsCount != stopsCount;
  }
}
