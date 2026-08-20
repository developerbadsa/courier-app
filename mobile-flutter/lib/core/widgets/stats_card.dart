import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Modern stats card for displaying metrics
class StatsCard extends StatelessWidget {
  final String label;
  final String value;
  final Color backgroundColor;
  final Color valueColor;
  final Color labelColor;
  final IconData? icon;

  const StatsCard({
    super.key,
    required this.label,
    required this.value,
    this.backgroundColor = AppColors.primaryLight,
    this.valueColor = AppColors.primary,
    this.labelColor = AppColors.primary,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: valueColor.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 18, color: valueColor),
            const SizedBox(height: 6),
          ],
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: valueColor,
              height: 1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: labelColor,
              letterSpacing: 0.5,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
