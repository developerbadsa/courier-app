import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/status_badge_widget.dart';

class CameraBarcodeScannerScreen extends StatefulWidget {
  const CameraBarcodeScannerScreen({super.key});

  @override
  State<CameraBarcodeScannerScreen> createState() => _CameraBarcodeScannerScreenState();
}

class _CameraBarcodeScannerScreenState extends State<CameraBarcodeScannerScreen>
    with WidgetsBindingObserver, SingleTickerProviderStateMixin {
  MobileScannerController? _scannerController;
  final TextEditingController _manualBarcodeInput = TextEditingController();
  bool _isTorchOn = false;
  Map<String, dynamic>? _scannedResult;
  bool _isLookingUp = false;
  String? _lookupError;
  late AnimationController _animController;
  late Animation<double> _laserAnimation;
  bool _isDisposed = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
      torchEnabled: false,
    );

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _laserAnimation = Tween<double>(begin: 0.1, end: 0.9).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_scannerController == null || _isDisposed) return;
    if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      _scannerController?.stop();
    } else if (state == AppLifecycleState.resumed) {
      _scannerController?.start();
    }
  }

  void _onLookupScan(String barcode) async {
    final cleanCode = barcode.trim();
    if (cleanCode.isEmpty || _isLookingUp) return;

    setState(() { _isLookingUp = true; _lookupError = null; _scannedResult = null; });

    try {
      final client = DioClient();
      final response = await client.get('${ApiConstants.publicTracking}/$cleanCode');
      if (mounted) {
        final data = response.data?['data'];
        setState(() {
          _isLookingUp = false;
          _scannedResult = {
            'trackingNumber': data?['trackingNumber'] ?? cleanCode,
            'recipient': data?['consignee']?['name'] ?? 'Recipient',
            'address': data?['deliveryAddress']?['line1'] ?? data?['deliveryAddressSnap']?['street'] ?? 'Main Hub',
            'cod': (data?['codAmount'] ?? 0).toDouble(),
            'status': data?['currentStatus'] ?? 'IN_TRANSIT',
            'item': data?['packageDescription'] ?? 'Standard Package',
          };
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() { _isLookingUp = false; _lookupError = 'Parcel not found: $cleanCode'; });
      }
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    WidgetsBinding.instance.removeObserver(this);
    _animController.dispose();
    _scannerController?.dispose();
    _manualBarcodeInput.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Barcode Scanner', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.navy,
        actions: [
          IconButton(
            icon: Icon(_isTorchOn ? LucideIcons.zap : LucideIcons.zapOff,
                color: _isTorchOn ? Colors.amber : Colors.white),
            tooltip: 'Flashlight',
            onPressed: () async {
              await _scannerController?.toggleTorch();
              setState(() => _isTorchOn = !_isTorchOn);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Camera Viewport
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                if (_scannerController != null)
                  MobileScanner(
                    controller: _scannerController!,
                    errorBuilder: (context, error) {
                      return Container(
                        color: AppColors.navy,
                        padding: const EdgeInsets.all(24),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(LucideIcons.cameraOff, size: 54, color: AppColors.danger),
                              const SizedBox(height: 16),
                              const Text('Camera Permission Required', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              Text(error.errorDetails?.message ?? 'Allow camera permission to scan barcodes.',
                                  style: const TextStyle(color: AppColors.textLight, fontSize: 12), textAlign: TextAlign.center),
                              const SizedBox(height: 16),
                              AppButton(text: 'Retry', onPressed: () => _scannerController?.start()),
                            ],
                          ),
                        ),
                      );
                    },
                    onDetect: (BarcodeCapture capture) {
                      for (final barcode in capture.barcodes) {
                        final rawValue = barcode.rawValue;
                        if (rawValue != null && rawValue.isNotEmpty) {
                          _manualBarcodeInput.text = rawValue;
                          _onLookupScan(rawValue);
                          break;
                        }
                      }
                    },
                  ),

                // Overlay
                Positioned.fill(
                  child: Container(color: Colors.black.withValues(alpha: 0.45)),
                ),

                // Viewfinder
                Center(
                  child: SizedBox(
                    width: 270, height: 270,
                    child: Stack(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColors.primary, width: 2.5),
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        AnimatedBuilder(
                          animation: _laserAnimation,
                          builder: (context, child) {
                            return Positioned(
                              top: 270 * _laserAnimation.value,
                              left: 8, right: 8,
                              child: Container(
                                height: 3,
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [Colors.transparent, AppColors.primary, AppColors.cyanAccent, Colors.transparent],
                                  ),
                                  boxShadow: [
                                    BoxShadow(color: AppColors.primary.withValues(alpha: 0.8), blurRadius: 10, spreadRadius: 2),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // Hint
                Positioned(
                  bottom: 24,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.75),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.scan, color: AppColors.cyanAccent, size: 16),
                        SizedBox(width: 8),
                        Text('Align barcode within frame', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Bottom Results Drawer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 16, offset: Offset(0, -4))],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_isLookingUp)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                  )
                else if (_lookupError != null)
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.dangerLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.alertCircle, color: AppColors.danger, size: 18),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_lookupError!, style: const TextStyle(color: AppColors.danger, fontSize: 12, fontWeight: FontWeight.w600))),
                      ],
                    ),
                  )
                else if (_scannedResult != null)
                  AppCard(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(_scannedResult!['trackingNumber'],
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'monospace')),
                            StatusBadgeWidget(status: _scannedResult!['status']),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('${_scannedResult!['recipient']} — ${_scannedResult!['address']}',
                            style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted)),
                        if ((_scannedResult!['cod'] as double) > 0) ...[
                          const SizedBox(height: 4),
                          Text('COD: \$${(_scannedResult!['cod'] as double).toStringAsFixed(2)}',
                              style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.success)),
                        ],
                      ],
                    ),
                  ),

                const SizedBox(height: 12),

                // Manual Input
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _manualBarcodeInput,
                        decoration: InputDecoration(
                          hintText: 'Enter waybill/barcode #',
                          hintStyle: const TextStyle(color: AppColors.textLight, fontSize: 12.5),
                          prefixIcon: const Icon(LucideIcons.scanLine, size: 18, color: AppColors.textLight),
                          filled: true,
                          fillColor: AppColors.inputFill,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                        onSubmitted: _onLookupScan,
                      ),
                    ),
                    const SizedBox(width: 8),
                    AppButton(text: 'Search', icon: const Icon(LucideIcons.search, size: 16), isLoading: _isLookingUp, onPressed: () => _onLookupScan(_manualBarcodeInput.text.trim())),
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
