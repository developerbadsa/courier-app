import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import 'rider_home_screen.dart';
import 'rider_route_map_screen.dart';
import '../../scanner/screens/camera_barcode_scanner_screen.dart';
import 'rider_cod_wallet_screen.dart';
import 'rider_profile_screen.dart';

class RiderMainShell extends StatefulWidget {
  final int initialTab;

  const RiderMainShell({super.key, this.initialTab = 0});

  @override
  State<RiderMainShell> createState() => _RiderMainShellState();
}

class _RiderMainShellState extends State<RiderMainShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTab;
  }

  final List<Widget> _screens = const [
    RiderHomeScreen(),
    RiderRouteMapScreen(),
    CameraBarcodeScannerScreen(),
    RiderCodWalletScreen(),
    RiderProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navyBackground,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.navySurface,
          border: Border(
            top: BorderSide(color: AppColors.navyBorder.withValues(alpha: 0.8), width: 1.2),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.4),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, LucideIcons.listTodo, 'Runsheet'),
                _buildNavItem(1, LucideIcons.map, 'Map'),
                _buildCenterScannerItem(2),
                _buildNavItem(3, LucideIcons.wallet, 'Wallet'),
                _buildNavItem(4, LucideIcons.user, 'Profile'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _currentIndex == index;
    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withValues(alpha: 0.18) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? AppColors.cyanAccent : AppColors.textMuted,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? Colors.white : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterScannerItem(int index) {
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: AppColors.primaryGradient,
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.5),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(
            color: isSelected ? AppColors.cyanAccent : Colors.white24,
            width: 2,
          ),
        ),
        child: const Icon(
          LucideIcons.scanLine,
          color: Colors.white,
          size: 22,
        ),
      ),
    );
  }
}
