import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/status_badge_widget.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../auth/screens/login_screen.dart';
import 'create_parcel_screen.dart';
import 'pickup_requests_screen.dart';
import '../../tracking/screens/customer_tracking_screen.dart';

class MerchantHomeScreen extends StatefulWidget {
  const MerchantHomeScreen({super.key});

  @override
  State<MerchantHomeScreen> createState() => _MerchantHomeScreenState();
}

class _MerchantHomeScreenState extends State<MerchantHomeScreen> {
  final List<Map<String, dynamic>> _recentShipments = [
    {
      'tracking': 'SHN-8429-2026',
      'recipient': 'Michael Anderson',
      'city': 'Austin, TX',
      'status': 'OUT_FOR_DELIVERY',
      'cod': 45.00,
    },
    {
      'tracking': 'SHN-9102-2026',
      'recipient': 'Sarah Jenkins',
      'city': 'Austin, TX',
      'status': 'IN_TRANSIT',
      'cod': 0.00,
    },
    {
      'tracking': 'SHN-7341-2026',
      'recipient': 'Robert Vance',
      'city': 'Round Rock, TX',
      'status': 'PENDING',
      'cod': 120.00,
    },
    {
      'tracking': 'SHN-5092-2026',
      'recipient': 'Emily Clark',
      'city': 'Austin, TX',
      'status': 'DELIVERED',
      'cod': 32.50,
    },
  ];

  void _onLogout() {
    context.read<AuthCubit>().logout();
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.navyBackground,
        title: const Text('Merchant Portal'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.search, color: Colors.white),
            tooltip: 'Track Parcel',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CustomerTrackingScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(LucideIcons.logOut, color: AppColors.textMuted, size: 18),
            onPressed: _onLogout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Available COD Balance Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E3A8A), Color(0xFF2563EB)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'AVAILABLE COD BALANCE',
                        style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                      Icon(LucideIcons.wallet, color: Colors.white70, size: 18),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '\$1,420.50 USD',
                    style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('Pending: \$380.00', style: TextStyle(color: Colors.white, fontSize: 11)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Quick Actions
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    text: 'Book Parcel',
                    icon: const Icon(LucideIcons.packagePlus, size: 16),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const CreateParcelScreen()),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: AppButton(
                    text: 'Request Pickup',
                    variant: AppButtonVariant.outline,
                    icon: const Icon(LucideIcons.calendarPlus, size: 16),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const PickupRequestsScreen()),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),

            // Recent Shipments Section
            const Text(
              'Recent Shipments',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),

            ..._recentShipments.map((s) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: AppCard(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => CustomerTrackingScreen(initialTracking: s['tracking']),
                      ),
                    );
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(s['tracking'], style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                          StatusBadgeWidget(status: s['status'], isSmall: true),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('Recipient: ${s['recipient']}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      Text('Destination: ${s['city']}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      const SizedBox(height: 6),
                      Text(
                        s['cod'] > 0 ? 'COD: \$${s['cod'].toStringAsFixed(2)}' : 'PREPAID',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: s['cod'] > 0 ? const Color(0xFFB45309) : AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
