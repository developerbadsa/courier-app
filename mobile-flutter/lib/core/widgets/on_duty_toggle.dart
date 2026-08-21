import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// On Duty status toggle widget
class OnDutyToggle extends StatelessWidget {
  final bool isOnDuty;
  final ValueChanged<bool> onChanged;

  const OnDutyToggle({super.key, required this.isOnDuty, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(!isOnDuty),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isOnDuty ? AppColors.successLight : AppColors.inputFill,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isOnDuty ? AppColors.success : AppColors.border,
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: isOnDuty ? AppColors.success : AppColors.textLight,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              isOnDuty ? 'ON DUTY' : 'OFF DUTY',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: isOnDuty ? AppColors.success : AppColors.textMuted,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
