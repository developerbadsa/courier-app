import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_stat_card.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../scanner/screens/camera_barcode_scanner_screen.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  final List<Map<String, dynamic>> _activeRiders = [
    {'name': 'Michael Chang', 'id': 'RDR-081', 'speed': '32 km/h', 'battery': '88%', 'currentTask': 'SHN-9482-US (Stop 2/4)', 'status': 'ONLINE', 'area': 'Downtown Austin'},
    {'name': 'Alex Martinez', 'id': 'RDR-044', 'speed': '0 km/h', 'battery': '94%', 'currentTask': 'SHN-8831-US (Unloading)', 'status': 'ONLINE', 'area': 'South Congress'},
    {'name': 'Jordan Lee', 'id': 'RDR-019', 'speed': '45 km/h', 'battery': '72%', 'currentTask': 'SHN-7712-US (En Route)', 'status': 'ONLINE', 'area': 'North Campus'},
    {'name': 'Sarah Connor', 'id': 'RDR-095', 'speed': 'Idle', 'battery': '100%', 'currentTask': 'Hub Standby', 'status': 'STANDBY', 'area': 'Central Sort'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        elevation: 0,
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset('assets/images/app_logo.png', width: 34, height: 34, fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Icon(LucideIcons.shieldCheck, color: Colors.white, size: 24),
              ),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Admin Command Tower', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
                Text('Fleet Telemetry & KPIs', style: TextStyle(fontSize: 10, color: AppColors.textLight)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.scanLine, color: Colors.white, size: 22),
            tooltip: 'Scanner',
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CameraBarcodeScannerScreen())),
          ),
          IconButton(
            icon: const Icon(LucideIcons.logOut, color: AppColors.textLight, size: 20),
            tooltip: 'Sign Out',
            onPressed: () => context.read<AuthCubit>().logout(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // System Status Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.successLight,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.success.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 10, height: 10,
                    decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text('All 8 Microservices Operating Normally', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                    child: const Text('99.98% Uptime', style: TextStyle(color: AppColors.success, fontSize: 10.5, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // KPI Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.6,
              children: const [
                AppStatCard(title: 'Today Deliveries', value: '1,482', icon: LucideIcons.packageCheck, iconColor: AppColors.primary, trend: '+14.2%'),
                AppStatCard(title: 'Active Fleet', value: '42', icon: LucideIcons.bike, iconColor: AppColors.success, trend: '94% on route'),
                AppStatCard(title: 'GMV Volume', value: '\$84,290', icon: LucideIcons.dollarSign, iconColor: AppColors.warning, trend: 'Revenue'),
                AppStatCard(title: 'SLA Rate', value: '99.4%', icon: LucideIcons.gauge, iconColor: AppColors.purple, trend: 'Optimal'),
              ],
            ),

            const SizedBox(height: 18),

            // Fleet Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Live Fleet GPS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.radio, size: 12, color: AppColors.primary),
                      SizedBox(width: 4),
                      Text('42 Active', style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Rider List
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _activeRiders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final rider = _activeRiders[index];
                final bool isOnline = rider['status'] == 'ONLINE';
                return AppCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 36, height: 36,
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(LucideIcons.bike, color: AppColors.primary, size: 18),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(rider['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                  Text('${rider['id']} • ${rider['area']}', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isOnline ? AppColors.successLight : AppColors.inputFill,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(rider['status']!, style: TextStyle(color: isOnline ? AppColors.success : AppColors.textMuted, fontSize: 10.5, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Task: ${rider['currentTask']}', style: const TextStyle(color: AppColors.primary, fontSize: 11.5, fontWeight: FontWeight.w600)),
                          Row(
                            children: [
                              const Icon(LucideIcons.gauge, size: 12, color: AppColors.textLight),
                              const SizedBox(width: 4),
                              Text(rider['speed']!, style: const TextStyle(fontSize: 11)),
                              const SizedBox(width: 8),
                              const Icon(LucideIcons.batteryCharging, size: 12, color: AppColors.success),
                              const SizedBox(width: 4),
                              Text(rider['battery']!, style: const TextStyle(fontSize: 11)),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
