import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_stat_card.dart';
import '../../../core/widgets/app_card.dart';
import '../cubit/runsheet_cubit.dart';
import '../cubit/runsheet_state.dart';
import '../models/delivery_task_model.dart';

class RiderCodWalletScreen extends StatefulWidget {
  const RiderCodWalletScreen({super.key});

  @override
  State<RiderCodWalletScreen> createState() => _RiderCodWalletScreenState();
}

class _RiderCodWalletScreenState extends State<RiderCodWalletScreen> {
  void _showHubHandoverDialog(double pendingCash) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(shape: BoxShape.circle, gradient: AppColors.primaryGradient),
              child: const Icon(LucideIcons.qrCode, size: 36, color: Colors.white),
            ),
            const SizedBox(height: 16),
            const Text('Hub Dispatcher Handover QR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Text(
              'Cash to Hand Over: \$${pendingCash.toStringAsFixed(2)} USD',
              style: const TextStyle(color: AppColors.warning, fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 16),
            Container(
              width: 160,
              height: 160,
              decoration: BoxDecoration(
                color: AppColors.inputFill,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary, width: 2),
              ),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.scanLine, size: 72, color: AppColors.primary),
                    SizedBox(height: 8),
                    Text('SHN-HANDOVER-8821', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 10)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Show this QR code to the Hub Cashier to reconcile today\'s COD collection.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textMuted, fontSize: 11.5),
            ),
            const SizedBox(height: 20),
            AppButton(text: 'Close', onPressed: () => Navigator.pop(ctx)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        elevation: 0,
        title: const Row(
          children: [
            Icon(LucideIcons.wallet, color: AppColors.cyanAccent, size: 20),
            SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('COD Cash & Earnings', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
                Text('Daily Reconciliation', style: TextStyle(fontSize: 10, color: AppColors.textLight)),
              ],
            ),
          ],
        ),
      ),
      body: BlocBuilder<RunsheetCubit, RunsheetState>(
        builder: (context, state) {
          final tasks = state is RunsheetLoaded ? state.tasks : <DeliveryTaskModel>[];
          final completedCodTasks = tasks.where((t) => t.isCompleted && t.codAmount > 0).toList();
          final pendingCodTasks = tasks.where((t) => !t.isCompleted && t.codAmount > 0).toList();
          final double totalCollected = completedCodTasks.fold(0.0, (s, t) => s + t.codAmount) + 32.0;
          final double pendingCash = totalCollected;
          final double riderCommission = (tasks.where((t) => t.isCompleted).length * 8.50) + 12.0;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Hero Cash Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: AppColors.successGradient,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: AppColors.success.withValues(alpha: 0.25), blurRadius: 16, offset: const Offset(0, 6)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('COD Cash in Hand', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(LucideIcons.shieldCheck, size: 13, color: Colors.white),
                                SizedBox(width: 4),
                                Text('Cash Guard Active', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '\$${pendingCash.toStringAsFixed(2)} USD',
                        style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Commission Earned: +\$${riderCommission.toStringAsFixed(2)} USD',
                        style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => _showHubHandoverDialog(pendingCash),
                        icon: const Icon(LucideIcons.qrCode, size: 16, color: AppColors.navy),
                        label: const Text('Generate Handover QR', style: TextStyle(color: AppColors.navy, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // 4-Card Mini Stat Grid
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.6,
                  children: [
                    AppStatCard(
                      title: 'Total Collected',
                      value: '\$${totalCollected.toStringAsFixed(2)}',
                      icon: LucideIcons.banknote,
                      iconColor: AppColors.success,
                      trend: 'Today',
                    ),
                    AppStatCard(
                      title: 'Rider Pay',
                      value: '\$${riderCommission.toStringAsFixed(2)}',
                      icon: LucideIcons.trendingUp,
                      iconColor: AppColors.primary,
                      trend: 'Daily',
                    ),
                    AppStatCard(
                      title: 'Pending COD',
                      value: '${pendingCodTasks.length}',
                      icon: LucideIcons.clock,
                      iconColor: AppColors.warning,
                      trend: 'On Route',
                    ),
                    AppStatCard(
                      title: 'Settlement',
                      value: 'Open',
                      icon: LucideIcons.badgeCheck,
                      iconColor: AppColors.purple,
                      trend: 'Active',
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Recent Collections
                const Text("Today's Cash Collections", style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 10),

                if (completedCodTasks.isEmpty)
                  AppCard(
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: AppColors.successLight, borderRadius: BorderRadius.circular(12)),
                          child: const Icon(LucideIcons.checkCheck, color: AppColors.success, size: 20),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('SHN-6604-US • Emma Watson', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              Text('Collected at 09:15 AM (East Austin)', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                            ],
                          ),
                        ),
                        const Text('+\$32.00', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: completedCodTasks.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, idx) {
                      final t = completedCodTasks[idx];
                      return AppCard(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.badgeDollarSign, color: AppColors.success, size: 22),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('${t.trackingNumber} • ${t.recipientName}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                  Text(t.destinationCity, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                                ],
                              ),
                            ),
                            Text('+\$${t.codAmount.toStringAsFixed(2)}', style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 14)),
                          ],
                        ),
                      );
                    },
                  ),

                const SizedBox(height: 40),
              ],
            ),
          );
        },
      ),
    );
  }
}
