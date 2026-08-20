import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_text_field.dart';
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
  List<dynamic> _statusHistory = [];
  bool _isSearching = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _trackingController = TextEditingController(
      text: widget.initialTracking ?? '',
    );
    if (widget.initialTracking != null && widget.initialTracking!.isNotEmpty) {
      _onSearch();
    }
  }

  Future<void> _onSearch() async {
    final query = _trackingController.text.trim();
    if (query.isEmpty) return;

    setState(() { _isSearching = true; _error = null; _parcelData = null; });

    try {
      final client = DioClient();
      final response = await client.get('${ApiConstants.publicTracking}/$query');

      if (mounted) {
        setState(() {
          _isSearching = false;
          _parcelData = response.data?['data'];
          _statusHistory = _parcelData?['statusHistory'] ?? [];
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSearching = false;
          _error = 'Tracking number not found or network error';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text('Track Parcel', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Search Bar
          AppCard(
            child: Row(
              children: [
                Expanded(
                  child: AppTextField(
                    label: 'Tracking Number',
                    controller: _trackingController,
                    icon: LucideIcons.search,
                    onSubmitted: (_) => _onSearch(),
                  ),
                ),
                const SizedBox(width: 8),
                AppButton(
                  label: 'Track',
                  icon: LucideIcons.arrowRight,
                  size: 'sm',
                  isLoading: _isSearching,
                  onPressed: _onSearch,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Results
          if (_isSearching)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            )
          else if (_error != null)
            AppCard(
              child: Center(
                child: Column(
                  children: [
                    const Icon(LucideIcons.alertTriangle, color: AppColors.danger, size: 24),
                    const SizedBox(height: 8),
                    Text(_error!, style: const TextStyle(fontSize: 12, color: AppColors.textMuted), textAlign: TextAlign.center),
                    const SizedBox(height: 8),
                    AppButton(text: 'Try Again', size: AppButtonSize.sm, onPressed: _onSearch),
                  ],
                ),
              ),
            )
          else if (_parcelData != null) ...[
            // Status Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Icon(LucideIcons.package, color: AppColors.primary, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _parcelData!['trackingNumber'] ?? 'N/A',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, fontFamily: 'monospace'),
                            ),
                            const SizedBox(height: 2),
                            StatusBadge(status: _parcelData!['currentStatus'] ?? 'UNKNOWN'),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildInfoRow('Consignee', _parcelData!['consignee']?['name'] ?? 'N/A'),
                  _buildInfoRow('Phone', _parcelData!['consignee']?['phone'] ?? 'N/A'),
                  _buildInfoRow('Address', _parcelData!['deliveryAddress']?['line1'] ?? _parcelData!['deliveryAddressSnap']?['street'] ?? 'N/A'),
                  if (_parcelData!['codAmount'] != null && (_parcelData!['codAmount'] as num) > 0)
                    _buildInfoRow('COD', '\$${_parcelData!['codAmount']} USD'),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Live Map
            if (_parcelData!['currentStatus'] == 'OUT_FOR_DELIVERY' || _parcelData!['currentStatus'] == 'IN_TRANSIT')
              AppCard(
                padding: EdgeInsets.zero,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: SizedBox(
                    height: 200,
                    child: LiveDeliveryMapView(
                      trackingNumber: _parcelData!['trackingNumber'] ?? '',
                      status: _parcelData!['currentStatus'] ?? '',
                    ),
                  ),
                ),
              ),

            if (_statusHistory.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Status History', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              ...(_statusHistory.reversed).map((entry) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: AppCard(
                  padding: const EdgeInsets.all(10),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _getStatusColor(entry['status'] ?? ''),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(entry['status'] ?? '', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                            if (entry['note'] != null)
                              Text(entry['note'], style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                      Text(
                        entry['createdAt'] != null
                          ? DateTime.tryParse(entry['createdAt'])?.toLocal().toString().substring(0, 16) ?? ''
                          : '',
                        style: const TextStyle(fontSize: 9, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
              )),
            ],
          ] else if (!_isSearching && _parcelData == null && _error == null)
            AppCard(
              child: Center(
                child: Column(
                  children: [
                    const Icon(LucideIcons.mapPin, color: AppColors.textMuted, size: 32),
                    const SizedBox(height: 8),
                    const Text('Enter a tracking number to get started', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Text('$label: ', style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 10, color: AppColors.textPrimary))),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'DELIVERED': return AppColors.success;
      case 'OUT_FOR_DELIVERY': return AppColors.info;
      case 'IN_TRANSIT': return AppColors.info;
      case 'FAILED': return AppColors.danger;
      case 'PENDING': return AppColors.warning;
      default: return AppColors.textMuted;
    }
  }

  @override
  void dispose() {
    _trackingController.dispose();
    super.dispose();
  }
}
