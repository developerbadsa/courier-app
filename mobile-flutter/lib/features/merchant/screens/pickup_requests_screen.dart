import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_text_field.dart';

class PickupRequestsScreen extends StatefulWidget {
  const PickupRequestsScreen({super.key});

  @override
  State<PickupRequestsScreen> createState() => _PickupRequestsScreenState();
}

class _PickupRequestsScreenState extends State<PickupRequestsScreen> {
  final TextEditingController _parcelCount = TextEditingController(text: '5');
  final TextEditingController _notes = TextEditingController();
  String _selectedSlot = 'Morning (9:00 AM – 12:00 PM)';
  String _vehicle = 'BIKE';
  bool _isSubmitting = false;

  void _onRequest() async {
    setState(() => _isSubmitting = true);
    try {
      final client = DioClient();
      await client.post(
        ApiConstants.pickups,
        data: {
          'parcelCount': int.tryParse(_parcelCount.text) ?? 1,
          'timeSlot': _selectedSlot,
          'vehicleType': _vehicle,
          'notes': _notes.text.trim(),
          'preferredDate': DateTime.now().toIso8601String().split('T')[0],
        },
      );
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pickup Request Scheduled!'), backgroundColor: AppColors.success),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: ${e.toString()}'), backgroundColor: AppColors.danger),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        title: const Text('Schedule Warehouse Pickup', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Pickup Details', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  const Divider(height: 20, color: AppColors.borderLight),
                  AppTextField(label: 'Estimated Parcel Count *', controller: _parcelCount, keyboardType: TextInputType.number),
                  const SizedBox(height: 14),

                  const Text('Time Slot', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedSlot,
                    items: const [
                      DropdownMenuItem(value: 'Morning (9:00 AM – 12:00 PM)', child: Text('Morning (9:00 AM – 12:00 PM)')),
                      DropdownMenuItem(value: 'Afternoon (1:00 PM – 4:00 PM)', child: Text('Afternoon (1:00 PM – 4:00 PM)')),
                      DropdownMenuItem(value: 'Evening (5:00 PM – 8:00 PM)', child: Text('Evening (5:00 PM – 8:00 PM)')),
                    ],
                    onChanged: (val) => setState(() => _selectedSlot = val!),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.inputFill,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const SizedBox(height: 14),

                  const Text('Preferred Vehicle', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _vehicle = 'BIKE'),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: _vehicle == 'BIKE' ? AppColors.primaryLight : AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: _vehicle == 'BIKE' ? AppColors.primary : AppColors.border),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.bike, size: 18, color: AppColors.primary),
                                SizedBox(width: 8),
                                Text('Motorcycle', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _vehicle = 'VAN'),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: _vehicle == 'VAN' ? AppColors.primaryLight : AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: _vehicle == 'VAN' ? AppColors.primary : AppColors.border),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.truck, size: 18, color: AppColors.primary),
                                SizedBox(width: 8),
                                Text('Cargo Van', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  AppTextField(label: 'Driver Instructions (Optional)', hint: 'Gate code, loading dock...', controller: _notes, maxLines: 2),
                ],
              ),
            ),
            const SizedBox(height: 24),
            AppButton(
              text: 'Submit Pickup Request',
              size: AppButtonSize.lg,
              isFullWidth: true,
              isLoading: _isSubmitting,
              icon: const Icon(LucideIcons.calendarCheck, size: 18),
              onPressed: _onRequest,
            ),
          ],
        ),
      ),
    );
  }
}
