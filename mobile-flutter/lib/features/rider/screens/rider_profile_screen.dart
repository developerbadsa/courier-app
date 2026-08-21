import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/services/offline_sync_service.dart';
import '../../auth/cubit/auth_cubit.dart';

class RiderProfileScreen extends StatefulWidget {
  const RiderProfileScreen({super.key});

  @override
  State<RiderProfileScreen> createState() => _RiderProfileScreenState();
}

class _RiderProfileScreenState extends State<RiderProfileScreen> {
  final OfflineSyncService _offlineService = OfflineSyncService();
  bool _isOnDuty = true;
  bool _isBatterySaver = false;
  bool _isSyncing = false;

  void _forceSync() async {
    setState(() => _isSyncing = true);
    await Future.delayed(const Duration(milliseconds: 600));
    final synced = await _offlineService.syncPendingQueue();
    if (mounted) {
      setState(() => _isSyncing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Cloud Sync Complete: $synced offline actions synchronized!'), backgroundColor: AppColors.success),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        elevation: 0,
        title: const Text('Profile & Settings', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Rider ID Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: AppColors.primary.withValues(alpha: 0.25), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(LucideIcons.bike, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Michael Chang', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                        SizedBox(height: 2),
                        Text('ID: #RDR-081 • Senior Express Courier',
                            style: TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w600)),
                        SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(LucideIcons.star, color: Colors.amberAccent, size: 14),
                            SizedBox(width: 4),
                            Text('4.95 Rating (1,240 deliveries)',
                                style: TextStyle(color: Colors.white70, fontSize: 11)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Vehicle & Hub
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Vehicle & Dispatch', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 12),
                  _buildInfoRow(LucideIcons.truck, 'Assigned Vehicle', 'Honda CB500X (TX-8821)'),
                  _buildInfoRow(LucideIcons.building2, 'Dispatch Base', 'Austin Central Hub #4'),
                  _buildInfoRow(LucideIcons.phone, 'Dispatcher Hotline', '+1 (512) 555-9000'),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Shift & GPS Controls
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Shift & GPS Controls', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 10),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Active On Duty', style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Broadcast live telemetry to dispatch', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                    value: _isOnDuty,
                    activeThumbColor: AppColors.primary,
                    onChanged: (val) => setState(() => _isOnDuty = val),
                  ),
                  const Divider(color: AppColors.borderLight, height: 1),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Battery Saver GPS Mode', style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Reduces GPS ping interval to 30s', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                    value: _isBatterySaver,
                    activeThumbColor: AppColors.primary,
                    onChanged: (val) => setState(() => _isBatterySaver = val),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Cloud Sync
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Cloud Sync Engine', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: AppColors.successLight, borderRadius: BorderRadius.circular(8)),
                        child: const Text('Connected', style: TextStyle(color: AppColors.success, fontSize: 10.5, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Offline proof-of-delivery queue is active. All signatures and cash collections are safely stored during zero-connectivity.',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 11.5),
                  ),
                  const SizedBox(height: 14),
                  AppButton(
                    text: 'Force Re-sync',
                    isLoading: _isSyncing,
                    variant: AppButtonVariant.outline,
                    size: AppButtonSize.sm,
                    icon: const Icon(LucideIcons.refreshCw, size: 16, color: AppColors.primary),
                    onPressed: _forceSync,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            AppButton(
              text: 'Sign Out',
              variant: AppButtonVariant.danger,
              isFullWidth: true,
              icon: const Icon(LucideIcons.logOut, size: 16),
              onPressed: () => context.read<AuthCubit>().logout(),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 16),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
          const Spacer(),
          Text(value, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 12)),
        ],
      ),
    );
  }
}
