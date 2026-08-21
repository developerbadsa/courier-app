import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class FilterPillItem {
  final String key;
  final String label;
  final int? count;
  final IconData? icon;

  const FilterPillItem({required this.key, required this.label, this.count, this.icon});
}

class FilterPillBar extends StatelessWidget {
  final List<FilterPillItem> items;
  final String selectedKey;
  final ValueChanged<String> onSelected;

  const FilterPillBar({super.key, required this.items, required this.selectedKey, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final item = items[index];
          final isSelected = item.key == selectedKey;

          return GestureDetector(
            onTap: () => onSelected(item.key),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (item.icon != null) ...[
                    Icon(
                      item.icon,
                      size: 14,
                      color: isSelected ? Colors.white : AppColors.textMuted,
                    ),
                    const SizedBox(width: 6),
                  ],
                  Text(
                    item.label,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                      color: isSelected ? Colors.white : AppColors.textMuted,
                    ),
                  ),
                  if (item.count != null) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? Colors.white.withValues(alpha: 0.25)
                            : AppColors.inputFill,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${item.count}',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
