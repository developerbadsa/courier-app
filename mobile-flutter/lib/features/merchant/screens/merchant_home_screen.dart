import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/services/connectivity_service.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_compliance_dialogs.dart';
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
  List<Map<String, dynamic>> _recentShipments = [];
  bool _isLoading = true;
  bool _isFromCache = false;
  String? _error;
  int _totalShipments = 0;
  double _totalCod = 0;
  int _totalDelivered = 0;

  static const String _cacheKey = 'merchant_shipments_cache';

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    setState(() { _isLoading = true; _error = null; });

    final isOnline = context.read<ConnectivityService>().isOnline;

    if (!isOnline) {
      // Offline — serve from cache
      await _loadFromCache();
      return;
    }

    try {
      final client = DioClient();
      final response = await client.get(ApiConstants.merchantShipments);

      if (response.data?['data'] is List) {
        final data = response.data['data'] as List;
        final shipments = data.take(10).map((s) => {
          'tracking': s['trackingNumber'] ?? '',
          'recipient': s['consignee']?['name'] ?? 'Customer',
          'city': s['deliveryAddressSnap']?['city'] ?? '',
          'status': s['currentStatus'] ?? 'PENDING',
          'cod': double.tryParse(s['codAmount']?.toString() ?? '0') ?? 0,
          'id': s['id'] ?? '',
        }).toList();

        setState(() {
          _recentShipments = shipments;
          _totalShipments = response.data?['pagination']?['total'] ?? data.length;
          _totalCod = shipments.fold(0.0, (sum, s) => sum + (s['cod'] as double));
          _totalDelivered = shipments.where((s) => s['status'] == 'DELIVERED').length;
          _isLoading = false;
          _isFromCache = false;
        });

        // Cache for offline use
        await _saveToCache(shipments, _totalShipments);
      } else {
        setState(() { _isLoading = false; });
      }
    } catch (e) {
      // API failed — try cache
      await _loadFromCache();
    }
  }

  Future<void> _loadFromCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_cacheKey);
      if (raw != null) {
        final data = jsonDecode(raw) as Map<String, dynamic>;
        final shipments = (data['shipments'] as List).cast<Map<String, dynamic>>();
        setState(() {
          _recentShipments = shipments;
          _totalShipments = data['total'] ?? shipments.length;
          _totalCod = shipments.fold(0.0, (sum, s) => sum + (s['cod'] as double));
          _totalDelivered = shipments.where((s) => s['status'] == 'DELIVERED').length;
          _isLoading = false;
          _isFromCache = true;
        });
        return;
      }
    } catch (_) {}
    setState(() {
      _error = 'No internet. Pull down to retry.';
      _isLoading = false;
    });
  }

  Future<void> _saveToCache(List<Map<String, dynamic>> shipments, int total) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cacheKey, jsonEncode({
        'shipments': shipments,
        'total': total,
        'cachedAt': DateTime.now().toIso8601String(),
      }));
    } catch (_) {}
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
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text('Merchant Dashboard', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(LucideIcons.moreVertical, color: Colors.white, size: 20),
            onSelected: (value) {
              if (value == 'privacy') {
                AppComplianceDialogs.showPrivacyPolicy(context);
              } else if (value == 'delete_account') {
                AppComplianceDialogs.showAccountDeletionRequest(
                  context,
                  onConfirmDelete: () {
                    context.read<AuthCubit>().logout();
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Account deletion request submitted.'),
                        backgroundColor: AppColors.danger,
                      ),
                    );
                  },
                );
              } else if (value == 'logout') {
                _onLogout();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'privacy',
                child: Row(
                  children: [
                    Icon(LucideIcons.shieldCheck, size: 16, color: AppColors.primary),
                    SizedBox(width: 8),
                    Text('Privacy Policy'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete_account',
                child: Row(
                  children: [
                    Icon(LucideIcons.trash2, size: 16, color: AppColors.danger),
                    SizedBox(width: 8),
                    Text('Delete Account', style: TextStyle(color: AppColors.danger)),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(LucideIcons.logOut, size: 16, color: AppColors.textSecondary),
                    SizedBox(width: 8),
                    Text('Log Out'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboard,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // KPI Cards
            Row(
              children: [
                _buildKpiCard('Total', '$_totalShipments', LucideIcons.package, AppColors.primary),
                const SizedBox(width: 8),
                _buildKpiCard('Delivered', '$_totalDelivered', LucideIcons.checkCircle2, AppColors.success),
                const SizedBox(width: 8),
                _buildKpiCard('COD', '\$${_totalCod.toStringAsFixed(0)}', LucideIcons.dollarSign, AppColors.warning),
              ],
            ),
            const SizedBox(height: 16),

            // Quick Actions
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    text: 'Create Parcel',
                    icon: const Icon(LucideIcons.plus, size: 14, color: Colors.white),
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateParcelScreen())),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: AppButton(
                    text: 'Track Parcel',
                    icon: const Icon(LucideIcons.search, size: 14, color: AppColors.textPrimary),
                    variant: AppButtonVariant.outline,
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CustomerTrackingScreen())),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            AppButton(
              text: 'Pickup Requests',
              icon: const Icon(LucideIcons.truck, size: 14, color: AppColors.textPrimary),
              variant: AppButtonVariant.outline,
              isFullWidth: true,
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PickupRequestsScreen())),
            ),
            const SizedBox(height: 20),

            // Recent Shipments
            if (_isFromCache) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3)),
                ),
                child: Row(
                  children: const [
                    Icon(LucideIcons.database, size: 12, color: Color(0xFF3B82F6)),
                    SizedBox(width: 6),
                    Text('Cached data — refresh when online', style: TextStyle(color: Color(0xFF1E40AF), fontSize: 11)),
                  ],
                ),
              ),
            ],
            const Text('Recent Shipments', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const SizedBox(height: 8),

            if (_isLoading)
              const Center(child: Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(color: AppColors.primary),
              ))
            else if (_error != null)
              AppCard(
                child: Center(
                  child: Column(
                    children: [
                      const Icon(LucideIcons.alertTriangle, color: AppColors.danger, size: 24),
                      const SizedBox(height: 8),
                      Text(_error!, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                      const SizedBox(height: 8),
                      AppButton(text: 'Retry', size: AppButtonSize.sm, onPressed: _loadDashboard),
                    ],
                  ),
                ),
              )
            else if (_recentShipments.isEmpty)
              AppCard(
                child: Center(
                  child: Column(
                    children: [
                      const Icon(LucideIcons.package, color: AppColors.textMuted, size: 32),
                      const SizedBox(height: 8),
                      const Text('No shipments yet', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                      const SizedBox(height: 8),
                      AppButton(text: 'Create First Shipment', size: AppButtonSize.sm, onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateParcelScreen()))),
                    ],
                  ),
                ),
              )
            else
              ..._recentShipments.map((s) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AppCard(
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Icon(LucideIcons.package, size: 16, color: AppColors.primary),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s['tracking'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, fontFamily: 'monospace')),
                            Text('${s['recipient']} — ${s['city']}', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          StatusBadgeWidget(status: s['status']),
                          if ((s['cod'] as double) > 0)
                            Text('\$${(s['cod'] as double).toStringAsFixed(2)}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.success)),
                        ],
                      ),
                    ],
                  ),
                ),
              )),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: AppCard(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color)),
            Text(label, style: const TextStyle(fontSize: 9, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
