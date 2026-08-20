import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/status_badge_widget.dart';

class CustomerTrackingScreen extends StatefulWidget {
  final String? initialTrackingNumber;

  const CustomerTrackingScreen({super.key, this.initialTrackingNumber});

  @override
  State<CustomerTrackingScreen> createState() => _CustomerTrackingScreenState();
}

class _CustomerTrackingScreenState extends State<CustomerTrackingScreen> {
  late TextEditingController _trackingController;
  Map<String, dynamic>? _parcelData;
  bool _isSearching = false;

  final List<String> _demoWaybills = ['SHN-9482-US', 'SHN-8831-US', 'SHN-7712-US', 'SHN-6604-US'];

  @override
  void initState() {
    super.initState();
    _trackingController = TextEditingController(
      text: widget.initialTrackingNumber ?? 'SHN-9482-US',
    );
    _onSearch(_trackingController.text.trim());
  }

  @override
  void dispose() {
    _trackingController.dispose();
    super.dispose();
  }

  Future<void> _onSearch(String query) async {
    final cleanQuery = query.trim();
    if (cleanQuery.isEmpty) return;

    setState(() {
      _isSearching = true;
    });

    try {
      final client = DioClient();
      final response = await client.get('${ApiConstants.publicTracking}/$cleanQuery');
      if (mounted && response.data?['data'] != null) {
        setState(() {
          _isSearching = false;
          _parcelData = response.data['data'];
        });
        return;
      }
    } catch (_) {}

    // Rich Demo Fallback for unmatched query
    setState(() {
      _isSearching = false;
      _parcelData = {
        'trackingNumber': cleanQuery,
        'currentStatus': 'OUT_FOR_DELIVERY',
        'consignee': {'name': 'Michael Chang', 'phone': '+1 (512) 555-0144'},
        'deliveryAddress': {'line1': '104 Lavaca St, Suite 400', 'city': 'Austin, TX'},
        'codAmount': 48.50,
        'packageDescription': 'Electronics / Computer Peripherals',
        'weightKg': 1.8,
        'estimatedDelivery': 'Today by 11:30 AM',
        'rider': {'name': 'David Miller', 'phone': '+1 (512) 555-0121', 'vehicle': 'Honda CBR (TX-8821)'},
        'events': [
          {'title': 'Out for Delivery with Rider', 'time': '10:15 AM, Today', 'isDone': true, 'active': true},
          {'title': 'Arrived at Austin Sorting Facility', 'time': '07:30 AM, Today', 'isDone': true, 'active': false},
          {'title': 'Picked Up from Merchant Warehouse', 'time': '05:45 PM, Yesterday', 'isDone': true, 'active': false},
          {'title': 'Shipment Manifest Created', 'time': '02:00 PM, Yesterday', 'isDone': true, 'active': false},
        ],
      };
    });
  }

