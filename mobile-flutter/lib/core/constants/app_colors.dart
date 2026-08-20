import 'package:flutter/material.dart';

class AppColors {
  // Brand Primary & Electric Accents
  static const Color primary = Color(0xFF2563EB); // Electric Royal Blue
  static const Color primaryDark = Color(0xFF1D4ED8);
  static const Color primaryLight = Color(0xFFEFF6FF);
  static const Color cyanAccent = Color(0xFF06B6D4); // Electric Cyan
  static const Color indigoAccent = Color(0xFF6366F1); // Vivid Indigo

  // Deep Dark Luxury Palette (Matching High-End Enterprise Dashboard)
  static const Color navyBackground = Color(0xFF0B132B); // Rich Deep Obsidian Navy
  static const Color navySurface = Color(0xFF111D3E); // Deep Card Surface
  static const Color navyCard = Color(0xFF16234D); // Raised Card
  static const Color navyCardHover = Color(0xFF1C2D62);
  static const Color navyBorder = Color(0xFF23356E); // Subtle glowing border

  // Glassmorphism Tints
  static const Color glassWhite = Color(0x1AFFFFFF);
  static const Color glassBorder = Color(0x33FFFFFF);
  static const Color glassDark = Color(0x800B132B);

  // Status & Priority Colors
  static const Color success = Color(0xFF10B981); // Emerald 500
  static const Color successLight = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFF59E0B); // Amber Gold
  static const Color warningLight = Color(0xFFFFFBEB);
  static const Color danger = Color(0xFFEF4444); // Crimson
  static const Color dangerLight = Color(0xFFFEF2F2);
  static const Color info = Color(0xFF0EA5E9); // Sky 500
  static const Color infoLight = Color(0xFFF0F9FF);
  static const Color purple = Color(0xFF8B5CF6);
  static const Color purpleLight = Color(0xFFF5F3FF);

  // Neutrals
  static const Color background = Color(0xFFF1F5F9); // Crisp Slate 100
  static const Color surface = Colors.white;
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderDark = Color(0xFFCBD5E1);

  // Text Tokens
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF475569); // Slate 600
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400
  static const Color textWhite = Colors.white;
  static const Color textCyan = Color(0xFF38BDF8);

  // Linear Gradient Presets
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF06B6D4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkCardGradient = LinearGradient(
    colors: [Color(0xFF16234D), Color(0xFF0E1838)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF0B132B), Color(0xFF1E3A8A), Color(0xFF0F172A)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF059669), Color(0xFF10B981)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient amberGradient = LinearGradient(
    colors: [Color(0xFFD97706), Color(0xFFF59E0B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient purpleGradient = LinearGradient(
    colors: [Color(0xFF6D28D9), Color(0xFF8B5CF6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
