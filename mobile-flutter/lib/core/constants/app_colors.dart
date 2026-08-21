import 'package:flutter/material.dart';

/// Shohnaat Logistics — Mobile Design Tokens
/// Matches web app's clean, professional, light-theme palette.
class AppColors {
  // ═══════════════════════════════════════════════════════════════
  //  PRIMARY — Blue (#2563EB) — Buttons, links, active states
  // ═══════════════════════════════════════════════════════════════
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryDark = Color(0xFF1D4ED8);
  static const Color primaryLight = Color(0xFFEFF6FF);

  // ═══════════════════════════════════════════════════════════════
  //  NAVY — Brand header / app bar background
  // ═══════════════════════════════════════════════════════════════
  static const Color navy = Color(0xFF0F172A);
  static const Color navyDark = Color(0xFF080D1A);

  // ═══════════════════════════════════════════════════════════════
  //  SURFACES — Light, clean backgrounds
  // ═══════════════════════════════════════════════════════════════
  static const Color background = Color(0xFFF8FAFC);     // Page bg (slate-50)
  static const Color surface = Colors.white;              // Card bg
  static const Color surfaceElevated = Color(0xFFFAFBFC); // Elevated card bg
  static const Color inputFill = Color(0xFFF1F5F9);       // Input background (slate-100)
  static const Color border = Color(0xFFE2E8F0);          // Borders, dividers (slate-200)
  static const Color borderLight = Color(0xFFF1F5F9);     // Subtle dividers (slate-100)

  // ═══════════════════════════════════════════════════════════════
  //  TEXT — Professional hierarchy
  // ═══════════════════════════════════════════════════════════════
  static const Color textPrimary = Color(0xFF0F172A);      // Slate 900
  static const Color textSecondary = Color(0xFF334155);    // Slate 700
  static const Color textMuted = Color(0xFF64748B);        // Slate 500
  static const Color textLight = Color(0xFF94A3B8);        // Slate 400
  static const Color textWhite = Colors.white;

  // ═══════════════════════════════════════════════════════════════
  //  STATUS — Meaningful, accessible colors
  // ═══════════════════════════════════════════════════════════════
  static const Color success = Color(0xFF16A34A);
  static const Color successLight = Color(0xFFF0FDF4);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFFFBEB);
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerLight = Color(0xFFFEF2F2);
  static const Color info = Color(0xFF0EA5E9);
  static const Color infoLight = Color(0xFFF0F9FF);
  static const Color purple = Color(0xFF8B5CF6);
  static const Color purpleLight = Color(0xFFF5F3FF);
  static const Color teal = Color(0xFF14B8A6);
  static const Color tealLight = Color(0xFFF0FDFA);

  // ═══════════════════════════════════════════════════════════════
  //  ACCENT — Highlight colors
  // ═══════════════════════════════════════════════════════════════
  static const Color cyanAccent = Color(0xFF06B6D4);
  static const Color amberAccent = Color(0xFFF59E0B);

  // ═══════════════════════════════════════════════════════════════
  //  GRADIENTS — Subtle, professional
  // ═══════════════════════════════════════════════════════════════
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF3B82F6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient navyGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF16A34A), Color(0xFF22C55E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient purpleGradient = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFF8B5CF6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Legacy aliases for minimal breakage during migration
  static const Color navyBackground = navy;
  static const Color navySurface = surface;
  static const Color navyCard = surface;
  static const Color navyCardHover = Color(0xFFF1F5F9);
  static const Color navyBorder = border;
  static const Color glassWhite = Color(0x0D000000);
  static const Color glassBorder = Color(0x1A000000);
  static const Color darkCardGradient_colors_0 = Color(0xFFF8FAFC);
  static const Color darkCardGradient_colors_1 = Color(0xFFF1F5F9);
}
