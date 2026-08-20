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
        bg = AppColors.successLight;
        text = const Color(0xFF047857);
        dot = AppColors.success;
        break;
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
      case 'PICKED_UP':
      case 'ASSIGNED':
        bg = AppColors.primaryLight;
        text = const Color(0xFF1D4ED8);
        dot = AppColors.primary;
        break;
      case 'PENDING':
      case 'DRAFT':
      case 'PROCESSING':
        bg = AppColors.warningLight;
        text = const Color(0xFFB45309);
        dot = AppColors.warning;
        break;
      case 'FAILED':
      case 'CANCELLED':
      case 'REJECTED':
        bg = AppColors.dangerLight;
        text = const Color(0xFFB91C1C);
        dot = AppColors.danger;
        break;
      default:
        bg = const Color(0xFFF1F5F9);
        text = AppColors.textSecondary;
        dot = AppColors.textMuted;
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 6 : 8,
        vertical: isSmall ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: dot.withOpacity(0.25), width: 1),
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
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              color: text,
              fontSize: isSmall ? 10 : 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}
