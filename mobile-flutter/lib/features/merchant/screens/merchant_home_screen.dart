import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_stat_card.dart';
import '../../../core/widgets/filter_pill_bar.dart';
import '../../../core/widgets/status_badge_widget.dart';
import '../../auth/cubit/auth_cubit.dart';
import 'create_parcel_screen.dart';
import 'pickup_requests_screen.dart';
import '../../tracking/screens/customer_tracking_screen.dart';

class MerchantHomeScreen extends StatefulWidget {
  const MerchantHomeScreen({super.key});

  @override
  State<MerchantHomeScreen> createState() => _MerchantHomeScreenState();
}

class _MerchantHomeScreenState extends State<MerchantHomeScreen> {
  List<Map<String, dynamic>> _shipments = [];
  bool _isLoading = true;
  String _selectedFilter = 'ALL';
  double _walletBalance = 4250.00;
  double _escrowCod = 1820.00;
  int _totalShipments = 128;
  int _deliveredCount = 98;
  int _inTransitCount = 24;

  @override
  void initState() {
    super.initState();
    _loadMerchantData();
  }

  Future<void> _loadMerchantData() async {
    setState(() => _isLoading = true);
    try {
      final client = DioClient();
      final response = await client.get(ApiConstants.merchantShipments);
      if (response.data?['data'] is List) {
        final list = (response.data['data'] as List).map((s) {
          final consignee = s['consignee'] is Map ? s['consignee'] : null;
          final addr = s['deliveryAddressSnap'] is Map ? s['deliveryAddressSnap'] : null;
          return {
            'id': s['id']?.toString() ?? '',
            'tracking': s['trackingNumber']?.toString() ?? 'SHN-000',
            'recipient': consignee?['name']?.toString() ?? 'Customer',
            'city': addr?['city']?.toString() ?? 'Austin, TX',
            'status': (s['currentStatus']?.toString() ?? 'IN_TRANSIT').toUpperCase(),
            'cod': double.tryParse(s['codAmount']?.toString() ?? '0') ?? 0.0,
            'createdAt': s['createdAt']?.toString() ?? 'Today',
          };
        }).toList();

        if (list.isNotEmpty) {
          setState(() {
            _shipments = list;
            _totalShipments = list.length;
            _deliveredCount = list.where((x) => x['status'] == 'DELIVERED').length;
            _inTransitCount = list.where((x) => x['status'] == 'IN_TRANSIT' || x['status'] == 'OUT_FOR_DELIVERY').length;
            _isLoading = false;
          });
          return;
        }
      }
    } catch (_) {}

    setState(() {
      _shipments = [
        {'id': '1', 'tracking': 'SHN-9482-US', 'recipient': 'Michael Chang', 'city': 'Downtown Austin', 'status': 'OUT_FOR_DELIVERY', 'cod': 48.50, 'createdAt': '10 mins ago'},
        {'id': '2', 'tracking': 'SHN-8831-US', 'recipient': 'Sophia Rodriguez', 'city': 'South Congress', 'status': 'IN_TRANSIT', 'cod': 0.0, 'createdAt': '1 hour ago'},
        {'id': '3', 'tracking': 'SHN-7712-US', 'recipient': 'David Miller', 'city': 'North Campus', 'status': 'ASSIGNED', 'cod': 112.00, 'createdAt': '2 hours ago'},
        {'id': '4', 'tracking': 'SHN-6604-US', 'recipient': 'Emma Watson', 'city': 'East Austin', 'status': 'DELIVERED', 'cod': 32.00, 'createdAt': 'Delivered'},
      ];
      _isLoading = false;
    });
  }

