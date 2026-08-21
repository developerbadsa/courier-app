import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class AppTextField extends StatelessWidget {
  final String? label;
  final String? hint;
  final TextEditingController? controller;
  final bool obscureText;
  final TextInputType keyboardType;
  final dynamic prefixIcon; // Can be IconData or Widget
  final Widget? suffixIcon;
  final String? errorText;
  final int maxLines;
  final ValueChanged<String>? onChanged;
  final FormFieldValidator<String>? validator;

  const AppTextField({super.key, this.label, this.hint, this.controller, this.obscureText = false, this.keyboardType = TextInputType.text, this.prefixIcon, this.suffixIcon, this.errorText, this.maxLines = 1, this.onChanged, this.validator});

  @override
  Widget build(BuildContext context) {
    Widget? prefix;
    if (prefixIcon is IconData) {
      prefix = Icon(prefixIcon as IconData, size: 18, color: AppColors.textLight);
    } else if (prefixIcon is Widget) {
      prefix = prefixIcon as Widget;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(label!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          const SizedBox(height: 6),
        ],
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          maxLines: maxLines,
          onChanged: onChanged,
          validator: validator,
          style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimary, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.textLight, fontSize: 12.5),
            errorText: errorText,
            filled: true,
            fillColor: AppColors.inputFill,
            prefixIcon: prefix,
            suffixIcon: suffixIcon,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border, width: 1),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.8),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.danger, width: 1.2),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.danger, width: 1.8),
            ),
          ),
        ),
      ],
    );
  }
}
