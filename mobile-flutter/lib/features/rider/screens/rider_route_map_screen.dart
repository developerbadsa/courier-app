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
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        elevation: 0,
        title: const Row(
          children: [
            Icon(LucideIcons.map, color: AppColors.cyanAccent, size: 20),
            SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Route Dispatch Map', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
                Text('Multi-Stop Navigation', style: TextStyle(fontSize: 10, color: AppColors.textLight)),
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

          return Column(
            children: [
              // Stop selector pills
              if (activeTasks.isNotEmpty)
                Container(
                  height: 52,
                  color: AppColors.surface,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: activeTasks.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, idx) {
                      final isSel = idx == _selectedStopIndex;
                      final t = activeTasks[idx];
                      return GestureDetector(
                        onTap: () => setState(() => _selectedStopIndex = idx),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSel ? AppColors.primary : AppColors.surface,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSel ? AppColors.primary : AppColors.border,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('Stop ${idx + 1}',
                                  style: TextStyle(color: isSel ? Colors.white : AppColors.textMuted, fontWeight: FontWeight.bold, fontSize: 12)),
                              const SizedBox(width: 6),
                              Text(t.destinationCity.split(',').first,
                                  style: TextStyle(color: isSel ? Colors.white70 : AppColors.textMuted, fontSize: 11)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

              // Map placeholder area
              Expanded(
                child: Stack(
                  children: [
                    // Stylized map background
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _TechMapPainter(
                          stopsCount: tasks.length,
                          activeStopIndex: _selectedStopIndex,
                        ),
                      ),
                    ),

                    // Status pill
                    Positioned(
                      top: 12,
                      left: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 8, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle),
                                ),
                                const SizedBox(width: 8),
                                const Text('GPS Online', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            Text('${activeTasks.length} Active Drops',
                                style: const TextStyle(color: AppColors.primary, fontSize: 11.5, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Bottom navigation card
              if (currentTask != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    border: const Border(top: BorderSide(color: AppColors.border)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, -3)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
                                child: Text(
                                  'STOP ${_selectedStopIndex + 1} OF ${activeTasks.length}',
                                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 10.5),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(currentTask.trackingNumber,
                                  style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 12.5)),
                            ],
                          ),
                          StatusBadgeWidget(status: currentTask.status),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(currentTask.recipientName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(LucideIcons.mapPin, color: AppColors.danger, size: 14),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text('${currentTask.deliveryAddress}, ${currentTask.destinationCity}',
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(LucideIcons.clock, color: AppColors.warning, size: 14),
                              const SizedBox(width: 5),
                              Text('ETA: ~${(_selectedStopIndex + 1) * 12} mins',
                                  style: const TextStyle(color: AppColors.warning, fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          if (currentTask.codAmount > 0)
                            Text('COD: \$${currentTask.codAmount.toStringAsFixed(2)}',
                                style: const TextStyle(color: AppColors.warning, fontWeight: FontWeight.bold, fontSize: 12))
                          else
                            const Text('PREPAID', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 11)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(LucideIcons.phone, size: 18),
                            color: AppColors.primary,
                            tooltip: 'Call Customer',
                            onPressed: () => _callRecipient(currentTask.recipientPhone),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: AppButton(
                              text: 'Start GPS Navigation',
                              icon: const Icon(LucideIcons.navigation, size: 16),
                              onPressed: () => _openGoogleMaps('${currentTask.deliveryAddress}, ${currentTask.destinationCity}'),
                            ),
                          ),
                        ],
                      ),
                    ],
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
    // Light background
    final bgPaint = Paint()..color = const Color(0xFFF1F5F9);
    canvas.drawRect(Offset.zero & size, bgPaint);

    // Grid lines
    final gridPaint = Paint()..color = AppColors.border.withValues(alpha: 0.5)..strokeWidth = 0.8;
    const gridSize = 40.0;
    for (double x = 0; x < size.width; x += gridSize) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += gridSize) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // Route path
    final glowPaint = Paint()..color = AppColors.primary.withValues(alpha: 0.15)..strokeWidth = 12.0..style = PaintingStyle.stroke;
    final pathPaint = Paint()..color = AppColors.primary..strokeWidth = 3.0..style = PaintingStyle.stroke;

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

    // Waypoint pins
    final waypoints = [start, p1, p2, p3];
    for (int i = 0; i < waypoints.length; i++) {
      final isSel = i == activeStopIndex;
      final wp = waypoints[i];

      if (isSel) {
        canvas.drawCircle(wp, 16, Paint()..color = AppColors.primary.withValues(alpha: 0.15));
      }

      canvas.drawCircle(wp, isSel ? 12 : 8, Paint()..color = isSel ? AppColors.primary : AppColors.textLight);
      canvas.drawCircle(wp, isSel ? 6 : 3, Paint()..color = Colors.white);
    }
  }

  @override
  bool shouldRepaint(covariant _TechMapPainter oldDelegate) {
    return oldDelegate.activeStopIndex != activeStopIndex || oldDelegate.stopsCount != stopsCount;
  }
}
