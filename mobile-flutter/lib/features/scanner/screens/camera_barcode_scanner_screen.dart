import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';

class CameraBarcodeScannerScreen extends StatefulWidget {
  const CameraBarcodeScannerScreen({super.key});

  @override
  State<CameraBarcodeScannerScreen> createState() =>
      _CameraBarcodeScannerScreenState();
}

class _CameraBarcodeScannerScreenState extends State<CameraBarcodeScannerScreen> {
  final TextEditingController _manualBarcodeInput =
      TextEditingController(text: 'SHN-8429-2026');
  bool _isTorchOn = false;
  Map<String, dynamic>? _scannedResult;

  void _onSimulateScan(String barcode) {
    setState(() {
      _scannedResult = {
        'trackingNumber': barcode,
        'recipient': 'Michael Anderson',
        'address': '456 Congress Ave, Suite 400, Austin, TX',
        'cod': 45.00,
        'status': 'OUT_FOR_DELIVERY',
        'item': 'Electronics / Gadgets',
      };
    });
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
                          prefixIcon: const Icon(LucideIcons.barcode, size: 18),
                          filled: true,
                          fillColor: AppColors.background,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    AppButton(
                      text: 'Scan',
                      icon: const Icon(LucideIcons.scanLine, size: 16),
                      onPressed: () => _onSimulateScan(_manualBarcodeInput.text.trim()),
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