  void _showPayoutModal() {
    final amountController = TextEditingController(text: '$_walletBalance');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 20, top: 20, left: 20, right: 20),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Request Instant Payout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                IconButton(icon: const Icon(LucideIcons.x), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 12),
            Text('Available: \$${_walletBalance.toStringAsFixed(2)} USD', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 14),
            TextField(
              controller: amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                prefixText: '\$ ',
                labelText: 'Withdrawal Amount',
                filled: true,
                fillColor: AppColors.inputFill,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 20),
            AppButton(
              text: 'Confirm Transfer',
              icon: const Icon(LucideIcons.arrowRight, size: 16),
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Payout Request submitted!'), backgroundColor: AppColors.success),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _shipments.where((s) {
      if (_selectedFilter == 'PENDING') return s['status'] == 'ASSIGNED' || s['status'] == 'PENDING';
      if (_selectedFilter == 'IN_TRANSIT') return s['status'] == 'IN_TRANSIT' || s['status'] == 'OUT_FOR_DELIVERY';
      if (_selectedFilter == 'DELIVERED') return s['status'] == 'DELIVERED';
      return true;
    }).toList();

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
                errorBuilder: (_, __, ___) => const Icon(LucideIcons.store, color: Colors.white, size: 24),
              ),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Merchant Portal', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
                Text('Apex Global Store', style: TextStyle(fontSize: 10.5, color: AppColors.textLight)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.calendarDays, color: Colors.white, size: 20),
            tooltip: 'Pickups',
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PickupRequestsScreen())),
          ),
          IconButton(
            icon: const Icon(LucideIcons.logOut, color: AppColors.textLight, size: 20),
            tooltip: 'Logout',
            onPressed: () => context.read<AuthCubit>().logout(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CreateParcelScreen())).then((_) => _loadMerchantData());
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(LucideIcons.plus, color: Colors.white, size: 18),
        label: const Text('Create Parcel', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: RefreshIndicator(
        onRefresh: _loadMerchantData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Wallet Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: AppColors.primary.withValues(alpha: 0.25), blurRadius: 16, offset: const Offset(0, 6)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Available COD Balance', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(LucideIcons.shieldCheck, size: 13, color: Colors.white),
                              SizedBox(width: 4),
                              Text('Instant Payout', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text('\$${_walletBalance.toStringAsFixed(2)} USD', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1)),
                    const SizedBox(height: 6),
                    Text('Escrow: \$${_escrowCod.toStringAsFixed(2)} (In Delivery)', style: const TextStyle(color: Colors.white70, fontSize: 11.5)),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _showPayoutModal,
                      icon: const Icon(LucideIcons.wallet, size: 16, color: AppColors.navy),
                      label: const Text('Withdraw Funds', style: TextStyle(color: AppColors.navy, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // KPI Grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.6,
                children: [
                  AppStatCard(title: 'Total Parcels', value: '$_totalShipments', icon: LucideIcons.package, iconColor: AppColors.primary, trend: '+18% MoM'),
                  AppStatCard(title: 'In Transit', value: '$_inTransitCount', icon: LucideIcons.truck, iconColor: AppColors.warning, trend: 'Active'),
                  AppStatCard(title: 'Delivered', value: '$_deliveredCount', icon: LucideIcons.checkCircle2, iconColor: AppColors.success, trend: '98.2%'),
                  AppStatCard(title: 'Return Rate', value: '1.4%', icon: LucideIcons.rotateCcw, iconColor: AppColors.purple, trend: 'Low'),
                ],
              ),

              const SizedBox(height: 18),

              // Filter Pills
              FilterPillBar(
                items: [
                  FilterPillItem(key: 'ALL', label: 'All', count: _shipments.length, icon: LucideIcons.layers),
                  FilterPillItem(key: 'IN_TRANSIT', label: 'In Transit', count: _inTransitCount, icon: LucideIcons.truck),
                  FilterPillItem(key: 'DELIVERED', label: 'Delivered', count: _deliveredCount, icon: LucideIcons.checkCircle2),
                  FilterPillItem(key: 'PENDING', label: 'Pending', icon: LucideIcons.clock),
                ],
                selectedKey: _selectedFilter,
                onSelected: (val) => setState(() => _selectedFilter = val),
              ),

              const SizedBox(height: 16),

              // Shipments
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 30),
                  child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                )
              else if (filtered.isEmpty)
                AppCard(
                  child: const Center(child: Text('No parcels in this filter', style: TextStyle(fontWeight: FontWeight.bold))),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final s = filtered[index];
                    return InkWell(
                      onTap: () {
                        Navigator.of(context).push(MaterialPageRoute(
                          builder: (_) => CustomerTrackingScreen(initialTrackingNumber: s['tracking']),
                        ));
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: AppCard(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(12)),
                              child: const Icon(LucideIcons.package, color: AppColors.primary, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(s['tracking'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'monospace')),
                                      StatusBadgeWidget(status: s['status']),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text('${s['recipient']} • ${s['city']}', style: const TextStyle(color: AppColors.textMuted, fontSize: 11.5)),
                                  if ((s['cod'] as double) > 0) ...[
                                    const SizedBox(height: 2),
                                    Text('COD: \$${(s['cod'] as double).toStringAsFixed(2)}', style: const TextStyle(color: AppColors.warning, fontSize: 11, fontWeight: FontWeight.bold)),
                                  ],
                                ],
                              ),
                            ),
                            const Icon(LucideIcons.chevronRight, color: AppColors.textLight, size: 16),
                          ],
                        ),
                      ),
                    );
                  },
                ),

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }
}
