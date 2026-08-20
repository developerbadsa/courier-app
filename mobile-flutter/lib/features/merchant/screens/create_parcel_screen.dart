import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_text_field.dart';

class CreateParcelScreen extends StatefulWidget {
  const CreateParcelScreen({super.key});

  @override
  State<CreateParcelScreen> createState() => _CreateParcelScreenState();
}

class _CreateParcelScreenState extends State<CreateParcelScreen> {
  final TextEditingController _recipientName = TextEditingController();
  final TextEditingController _recipientPhone = TextEditingController();
  final TextEditingController _deliveryAddress = TextEditingController();
  final TextEditingController _city = TextEditingController(text: 'Austin, TX');
  final TextEditingController _codAmount = TextEditingController(text: '0.00');
  final TextEditingController _weightKg = TextEditingController(text: '1.5');
  bool _isSubmitting = false;

  void _onSubmit() async {
    if (_recipientName.text.isEmpty || _deliveryAddress.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill recipient name and delivery address.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(seconds: 1)); // Simulated network request

    if (mounted) {
      setState(() => _isSubmitting = false);
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          title: const Row(
            children: [
              Icon(LucideIcons.checkCircle2, color: AppColors.success, size: 24),
              SizedBox(width: 8),
              Text('Shipment Created!'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Tracking Number:', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
              const Text(
                'SHN-9942-2026',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              const SizedBox(height: 12),
              Text('Recipient: ${_recipientName.text}'),
              Text('Address: ${_deliveryAddress.text}, ${_city.text}'),
              Text('COD: \$${_codAmount.text} USD'),
            ],
          ),
          actions: [
            AppButton(
              text: 'Done',
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Book New Parcel'),
        backgroundColor: AppColors.navyBackground,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Recipient Details Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Recipient Details', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  const Divider(height: 16),
                  AppTextField(
                    label: 'Recipient Full Name *',
                    hint: 'e.g. John Doe',
                    controller: _recipientName,
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    label: 'Recipient Phone *',
                    hint: 'e.g. +1-512-555-0100',
                    controller: _recipientPhone,
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    label: 'Delivery Address *',
                    hint: 'Street, House/Apt, Suite #',
                    controller: _deliveryAddress,
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    label: 'Destination City',
                    hint: 'Austin, TX',
                    controller: _city,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Parcel & Pricing Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Parcel Specs & COD', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  const Divider(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: AppTextField(
                          label: 'Weight (kg)',
                          controller: _weightKg,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: AppTextField(
                          label: 'Cash Collection (COD \$)',
                          controller: _codAmount,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            AppButton(
              text: 'Confirm & Generate Tracking Number',
              size: AppButtonSize.lg,
              isFullWidth: true,
              isLoading: _isSubmitting,
              icon: const Icon(LucideIcons.packagePlus, size: 18),
              onPressed: _onSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
