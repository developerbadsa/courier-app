import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_colors.dart';
import 'status_badge_widget.dart';
import '../../features/rider/models/delivery_task_model.dart';

/// Modern task card with detailed information and actions
class ModernTaskCard extends StatelessWidget {
  final DeliveryTaskModel task;
  final int? stopNumber;
  final VoidCallback? onDeliver;
  final VoidCallback? onFailed;
  final VoidCallback? onPOD;
  final VoidCallback? onTap;

  const ModernTaskCard({super.key, required this.task, this.stopNumber, this.onDeliver, this.onFailed, this.onPOD, this.onTap});

  void _makePhoneCall(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _openGoogleMaps(double lat, double lng) async {
    final uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isCompleted = task.status == 'DELIVERED' || task.status == 'FAILED';
    final bool hasCOD = task.codAmount > 0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Stop number, Tracking, Status
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      if (stopNumber != null) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '#$stopNumber',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                      ],
                      Text(
                        task.trackingNumber,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  StatusBadgeWidget(status: task.status, isSmall: true),
                ],
              ),
            ),

            const Divider(height: 1, thickness: 1, color: AppColors.borderLight),

            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Recipient name
                  Text(
                    task.recipientName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Phone with tap to call
                  GestureDetector(
                    onTap: () => _makePhoneCall(task.recipientPhone),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.phone, size: 14, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Text(
                          task.recipientPhone,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Text('(Tap to Call)', style: TextStyle(fontSize: 11, color: AppColors.textLight)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Address with GPS
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.inputFill,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.mapPin, size: 16, color: AppColors.danger),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                task.deliveryAddress,
                                style: const TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                  height: 1.3,
                                ),
                              ),
                              Text(
                                task.destinationCity,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textMuted,
                                  height: 1.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () => _openGoogleMaps(task.latitude ?? 30.2672, task.longitude ?? -97.7431),
                          icon: const Icon(LucideIcons.navigation, size: 18, color: AppColors.primary),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          style: IconButton.styleFrom(
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          tooltip: 'Open GPS Navigation',
                        ),
                      ],
                    ),
                  ),

                  // Scheduled time
                  if (task.scheduledTime != null && task.scheduledTime!.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Icon(LucideIcons.clock, size: 13, color: AppColors.textLight),
                        const SizedBox(width: 6),
                        Text(
                          task.scheduledTime!,
                          style: const TextStyle(
                            fontSize: 11.5,
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],

                  // Driver notes
                  if (task.driverNotes != null && task.driverNotes!.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.infoLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(LucideIcons.fileText, size: 13, color: AppColors.info),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              task.driverNotes!,
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w500,
                                height: 1.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // COD Amount
                  if (hasCOD && !isCompleted) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.warningLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Cash to Collect (COD):',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            '\$${task.codAmount.toStringAsFixed(2)} USD',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: AppColors.warning,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Action Buttons
                  if (!isCompleted) ...[
                    const SizedBox(height: 14),
                    const Divider(height: 1, thickness: 1, color: AppColors.borderLight),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: ElevatedButton.icon(
                            onPressed: onDeliver,
                            icon: const Icon(LucideIcons.checkCircle, size: 14),
                            label: const Text('Delivered', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.success,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: onFailed,
                            icon: const Icon(LucideIcons.xCircle, size: 14),
                            label: const Text('Failed', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700)),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.danger,
                              side: BorderSide(color: AppColors.danger.withValues(alpha: 0.3)),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton(
                          onPressed: onPOD,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.textMuted,
                            side: const BorderSide(color: AppColors.border),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Icon(LucideIcons.camera, size: 16),
                        ),
                      ],
                    ),
                  ],

                  // Completed status
                  if (task.status == 'DELIVERED') ...[
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.successLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.check, size: 16, color: AppColors.success),
                          SizedBox(width: 8),
                          Text(
                            'Successfully Delivered',
                            style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.success),
                          ),
                        ],
                      ),
                    ),
                  ],

                  if (task.status == 'FAILED') ...[
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.dangerLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.alertTriangle, size: 16, color: AppColors.danger),
                          SizedBox(width: 8),
                          Text(
                            'Delivery Failed — Awaiting Reschedule',
                            style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.danger),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
