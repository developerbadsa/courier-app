import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';

class FailureReason {
  final String code;
  final String label;
  final String description;

  const FailureReason({
    required this.code,
    required this.label,
    required this.description,
  });
}

const List<FailureReason> failureReasons = [
  FailureReason(
    code: 'CONSIGNEE_UNREACHABLE',
    label: 'Consignee Unreachable',
    description: 'Customer not answering calls or at location',
  ),
  FailureReason(
    code: 'ADDRESS_NOT_FOUND',
    label: 'Address Not Found',
    description: 'Delivery address does not exist or is incorrect',
  ),
  FailureReason(
    code: 'CUSTOMER_REFUSED',
    label: 'Customer Refused',
    description: 'Consignee declined to accept the parcel',
  ),
  FailureReason(
    code: 'NO_ONE_HOME',
    label: 'No One Home',
    description: 'No one available at delivery address',
  ),
  FailureReason(
    code: 'RESCHEDULE_REQUESTED',
    label: 'Reschedule Requested',
    description: 'Customer asked for a different delivery time',
  ),
  FailureReason(
    code: 'DAMAGED_IN_TRANSIT',
    label: 'Damaged in Transit',
    description: 'Parcel arrived damaged',
  ),
  FailureReason(
    code: 'WRONG_ADDRESS',
    label: 'Wrong Address',
    description: 'Consignee provided incorrect address',
  ),
];

/// Modal for reporting delivery failure with reason selection
class DeliveryFailureModal extends StatefulWidget {
  final String taskId;
  final Function(String reasonCode, String notes) onConfirm;

  const DeliveryFailureModal({
    super.key,
    required this.taskId,
    required this.onConfirm,
  });

  @override
  State<DeliveryFailureModal> createState() => _DeliveryFailureModalState();
}

class _DeliveryFailureModalState extends State<DeliveryFailureModal> {
  String? selectedReason;
  final TextEditingController notesController = TextEditingController();

  @override
  void dispose() {
    notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        constraints: const BoxConstraints(maxHeight: 600),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(
                color: AppColors.dangerLight,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    LucideIcons.alertTriangle,
                    color: AppColors.danger,
                    size: 22,
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'Report Failed Delivery',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.danger,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(LucideIcons.x, size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),

            // Content
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Select the reason for this delivery failure:',
                      style: TextStyle(
                        fontSize: 12.5,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Reason options
                    ...failureReasons.map((reason) {
                      final isSelected = selectedReason == reason.code;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedReason = reason.code;
                          });
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.dangerLight
                                : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.danger
                                  : AppColors.border,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 20,
                                height: 20,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isSelected
                                        ? AppColors.danger
                                        : AppColors.border,
                                    width: 2,
                                  ),
                                  color: isSelected
                                      ? AppColors.danger
                                      : Colors.white,
                                ),
                                child: isSelected
                                    ? const Icon(
                                        LucideIcons.check,
                                        size: 12,
                                        color: Colors.white,
                                      )
                                    : null,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      reason.label,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: isSelected
                                            ? AppColors.danger
                                            : AppColors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      reason.description,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),

                    const SizedBox(height: 16),

                    // Notes field
                    const Text(
                      'Additional Notes (Optional)',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: notesController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Add any additional details...',
                        hintStyle: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(color: AppColors.danger, width: 2),
                        ),
                        contentPadding: const EdgeInsets.all(12),
                      ),
                      style: const TextStyle(fontSize: 12.5),
                    ),
                  ],
                ),
              ),
            ),

            // Footer buttons
            Container(
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: AppColors.border),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: AppColors.border),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: selectedReason == null
                          ? null
                          : () {
                              widget.onConfirm(
                                selectedReason!,
                                notesController.text,
                              );
                              Navigator.pop(context);
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.danger,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        disabledBackgroundColor: AppColors.textMuted,
                      ),
                      child: const Text(
                        'Confirm Failure',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
