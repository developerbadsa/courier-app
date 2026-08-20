import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

enum AppButtonVariant { primary, outline, danger, ghost, navy, cyan }
enum AppButtonSize { sm, md, lg }

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isLoading;
  final Widget? icon;
  final bool isFullWidth;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.md,
    this.isLoading = false,
    this.icon,
    this.isFullWidth = false,
  });

  @override
  Widget build(BuildContext context) {
    final double height = size == AppButtonSize.sm ? 38.0 : size == AppButtonSize.lg ? 54.0 : 46.0;
    final double fontSize = size == AppButtonSize.sm ? 12.0 : size == AppButtonSize.lg ? 15.0 : 13.5;
    final EdgeInsets padding = EdgeInsets.symmetric(horizontal: size == AppButtonSize.sm ? 14 : 20);

    Gradient? bgGradient;
    Color? bgColor;
    Color textColor = Colors.white;
    BorderSide borderSide = BorderSide.none;

    switch (variant) {
      case AppButtonVariant.primary:
        bgGradient = AppColors.primaryGradient;
        break;
      case AppButtonVariant.cyan:
        bgColor = AppColors.cyanAccent;
        textColor = AppColors.navyBackground;
        break;
      case AppButtonVariant.navy:
        bgColor = AppColors.navyCard;
        textColor = Colors.white;
        borderSide = BorderSide(color: AppColors.navyBorder.withValues(alpha: 0.8));
        break;
      case AppButtonVariant.outline:
        bgColor = Colors.transparent;
        textColor = AppColors.cyanAccent;
        borderSide = const BorderSide(color: AppColors.cyanAccent, width: 1.5);
        break;
      case AppButtonVariant.danger:
        bgColor = AppColors.danger;
        textColor = Colors.white;
        break;
      case AppButtonVariant.ghost:
        bgColor = Colors.transparent;
        textColor = AppColors.textMuted;
        break;
    }

    Widget content = Row(
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              valueColor: AlwaysStoppedAnimation<Color>(textColor),
            ),
          ),
          const SizedBox(width: 8),
        ] else if (icon != null) ...[
          icon!,
          const SizedBox(width: 8),
        ],
        Text(
          text,
          style: TextStyle(
            color: textColor,
            fontSize: fontSize,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.2,
          ),
        ),
      ],
    );

    if (bgGradient != null) {
      return Container(
        height: height,
        width: isFullWidth ? double.infinity : null,
        decoration: BoxDecoration(
          gradient: bgGradient,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.35),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isLoading ? null : onPressed,
            borderRadius: BorderRadius.circular(14),
            child: Padding(padding: padding, child: content),
          ),
        ),
      );
    }

    return SizedBox(
      height: height,
      width: isFullWidth ? double.infinity : null,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: bgColor,
          foregroundColor: textColor,
          elevation: 0,
          padding: padding,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: borderSide,
          ),
        ),
        child: content,
      ),
    );
  }
}
