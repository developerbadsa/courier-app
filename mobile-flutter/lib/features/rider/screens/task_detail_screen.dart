import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/status_badge_widget.dart';
import '../cubit/runsheet_cubit.dart';
import '../models/delivery_task_model.dart';
import '../widgets/cash_collection_modal.dart';
import '../widgets/pod_signature_modal.dart';

class TaskDetailScreen extends StatelessWidget {
  final DeliveryTaskModel task;

  const TaskDetailScreen({super.key, required this.task});

  void _callCustomer(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _openGoogleMaps(String address) async {
    final query = Uri.encodeComponent(address);
    final uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$query');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _startDelivery(BuildContext context) {
    if (task.codAmount > 0) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (_) => CashCollectionModal(
          expectedCod: task.codAmount,
          trackingNumber: task.trackingNumber,
          onCollect: (amount) {
            _showPodModal(context, amount);
          },
        ),
      );
    } else {
      _showPodModal(context, 0.0);
    }
  }

  void _showPodModal(BuildContext context, double collectedAmount) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => PodSignatureModal(
        trackingNumber: task.trackingNumber,
        recipientName: task.recipientName,
        onConfirm: (otp) {
          context.read<RunsheetCubit>().completeDelivery(
                shipmentId: task.id,
                codCollected: collectedAmount,
              );
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Delivery Completed Successfully!'),
              backgroundColor: AppColors.success,
            ),
          );
          Navigator.of(context).pop();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(task.trackingNumber),
        backgroundColor: AppColors.navyBackground,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(child: StatusBadgeWidget(status: task.status, isSmall: true)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Recipient & Address Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        task.recipientName,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (task.recipientPhone.isNotEmpty)
                        IconButton(
                          icon: const Icon(LucideIcons.phoneCall, color: AppColors.primary),
                          onPressed: () => _callCustomer(task.recipientPhone),
                        ),
                    ],
                  ),
                  if (task.recipientPhone.isNotEmpty)
                    Text(
                      task.recipientPhone,
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                    ),
                  const Divider(height: 20),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(LucideIcons.mapPin, size: 18, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              task.deliveryAddress,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              task.destinationCity,
                              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  AppButton(
                    text: 'Open in GPS Navigation',
                    variant: AppButtonVariant.outline,
                    isFullWidth: true,
                    size: AppButtonSize.sm,
                    icon: const Icon(LucideIcons.navigation, size: 14, color: AppColors.primary),
                    onPressed: () => _openGoogleMaps('${task.deliveryAddress}, ${task.destinationCity}'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Financial & Package Details Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Package & Financial Info',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Cash Collection (COD)', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      Text(
                        task.codAmount > 0 ? '\$${task.codAmount.toStringAsFixed(2)} USD' : 'PREPAID',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: task.codAmount > 0 ? const Color(0xFFB45309) : AppColors.success,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Weight', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      Text('${task.weightKg} kg', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Scheduled Slot', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      Text(task.scheduledTime ?? 'Morning', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    ],
                  ),
                  if (task.driverNotes != null) ...[
                    const Divider(height: 16),
                    const Text('Special Instructions:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                    const SizedBox(height: 4),
                    Text(
                      task.driverNotes!,
                      style: const TextStyle(fontSize: 12.5, fontStyle: FontStyle.italic, color: AppColors.textPrimary),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Action Buttons
            if (!task.isCompleted) ...[
              AppButton(
                text: 'Deliver Parcel (Complete)',
                size: AppButtonSize.lg,
                isFullWidth: true,
                icon: const Icon(LucideIcons.checkCircle2, size: 18),
                onPressed: () => _startDelivery(context),
              ),
              const SizedBox(height: 10),
              AppButton(
                text: 'Mark Delivery Failed',
                variant: AppButtonVariant.danger,
                isFullWidth: true,
                size: AppButtonSize.md,
                icon: const Icon(LucideIcons.alertCircle, size: 16),
                onPressed: () {
                  context.read<RunsheetCubit>().markFailed(
                        shipmentId: task.id,
                        reason: 'Customer unreachable at address.',
                      );
                  Navigator.of(context).pop();
                },
              ),
            ] else ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.successLight,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.success.withOpacity(0.3)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.checkCircle, color: AppColors.success, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Delivery Task Finished',
                      style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF047857)),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
