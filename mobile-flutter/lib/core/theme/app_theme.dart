import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';

class AppTheme {
  static ThemeData get darkLuxuryTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.navyBackground,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.cyanAccent,
        surface: AppColors.navySurface,
        error: AppColors.danger,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 26, letterSpacing: -0.5),
        titleLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        titleMedium: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15),
        bodyLarge: TextStyle(color: Colors.white, fontSize: 14),
        bodyMedium: TextStyle(color: AppColors.textMuted, fontSize: 13),
        bodySmall: TextStyle(color: AppColors.textMuted, fontSize: 11),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.navyBackground,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
        ),
        titleTextStyle: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
      ),
      cardTheme: CardThemeData(
        color: AppColors.navySurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppColors.navyBorder.withValues(alpha: 0.8), width: 1.2),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.navyBorder,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
