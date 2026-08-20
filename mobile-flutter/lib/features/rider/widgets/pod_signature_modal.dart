import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:signature/signature.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';

class PodSignatureModal extends StatefulWidget {
  final String trackingNumber;
  final String recipientName;
  final Function(String otp) onConfirm;

  const PodSignatureModal({
    super.key,
    required this.trackingNumber,
    required this.recipientName,
    required this.onConfirm,
  });

  @override
  State<PodSignatureModal> createState() => _PodSignatureModalState();
}

class _PodSignatureModalState extends State<PodSignatureModal> {
  late SignatureController _signatureController;
  final TextEditingController _otpController = TextEditingController(text: '4892');
  bool _useOtp = false;

  @override
  void initState() {
    super.initState();
    _signatureController = SignatureController(
      penStrokeWidth: 3,
      penColor: Colors.black87,
      exportBackgroundColor: Colors.white,
    );
  }

  @override
  void dispose() {
    _signatureController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Proof of Delivery (POD)',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  Text(
                    widget.trackingNumber,
                    style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(LucideIcons.x, size: 20, color: AppColors.textMuted),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const Divider(height: 24),

          // Toggle Mode
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _useOtp = false),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: !_useOtp ? AppColors.primaryLight : AppColors.background,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: !_useOtp ? AppColors.primary : AppColors.border),
                    ),
                    child: Text(
                      'Digital Signature',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: !_useOtp ? AppColors.primary : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _useOtp = true),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: _useOtp ? AppColors.primaryLight : AppColors.background,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: _useOtp ? AppColors.primary : AppColors.border),
                    ),
                    child: Text(
                      '4-Digit OTP',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _useOtp ? AppColors.primary : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (!_useOtp) ...[
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border, width: 1.5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Signature(
                  controller: _signatureController,
                  height: 140,
                  backgroundColor: const Color(0xFFFAFAFA),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: () => _signatureController.clear(),
                icon: const Icon(LucideIcons.rotateCcw, size: 14, color: AppColors.textSecondary),
                label: const Text('Clear Signature', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ),
            ),
          ] else ...[
            TextFormField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 8),
              decoration: InputDecoration(
                hintText: '0000',
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 14),
          ],

          AppButton(
            text: 'Verify & Confirm Handover',
            isFullWidth: true,
            size: AppButtonSize.lg,
            icon: const Icon(LucideIcons.checkCircle2, size: 18),
            onPressed: () {
              Navigator.of(context).pop();
              widget.onConfirm(_otpController.text);
            },
          ),
        ],
      ),
    );
  }
}
