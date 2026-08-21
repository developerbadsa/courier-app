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
    final uri = Uri.parse('tel:${phone.replaceAll(RegExp(r'[^\d+]'), '')}');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  void _openWhatsApp(String phone, String trackingNumber) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    final uri = Uri.parse('https://wa.me/$cleanPhone?text=Hello,%20this%20is%20your%20Shohnaat%20courier%20rider%20for%20parcel%20$trackingNumber.%20I%20am%20arriving%20shortly.');
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  void _openGoogleMaps(String address) async {
    final uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(address)}');
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  void _showReportFailDialog(BuildContext context) {
    String selectedReason = 'CUSTOMER_UNREACHABLE';
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(LucideIcons.alertTriangle, color: AppColors.danger, size: 20),
              SizedBox(width: 8),
              Text('Report Delivery Issue', style: TextStyle(fontSize: 16)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Select reason for non-delivery:', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppColors.inputFill,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: DropdownButton<String>(
                  value: selectedReason,
                  isExpanded: true,
                  dropdownColor: AppColors.surface,
                  underline: const SizedBox(),
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 12.5),
                  items: const [
                    DropdownMenuItem(value: 'CUSTOMER_UNREACHABLE', child: Text('Customer Unreachable')),
                    DropdownMenuItem(value: 'WRONG_ADDRESS', child: Text('Incorrect Address')),
                    DropdownMenuItem(value: 'CUSTOMER_RESCHEDULED', child: Text('Customer Rescheduled')),
                    DropdownMenuItem(value: 'REFUSED_PAYMENT', child: Text('Refused COD Payment')),
                    DropdownMenuItem(value: 'DAMAGED_BOX', child: Text('Package Damaged')),
                  ],
                  onChanged: (val) => setDialogState(() => selectedReason = val!),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: notesController,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 12.5),
                decoration: InputDecoration(
                  hintText: 'Additional notes...',
                  hintStyle: const TextStyle(color: AppColors.textLight, fontSize: 12),
                  filled: true,
                  fillColor: AppColors.inputFill,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
              onPressed: () {
                context.read<RunsheetCubit>().markFailed(
                      shipmentId: task.id,
                      reason: selectedReason,
                      notes: notesController.text,
                    );
                Navigator.pop(ctx);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Delivery marked as Failed'), backgroundColor: AppColors.danger),
                );
              },
              child: const Text('Confirm Return', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  void _startDelivery(BuildContext context) {
    if (task.codAmount > 0) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => CashCollectionModal(
          expectedCod: task.codAmount,
          trackingNumber: task.trackingNumber,
          onCollect: (amount) => _showPodModal(context, amount),
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
      backgroundColor: Colors.transparent,
      builder: (_) => PodSignatureModal(
        trackingNumber: task.trackingNumber,
        recipientName: task.recipientName,
        onConfirm: (otp) {
          context.read<RunsheetCubit>().completeDelivery(
                shipmentId: task.id,
                codCollected: collectedAmount,
                otpVerified: true,
              );
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Delivery Completed Successfully!'), backgroundColor: AppColors.success),
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
        backgroundColor: AppColors.navy,
        elevation: 0,
        title: Text(
          task.trackingNumber,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, fontFamily: 'monospace', color: Colors.white),
        ),
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
            // Customer & Address Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(task.recipientName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
                        child: Text(
                          task.scheduledTime ?? 'Standard Slot',
                          style: const TextStyle(color: AppColors.primary, fontSize: 10.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(task.recipientPhone, style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 10),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(LucideIcons.mapPin, color: AppColors.danger, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text('${task.deliveryAddress}, ${task.destinationCity}',
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12.5)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          text: 'Call',
                          variant: AppButtonVariant.outline,
                          size: AppButtonSize.sm,
                          icon: const Icon(LucideIcons.phone, size: 16, color: AppColors.primary),
                          onPressed: () => _callCustomer(task.recipientPhone),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: AppButton(
                          text: 'WhatsApp',
                          variant: AppButtonVariant.outline,
                          size: AppButtonSize.sm,
                          icon: const Icon(LucideIcons.messageSquare, size: 16, color: AppColors.success),
                          onPressed: () => _openWhatsApp(task.recipientPhone, task.trackingNumber),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: AppButton(
                          text: 'Navigate',
                          variant: AppButtonVariant.outline,
                          size: AppButtonSize.sm,
                          icon: const Icon(LucideIcons.navigation, size: 16, color: AppColors.primary),
                          onPressed: () => _openGoogleMaps('${task.deliveryAddress}, ${task.destinationCity}'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Parcel Specs
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Parcel Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 12),
                  _buildDetailRow('Package Weight', '${task.weightKg} kg'),
                  _buildDetailRow('Payment Mode', task.codAmount > 0 ? 'Cash on Delivery' : 'Prepaid'),
                  _buildDetailRow(
                    'Cash to Collect',
                    task.codAmount > 0 ? '\$${task.codAmount.toStringAsFixed(2)} USD' : '\$0.00 (Prepaid)',
                    isHighlight: task.codAmount > 0,
                  ),
                  if (task.driverNotes != null && task.driverNotes!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.infoLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.info, color: AppColors.info, size: 14),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(task.driverNotes!,
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 11.5, fontStyle: FontStyle.italic)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),

            if (!task.isCompleted) ...[
              AppButton(
                text: task.codAmount > 0 ? 'Collect Cash & Complete POD' : 'Capture Digital Signature (POD)',
                size: AppButtonSize.lg,
                icon: const Icon(LucideIcons.checkCircle2, size: 18),
                onPressed: () => _startDelivery(context),
              ),
              const SizedBox(height: 10),
              AppButton(
                text: 'Report Failed / Customer Issue',
                variant: AppButtonVariant.danger,
                icon: const Icon(LucideIcons.alertCircle, size: 16),
                onPressed: () => _showReportFailDialog(context),
              ),
            ] else ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.successLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.success.withValues(alpha: 0.2)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.checkCircle2, color: AppColors.success, size: 20),
                    SizedBox(width: 8),
                    Text('Delivery Completed & Signed', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
          Text(
            value,
            style: TextStyle(
              color: isHighlight ? AppColors.warning : AppColors.textPrimary,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
              fontSize: 12.5,
            ),
          ),
        ],
      ),
    );
  }
}