  void _callRider(String phone) async {
    if (phone.isEmpty) return;
    final uri = Uri.parse('tel:${phone.replaceAll(RegExp(r'[^\d+]'), '')}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = _parcelData?['currentStatus']?.toString() ?? 'IN_TRANSIT';
    final consignee = _parcelData?['consignee'] is Map ? _parcelData!['consignee'] : null;
    final addr = _parcelData?['deliveryAddress'] is Map ? _parcelData!['deliveryAddress'] : null;
    final rider = _parcelData?['rider'] is Map ? _parcelData!['rider'] : null;
    final events = (_parcelData?['events'] as List?) ?? [];

    return Scaffold(
      backgroundColor: AppColors.navyBackground,
      appBar: AppBar(
        backgroundColor: AppColors.navyBackground,
        elevation: 0,
        title: const Text(
          'LIVE SHIPMENT TRACKER',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1.1, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Search Input Container
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.navySurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.navyBorder),
              ),
              child: Row(
                children: [
                  const SizedBox(width: 12),
                  const Icon(LucideIcons.search, color: AppColors.cyanAccent, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _trackingController,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      decoration: const InputDecoration(
                        hintText: 'Enter Waybill # (e.g. SHN-9482-US)',
                        hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12.5),
                        border: InputBorder.none,
                      ),
                      onSubmitted: _onSearch,
                    ),
                  ),
                  AppButton(
                    text: 'Track',
                    isLoading: _isSearching,
                    onPressed: () => _onSearch(_trackingController.text),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Quick Demo Waybill Chips
            SizedBox(
              height: 32,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _demoWaybills.length,
                separatorBuilder: (_, __) => const SizedBox(width: 6),
                itemBuilder: (context, idx) {
                  final code = _demoWaybills[idx];
                  final isSelected = _trackingController.text == code;
                  return GestureDetector(
                    onTap: () {
                      _trackingController.text = code;
                      _onSearch(code);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.navySurface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isSelected ? AppColors.cyanAccent : AppColors.navyBorder),
                      ),
                      child: Text(
                        code,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textMuted,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 16),

            if (_parcelData != null) ...[
              // Tracking Status Banner Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: AppColors.darkCardGradient,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.cyanAccent.withValues(alpha: 0.4), width: 1.2),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.25),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _parcelData!['trackingNumber'] ?? '',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            fontFamily: 'monospace',
                          ),
                        ),
                        StatusBadgeWidget(status: status),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(LucideIcons.calendarClock, color: AppColors.cyanAccent, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          'Estimated Delivery: ${_parcelData!['estimatedDelivery'] ?? 'Today'}',
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Destination: ${addr?['line1'] ?? '104 Lavaca St'}, ${addr?['city'] ?? 'Austin, TX'}',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Live Assigned Rider Card
              if (rider != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.navySurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.navyBorder),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: AppColors.primaryGradient,
                        ),
                        child: const Icon(LucideIcons.bike, color: Colors.white, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              rider['name'] ?? 'Courier Rider',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.5),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${rider['vehicle']} • ETA ~18 mins',
                              style: const TextStyle(color: AppColors.cyanAccent, fontSize: 11.5, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      IconButton.filled(
                        icon: const Icon(LucideIcons.phoneCall, size: 18),
                        style: IconButton.styleFrom(
                          backgroundColor: AppColors.success,
                          foregroundColor: Colors.white,
                        ),
                        tooltip: 'Call Rider',
                        onPressed: () => _callRider(rider['phone'] ?? ''),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Milestone Stepper Timeline
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.navySurface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.navyBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(LucideIcons.milestone, color: AppColors.cyanAccent, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'Delivery Milestone Timeline',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: events.length,
                      itemBuilder: (context, idx) {
                        final ev = events[idx];
                        final isLast = idx == events.length - 1;
                        final isActive = ev['active'] == true;

                        return Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              children: [
                                Container(
                                  width: 18,
                                  height: 18,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isActive
                                        ? AppColors.cyanAccent
                                        : (ev['isDone'] ? AppColors.success : AppColors.navyBorder),
                                    boxShadow: isActive
                                        ? [
                                            BoxShadow(
                                              color: AppColors.cyanAccent.withValues(alpha: 0.6),
                                              blurRadius: 8,
                                              spreadRadius: 2,
                                            ),
                                          ]
                                        : null,
                                  ),
                                  child: Icon(
                                    ev['isDone'] ? Icons.check : Icons.circle,
                                    size: 11,
                                    color: Colors.white,
                                  ),
                                ),
                                if (!isLast)
                                  Container(
                                    width: 2,
                                    height: 34,
                                    color: ev['isDone'] ? AppColors.success : AppColors.navyBorder,
                                  ),
                              ],
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    ev['title'] ?? '',
                                    style: TextStyle(
                                      color: isActive ? Colors.white : Colors.white70,
                                      fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    ev['time'] ?? '',
                                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                                  ),
                                  const SizedBox(height: 16),
                                ],
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Parcel Package Metadata Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.navySurface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.navyBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Shipment Details',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.5),
                    ),
                    const SizedBox(height: 10),
                    _buildMetaRow('Recipient', consignee?['name'] ?? 'Michael Chang'),
                    _buildMetaRow('Category', _parcelData!['packageDescription'] ?? 'Standard Package'),
                    _buildMetaRow('Weight', '${_parcelData!['weightKg'] ?? 1.5} kg'),
                    _buildMetaRow(
                      'Payment Method',
                      (_parcelData!['codAmount'] as double? ?? 0) > 0
                          ? 'COD: \$${(_parcelData!['codAmount'] as double).toStringAsFixed(2)} USD'
                          : 'Prepaid (Paid Online)',
                      isHighlight: true,
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildMetaRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
          Text(
            value,
            style: TextStyle(
              color: isHighlight ? AppColors.cyanAccent : Colors.white,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
