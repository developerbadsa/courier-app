import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/status_badge_widget.dart';
import '../widgets/live_delivery_map_view.dart';

class CustomerTrackingScreen extends StatefulWidget {
  final String? initialTracking;

  const CustomerTrackingScreen({super.key, this.initialTracking});

  @override
  State<CustomerTrackingScreen> createState() => _CustomerTrackingScreenState();
}

class _CustomerTrackingScreenState extends State<CustomerTrackingScreen> {
  late TextEditingController _trackingController;
  Map<String, dynamic>? _parcelData;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _trackingController = TextEditingController(
      text: widget.initialTracking ?? 'SHN-8429-2026',
    );
    _onSearch();
  }

  void _onSearch() async {
    final query = _trackingController.text.trim();
    if (query.isEmpty) return;

    setState(() => _isSearching = true);
    await Future.delayed(const Duration(milliseconds: 600));

    setState(() {
      _isSearching = false;
      _parcelData = {
        'trackingNumber': query,
        'status': 'OUT_FOR_DELIVERY',
        'estimatedDelivery': 'Today by 2:00 PM',
        'recipient': 'Michael Anderson',
        'destination': 'Austin, TX',
        'events': [
          {'title': 'Out for Delivery', 'desc': 'Rider Alex is on the way to your doorstep.', 'time': '10:15 AM Today', 'done': true},
          {'title': 'Arrived at Sorting Hub', 'desc': 'Austin Central Logistics Facility', 'time': '07:30 AM Today', 'done': true},
          {'title': 'Picked up from Warehouse', 'desc': 'Merchant Fulfillment Center #01', 'time': '08:00 PM Yesterday', 'done': true},
          {'title': 'Shipment Booked & Manifested', 'desc': 'Order confirmed with merchant.', 'time': '04:20 PM Yesterday', 'done': true},
        ],
      };
    });
  }

  @override
  void dispose() {
    _trackingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Live Parcel Tracking'),
        backgroundColor: AppColors.navyBackground,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Search Box
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _trackingController,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Enter tracking number...',
                      prefixIcon: const Icon(LucideIcons.search, size: 18),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                AppButton(
                  text: 'Track',
                  isLoading: _isSearching,
                  onPressed: _onSearch,
                ),
              ],
            ),
            const SizedBox(height: 18),

            if (_parcelData != null) ...[
              // Live Interactive Delivery Map
              const LiveDeliveryMapView(
                status: 'OUT_FOR_DELIVERY',
                riderName: 'Alex Rodriguez (Rider #104)',
                eta: '14 mins',
              ),
              const SizedBox(height: 16),

              // Status Summary Card
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _parcelData!['trackingNumber'],
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary),
                        ),
                        StatusBadgeWidget(status: _parcelData!['status']),
                      ],
                    ),
                    const Divider(height: 20),
                    Row(
                      children: [
                        const Icon(LucideIcons.clock, size: 16, color: AppColors.textMuted),
                        const SizedBox(width: 6),
                        Text(
                          'Estimated Delivery: ${_parcelData!['estimatedDelivery']}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(LucideIcons.mapPin, size: 16, color: AppColors.textMuted),
                        const SizedBox(width: 6),
                        Text(
                          'Destination: ${_parcelData!['destination']}',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Tracking Stepper Timeline
              const Text(
                'Activity Timeline',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 12),

              ...(_parcelData!['events'] as List).asMap().entries.map((entry) {
                final idx = entry.key;
                final event = entry.value;
                final isLast = idx == (_parcelData!['events'] as List).length - 1;

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: idx == 0 ? AppColors.primary : AppColors.success,
                            shape: BoxShape.circle,
                          ),
                        ),
                        if (!isLast)
                          Container(
                            width: 2,
                            height: 48,
                            color: AppColors.border,
                          ),
                      ],
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              event['title'],
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                            ),
                            Text(
                              event['desc'],
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              event['time'],
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}
