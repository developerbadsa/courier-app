import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class StatusBadgeWidget extends StatelessWidget {
  final String status;
  final bool isSmall;

  const StatusBadgeWidget({
    super.key,
    required this.status,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    Color dot;
    String label = status.replaceAll('_', ' ').toUpperCase();

    switch (status.toUpperCase()) {
      case 'DELIVERED':
      case 'PAID':
      case 'APPROVED':
      case 'ACTIVE':
        bg = AppColors.success.withValues(alpha: 0.15);
        text = AppColors.success;
        dot = AppColors.success;
        break;
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
      case 'PICKED_UP':
      case 'ASSIGNED':
        bg = AppColors.cyanAccent.withValues(alpha: 0.15);
        text = AppColors.cyanAccent;
        dot = AppColors.cyanAccent;
        break;
      case 'PENDING':
      case 'DRAFT':
      case 'PROCESSING':
        bg = AppColors.warning.withValues(alpha: 0.15);
        text = Colors.amberAccent;
        dot = AppColors.warning;
        break;
      case 'FAILED':
      case 'CANCELLED':
      case 'REJECTED':
        bg = AppColors.danger.withValues(alpha: 0.15);
        text = AppColors.danger;
        dot = AppColors.danger;
        break;
      default:
        bg = Colors.white.withValues(alpha: 0.08);
        text = AppColors.textMuted;
        dot = AppColors.textMuted;
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 7 : 10,
        vertical: isSmall ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: dot.withValues(alpha: 0.35), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: isSmall ? 5 : 6,
            height: isSmall ? 5 : 6,
            decoration: BoxDecoration(
              color: dot,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: dot.withValues(alpha: 0.8), blurRadius: 4, spreadRadius: 1),
              ],
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: text,
              fontSize: isSmall ? 10 : 11.5,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}
