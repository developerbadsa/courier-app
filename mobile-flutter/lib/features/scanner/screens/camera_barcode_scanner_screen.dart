import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';

class CameraBarcodeScannerScreen extends StatefulWidget {
  const CameraBarcodeScannerScreen({super.key});

  @override
  State<CameraBarcodeScannerScreen> createState() =>
      _CameraBarcodeScannerScreenState();
}

class _CameraBarcodeScannerScreenState extends State<CameraBarcodeScannerScreen> {
  final TextEditingController _manualBarcodeInput = TextEditingController();
  bool _isTorchOn = false;
  Map<String, dynamic>? _scannedResult;
  bool _isLookingUp = false;
  String? _lookupError;

  void _onLookupScan(String barcode) async {
    if (barcode.isEmpty) return;
    setState(() { _isLookingUp = true; _lookupError = null; _scannedResult = null; });
    try {
      final client = DioClient();
      final response = await client.get('${ApiConstants.publicTracking}/$barcode');
      if (mounted) {
        final data = response.data?['data'];
        setState(() {
          _isLookingUp = false;
          _scannedResult = {
            'trackingNumber': data?['trackingNumber'] ?? barcode,
            'recipient': data?['consignee']?['name'] ?? 'Unknown',
            'address': data?['deliveryAddress']?['line1'] ?? '',
            'cod': data?['codAmount'] ?? 0,
            'status': data?['currentStatus'] ?? 'UNKNOWN',
            'item': data?['packageDescription'] ?? '',
          };
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() { _isLookingUp = false; _lookupError = 'Parcel not found: $barcode'; });
      }
    }
  }

  @override
  void dispose() {
    _manualBarcodeInput.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('High-Speed Parcel Scanner'),
        backgroundColor: AppColors.navyBackground,
        actions: [
          IconButton(
            icon: Icon(
              _isTorchOn ? LucideIcons.zap : LucideIcons.zapOff,
              color: _isTorchOn ? Colors.amber : Colors.white,
            ),
            onPressed: () => setState(() => _isTorchOn = !_isTorchOn),
          ),
        ],
      ),
      body: Column(
        children: [
          // Simulated Viewfinder Camera Stream
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  color: const Color(0xFF0F172A),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(LucideIcons.camera, size: 48, color: Colors.white.withOpacity(0.4)),
                        const SizedBox(height: 12),
                        Text(
                          'Point camera at parcel 4x6" label barcode',
                          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ),

                // Viewfinder Target Box
                Container(
                  width: 260,
                  height: 180,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.primary, width: 2.5),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Center(
                    child: Text(
                      'SCANNER TARGET',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Manual Barcode Input & Instant Lookup Sheet
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_lookupError != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFDC2626).withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.alertTriangle, size: 16, color: Color(0xFFDC2626)),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_lookupError!, style: const TextStyle(fontSize: 12, color: Color(0xFF991B1B)))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                if (_scannedResult != null) ...[
                  AppCard(
                    backgroundColor: AppColors.primaryLight,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _scannedResult!['trackingNumber'],
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primary),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: AppColors.success, borderRadius: BorderRadius.circular(4)),
                              child: const Text('MATCHED', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const Divider(height: 14),
                        Text('Recipient: ${_scannedResult!['recipient']}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        Text('Address: ${_scannedResult!['address']}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        const SizedBox(height: 4),
                        Text('COD: \$${_scannedResult!['cod']} USD', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFB45309), fontSize: 12.5)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                ],

                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _manualBarcodeInput,
                        decoration: InputDecoration(
                          hintText: 'Enter barcode number...',
                          prefixIcon: const Icon(LucideIcons.scanLine, size: 18),
                          filled: true,
                          fillColor: AppColors.background,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    AppButton(
                      text: 'Track',
                      icon: const Icon(LucideIcons.scanLine, size: 16),
                      isLoading: _isLookingUp,
                      onPressed: () => _onLookupScan(_manualBarcodeInput.text.trim()),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
