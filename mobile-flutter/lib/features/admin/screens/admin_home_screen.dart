import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/status_badge_widget.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../auth/screens/login_screen.dart';
import '../../scanner/screens/camera_barcode_scanner_screen.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  int _tabIndex = 0;
  bool _isLoading = true;

  List<Map<String, dynamic>> _hubMetrics = [];
  List<Map<String, dynamic>> _activeRiders = [];

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    setState(() => _isLoading = true);
    try {
      final client = DioClient();
      final statsRes = await client.get(ApiConstants.merchantShipments, queryParameters: {'limit': 1});
      final ridersRes = await client.get('/api/v1/riders');

      final stats = statsRes.data?['stats'] ?? statsRes.data?['data'] ?? {};
      final riders = ridersRes.data?['data'] ?? [];

      if (mounted) {
        setState(() {
          _hubMetrics = [
            {'title': 'Total Shipments', 'value': '${stats['total'] ?? 0}', 'color': AppColors.primary},
            {'title': 'Out for Delivery', 'value': '${stats['outForDelivery'] ?? 0}', 'color': const Color(0xFFF59E0B)},
            {'title': 'Delivered', 'value': '${stats['delivered'] ?? 0}', 'color': AppColors.success},
            {'title': 'Failed', 'value': '${stats['failed'] ?? 0}', 'color': AppColors.danger},
          ];
          _activeRiders = (riders as List).take(10).map((r) => {
            'name': r['name'] ?? r['email'] ?? 'Rider',
            'vehicle': r['vehicleType'] ?? 'Bike',
            'active': '${r['activeTasks'] ?? 0} Parcels',
            'status': r['isOnDuty'] == true ? 'ON_DUTY' : 'OFF_DUTY',
          }).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

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
        title: const Row(
          children: [
            Icon(LucideIcons.shieldCheck, size: 20, color: Colors.white),
            SizedBox(width: 8),
            Text('Admin & Hub Operations'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.camera, color: Colors.white),
            tooltip: 'Inbound Barcode Scanner',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CameraBarcodeScannerScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(LucideIcons.logOut, color: AppColors.textMuted, size: 18),
            onPressed: _onLogout,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboard,
        child: _tabIndex == 0 ? _buildOverviewTab() : _buildFleetTab(),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _tabIndex,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMuted,
        backgroundColor: Colors.white,
        onTap: (idx) => setState(() => _tabIndex = idx),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.layoutDashboard),
            label: 'Hub Overview',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.users),
            label: 'Active Fleet',
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Hub Header
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.navyBackground,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ACTIVE SORTING FACILITY', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('Austin Central Hub #01', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.success),
                  ),
                  child: const Text('ONLINE', style: TextStyle(color: AppColors.success, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (_isLoading)
            const Center(child: Padding(
              padding: EdgeInsets.all(40),
              child: CircularProgressIndicator(color: AppColors.primary),
            ))
          else ...[
          // Grid KPIs
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.5,
            ),
            itemCount: _hubMetrics.length,
            itemBuilder: (context, idx) {
              final m = _hubMetrics[idx];
              return AppCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(m['title'], style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    const SizedBox(height: 4),
                    Text(m['value'], style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: m['color'])),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 18),

          // Quick Operations
          AppButton(
            text: 'Launch High-Speed Inbound Scanner',
            icon: const Icon(LucideIcons.scanLine, size: 18),
            size: AppButtonSize.lg,
            isFullWidth: true,
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CameraBarcodeScannerScreen()),
              );
            },
          ),
          ], // end else
        ],
      ),
    );
  }

  Widget _buildFleetTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Active On-Duty Fleet (4)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        const SizedBox(height: 12),
        ..._activeRiders.map((r) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: AppCard(
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.primaryLight,
                    child: Icon(r['vehicle'] == 'Cargo Van' ? LucideIcons.truck : LucideIcons.bike, size: 18, color: AppColors.primary),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                        Text('${r['vehicle']} • ${r['active']}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      StatusBadgeWidget(status: r['status'], isSmall: true),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(LucideIcons.batteryCharging, size: 12, color: AppColors.success),
                          const SizedBox(width: 3),
                          Text(r['battery'], style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}
