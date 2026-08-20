import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_text_field.dart';

class CreateParcelScreen extends StatefulWidget {
  const CreateParcelScreen({super.key});

  @override
  State<CreateParcelScreen> createState() => _CreateParcelScreenState();
}

class _CreateParcelScreenState extends State<CreateParcelScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _recipientName = TextEditingController();
  final TextEditingController _recipientPhone = TextEditingController();
  final TextEditingController _deliveryAddress = TextEditingController();
  final TextEditingController _city = TextEditingController();
  final TextEditingController _codAmount = TextEditingController(text: '0.00');
  final TextEditingController _weightKg = TextEditingController(text: '1.5');
  final TextEditingController _notes = TextEditingController();
  bool _isSubmitting = false;
  String? _createdTracking;

  void _onSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final client = DioClient();
      final response = await client.post(
        ApiConstants.createShipment,
        data: {
          'consignee': {
            'name': _recipientName.text.trim(),
            'phone': _recipientPhone.text.trim(),
          },
          'deliveryAddress': {
            'line1': _deliveryAddress.text.trim(),
            'city': _city.text.trim(),
          },
          'codAmount': double.tryParse(_codAmount.text) ?? 0,
          'weightKg': double.tryParse(_weightKg.text) ?? 1.5,
          'serviceType': 'STANDARD',
          'paymentType': (double.tryParse(_codAmount.text) ?? 0) > 0 ? 'COD' : 'PREPAID',
          if (_notes.text.isNotEmpty) 'notes': _notes.text.trim(),
        },
      );

      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _createdTracking = response.data?['data']?['trackingNumber'] ?? 'Created';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create shipment: ${e.toString()}'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_createdTracking != null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          title: const Text('Shipment Created', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        ),
        body: Center(
          child: AppCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.successLight,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Icon(LucideIcons.checkCircle2, color: AppColors.success, size: 28),
                ),
                const SizedBox(height: 12),
                const Text('Shipment Created!', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                const Text('Tracking Number', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                const SizedBox(height: 4),
                Text(_createdTracking!, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.primary, fontFamily: 'monospace')),
                const SizedBox(height: 20),
                AppButton(
                  text: 'Create Another',
                  variant: AppButtonVariant.outline,
                  isFullWidth: true,
                  onPressed: () => setState(() {
                    _createdTracking = null;
                    _recipientName.clear();
                    _recipientPhone.clear();
                    _deliveryAddress.clear();
                    _city.clear();
                    _codAmount.text = '0.00';
                    _weightKg.text = '1.5';
                    _notes.clear();
                  }),
                ),
                const SizedBox(height: 8),
                AppButton(
                  text: 'Back to Dashboard',
                  isFullWidth: true,
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text('Create Parcel', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Recipient Info', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 12),
                  AppTextField(
                    label: 'Recipient Name',
                    controller: _recipientName,
                    prefixIcon: const Icon(LucideIcons.user, size: 18, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 10),
                  AppTextField(
                    label: 'Phone Number',
                    controller: _recipientPhone,
                    prefixIcon: const Icon(LucideIcons.phone, size: 18, color: AppColors.textMuted),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 10),
                  AppTextField(
                    label: 'Delivery Address',
                    controller: _deliveryAddress,
                    prefixIcon: const Icon(LucideIcons.mapPin, size: 18, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 10),
                  AppTextField(
                    label: 'City',
                    controller: _city,
                    prefixIcon: const Icon(LucideIcons.building, size: 18, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Package Details', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: AppTextField(
                          label: 'COD Amount (\$)',
                          controller: _codAmount,
                          prefixIcon: const Icon(LucideIcons.dollarSign, size: 18, color: AppColors.textMuted),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: AppTextField(
                          label: 'Weight (kg)',
                          controller: _weightKg,
                          prefixIcon: const Icon(LucideIcons.scale, size: 18, color: AppColors.textMuted),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  AppTextField(
                    label: 'Notes (optional)',
                    controller: _notes,
                    prefixIcon: const Icon(LucideIcons.fileText, size: 18, color: AppColors.textMuted),
                    maxLines: 2,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            AppButton(
              text: _isSubmitting ? 'Creating...' : 'Create Shipment',
              icon: _isSubmitting ? null : const Icon(LucideIcons.send, size: 18),
              isFullWidth: true,
              isLoading: _isSubmitting,
              onPressed: _isSubmitting ? null : _onSubmit,
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _recipientName.dispose();
    _recipientPhone.dispose();
    _deliveryAddress.dispose();
    _city.dispose();
    _codAmount.dispose();
    _weightKg.dispose();
    _notes.dispose();
    super.dispose();
  }
}
