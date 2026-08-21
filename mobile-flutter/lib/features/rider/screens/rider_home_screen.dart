import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/connectivity_service.dart';
import '../../../core/services/location_service.dart';
import '../../../core/services/offline_sync_service.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_compliance_dialogs.dart';
import '../../../core/widgets/stats_card.dart';
import '../../../core/widgets/on_duty_toggle.dart';
import '../../../core/widgets/offline_banner.dart';
import '../../../core/widgets/modern_task_card.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../auth/cubit/auth_state.dart';
import '../../auth/screens/login_screen.dart';
import '../cubit/runsheet_cubit.dart';
import '../cubit/runsheet_state.dart';
import '../models/delivery_task_model.dart';
import '../services/ai_route_optimizer_service.dart';
import '../widgets/delivery_failure_modal.dart';
import '../widgets/cod_collection_modal.dart';
import 'task_detail_screen.dart';
import '../../scanner/screens/camera_barcode_scanner_screen.dart';

/// Modern Rider Home Screen — Light theme, clean cards, no double bottom nav
class RiderHomeScreen extends StatefulWidget {
  const RiderHomeScreen({super.key});

  @override
  State<RiderHomeScreen> createState() => _RiderHomeScreenState();
}

class _RiderHomeScreenState extends State<RiderHomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isOnDuty = true;
  bool _isGpsActive = false;
  int _offlineQueueCount = 0;
  final LocationService _locationService = LocationService();
  late final OfflineSyncService _offlineSyncService;
  late final ConnectivityService _connectivityService;
  bool _isOnline = true;
  StreamSubscription? _connectivitySub;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _connectivityService = context.read<ConnectivityService>();
    _offlineSyncService = OfflineSyncService(connectivity: _connectivityService);
    _isOnline = _connectivityService.isOnline;

    _connectivitySub = _connectivityService.onConnectivityChanged.listen((isOnline) {
      if (mounted) {
        setState(() => _isOnline = isOnline);
        if (isOnline) _syncOfflineQueue();
      }
    });

    _offlineSyncService.startAutoSync();
    context.read<RunsheetCubit>().fetchRunsheet();
    _checkOfflineQueue();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _connectivitySub?.cancel();
    _offlineSyncService.dispose();
    super.dispose();
  }

  Future<void> _checkOfflineQueue() async {
    final queue = await _offlineSyncService.getPendingQueue();
    if (mounted) setState(() => _offlineQueueCount = queue.length);
  }

  void _toggleGps(bool val) async {
    if (val) {
      final granted = await _locationService.handleLocationPermission();
      if (!granted) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please enable GPS Location permission in device settings.'), backgroundColor: AppColors.danger),
          );
        }
        return;
      }
      final riderId = context.read<AuthCubit>().state is Authenticated
          ? (context.read<AuthCubit>().state as Authenticated).user.id
          : 'rider-01';
      await _locationService.startLiveTracking(riderId: riderId);
      setState(() => _isGpsActive = true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Live GPS Telemetry Broadcast Started!'), backgroundColor: AppColors.success),
        );
      }
    } else {
      await _locationService.stopLiveTracking();
      setState(() => _isGpsActive = false);
    }
  }

  void _syncOfflineQueue() async {
    final synced = await _offlineSyncService.syncPendingQueue();
    await _checkOfflineQueue();
    if (mounted && synced > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$synced offline actions synced to server.'), backgroundColor: AppColors.success),
      );
    }
  }

  void _optimizeStops(List<DeliveryTaskModel> currentTasks) {
    final optimized = AiRouteOptimizerService.optimizeRoute(tasks: currentTasks);
    context.read<RunsheetCubit>().updateOptimizedTasks(optimized);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('AI Route Optimized!'), backgroundColor: AppColors.primary),
    );
  }

  void _handleDeliver(String taskId, double codAmount) {
    if (codAmount > 0) {
      showDialog(
        context: context,
        builder: (ctx) => CODCollectionModal(
          taskId: taskId,
          expectedAmount: codAmount,
          onConfirm: (amount) {
            context.read<RunsheetCubit>().markTaskDelivered(taskId);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Delivered | COD Collected: \$$amount'), backgroundColor: AppColors.success),
            );
          },
        ),
      );
    } else {
      context.read<RunsheetCubit>().markTaskDelivered(taskId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Delivery marked as completed'), backgroundColor: AppColors.success),
      );
    }
  }

  void _handleFailed(String taskId) {
    showDialog(
      context: context,
      builder: (ctx) => DeliveryFailureModal(
        taskId: taskId,
        onConfirm: (reasonCode, notes) {
          context.read<RunsheetCubit>().markTaskFailed(taskId);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Delivery Failed: $reasonCode'), backgroundColor: AppColors.danger),
          );
        },
      ),
    );
  }

  void _handlePOD(String taskId) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const CameraBarcodeScannerScreen()),
    );
  }

  void _onLogout() {
    context.read<AuthCubit>().logout();
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(),
      body: BlocBuilder<RunsheetCubit, RunsheetState>(
        builder: (context, state) {
          if (state is RunsheetLoading) {
            return const Center(child: CircularProgressIndicator(color: AppColors.primary));
          }

          if (state is RunsheetLoaded) {
            return Column(
              children: [
                // Compact Tab Bar
                Container(
                  color: AppColors.surface,
                  child: TabBar(
                    controller: _tabController,
                    labelColor: AppColors.primary,
                    unselectedLabelColor: AppColors.textMuted,
                    indicatorColor: AppColors.primary,
                    indicatorWeight: 3,
                    labelStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                    unselectedLabelStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500),
                    tabs: [
                      Tab(text: 'Active (${state.pendingCount})'),
                      Tab(text: 'Delivered (${state.completedCount})'),
                      Tab(text: 'Earnings'),
                    ],
                  ),
                ),
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildActiveTasksTab(state),
                      _buildHistoryTab(state),
                      _buildEarningsTab(state),
                    ],
                  ),
                ),
              ],
            );
          }

          return Center(
            child: AppButton(
              text: 'Retry Loading Runsheet',
              onPressed: () => context.read<RunsheetCubit>().fetchRunsheet(),
            ),
          );
        },
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: AppColors.navy,
      elevation: 0,
      title: const Row(
        children: [
          Icon(LucideIcons.bike, size: 20, color: Colors.white),
          SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Shohnaat Rider', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
              Text('Field Operations', style: TextStyle(color: AppColors.textLight, fontSize: 11, fontWeight: FontWeight.w500)),
            ],
          ),
        ],
      ),
      actions: [
        OnDutyToggle(
          isOnDuty: _isOnDuty,
          onChanged: (val) => setState(() => _isOnDuty = val),
        ),
        const SizedBox(width: 8),
        IconButton(
          icon: const Icon(LucideIcons.camera, color: Colors.white, size: 20),
          tooltip: 'Camera Scanner',
          onPressed: () {
            Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CameraBarcodeScannerScreen()));
          },
        ),
        PopupMenuButton<String>(
          icon: const Icon(LucideIcons.moreVertical, color: Colors.white, size: 20),
          onSelected: (value) {
            if (value == 'privacy') {
              AppComplianceDialogs.showPrivacyPolicy(context);
            } else if (value == 'delete_account') {
              AppComplianceDialogs.showAccountDeletionRequest(context, onConfirmDelete: () {
                _onLogout();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Account deletion request submitted.'), backgroundColor: AppColors.danger),
                );
              });
            } else if (value == 'logout') {
              _onLogout();
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'privacy',
              child: Row(children: [Icon(LucideIcons.shieldCheck, size: 16, color: AppColors.primary), SizedBox(width: 8), Text('Privacy Policy')]),
            ),
            const PopupMenuItem(
              value: 'delete_account',
              child: Row(children: [Icon(LucideIcons.trash2, size: 16, color: AppColors.danger), SizedBox(width: 8), Text('Delete Account', style: TextStyle(color: AppColors.danger))]),
            ),
            const PopupMenuDivider(),
            const PopupMenuItem(
              value: 'logout',
              child: Row(children: [Icon(LucideIcons.logOut, size: 16, color: AppColors.textMuted), SizedBox(width: 8), Text('Log Out')]),
            ),
          ],
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildActiveTasksTab(RunsheetLoaded state) {
    final tasks = state.activeTasks;

    return RefreshIndicator(
      onRefresh: () async {
        await context.read<RunsheetCubit>().fetchRunsheet();
        _checkOfflineQueue();
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Offline Banner
          OfflineBanner(isOnline: _isOnline, pendingCount: _offlineQueueCount, onSyncNow: _syncOfflineQueue),
          if (!_isOnline || _offlineQueueCount > 0) const SizedBox(height: 12),

          // GPS Status Card
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: _isGpsActive ? AppColors.success : AppColors.textLight,
                        shape: BoxShape.circle,
                        boxShadow: _isGpsActive ? [BoxShadow(color: AppColors.success.withValues(alpha: 0.4), blurRadius: 6)] : null,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isGpsActive ? 'GPS LIVE' : 'GPS STANDBY',
                          style: TextStyle(
                            color: _isGpsActive ? AppColors.success : AppColors.textSecondary,
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          _isGpsActive ? 'Broadcasting to customers' : 'Enable live tracking',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                        ),
                      ],
                    ),
                  ],
                ),
                Switch(
                  value: _isGpsActive,                    activeThumbColor: AppColors.success,
                  onChanged: _toggleGps,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Stats Cards
          Row(
            children: [
              Expanded(
                child: StatsCard(
                  label: 'PENDING',
                  value: '${state.pendingCount}',
                  backgroundColor: AppColors.primaryLight,
                  valueColor: AppColors.primary,
                  labelColor: AppColors.primary,
                  icon: LucideIcons.clipboardList,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: StatsCard(
                  label: 'COMPLETED',
                  value: '${state.completedCount}',
                  backgroundColor: AppColors.successLight,
                  valueColor: AppColors.success,
                  labelColor: AppColors.success,
                  icon: LucideIcons.checkCircle,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: StatsCard(
                  label: 'TOTAL COD',
                  value: '\$${state.totalCodCollected.toInt()}',
                  backgroundColor: AppColors.warningLight,
                  valueColor: AppColors.warning,
                  labelColor: AppColors.warning,
                  icon: LucideIcons.dollarSign,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // AI Optimize Button
          if (tasks.isNotEmpty)
            AppButton(
              text: 'AI Optimize Delivery Route',
              variant: AppButtonVariant.outline,
              isFullWidth: true,
              size: AppButtonSize.sm,
              icon: const Icon(LucideIcons.sparkles, size: 16, color: AppColors.primary),
              onPressed: () => _optimizeStops(tasks),
            ),
          const SizedBox(height: 20),

          // Task Cards
          if (tasks.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 50),
              child: const Column(
                children: [
                  Icon(LucideIcons.checkCheck, size: 52, color: AppColors.success),
                  SizedBox(height: 14),
                  Text('All Tasks Completed!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: AppColors.textPrimary)),
                  SizedBox(height: 4),
                  Text('Great job! No pending deliveries.', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                ],
              ),
            )
          else
            ...tasks.asMap().entries.map((entry) {
              final idx = entry.key + 1;
              final task = entry.value;
              return ModernTaskCard(
                task: task,
                stopNumber: idx,
                onDeliver: () => _handleDeliver(task.id, task.codAmount),
                onFailed: () => _handleFailed(task.id),
                onPOD: () => _handlePOD(task.id),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
                  );
                },
              );
            }),
        ],
      ),
    );
  }

  Widget _buildHistoryTab(RunsheetLoaded state) {
    final tasks = state.historyTasks;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (tasks.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(
              child: Text('No completed tasks yet today.', style: TextStyle(color: AppColors.textMuted)),
            ),
          )
        else
          ...tasks.map((task) => ModernTaskCard(
                task: task,
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
                  );
                },
              )),
      ],
    );
  }

  Widget _buildEarningsTab(RunsheetLoaded state) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // COD Wallet Card
          Container(
            padding: const EdgeInsets.all(24),
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
                const Text(
                  'CASH IN HAND (COD)',
                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                ),
                const SizedBox(height: 8),
                Text(
                  '\$${state.totalCodCollected.toStringAsFixed(2)} USD',
                  style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900, height: 1),
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Deposit at Hub End of Shift: \$${state.totalCodCollected.toStringAsFixed(2)}',
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Shift Summary Card
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Shift Performance', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.textPrimary)),
                const Divider(height: 24, color: AppColors.borderLight),
                _buildSummaryRow('Total Assigned Tasks', '${state.tasks.length} Parcels'),
                _buildSummaryRow('Delivered Successfully', '${state.completedCount} Parcels'),
                _buildSummaryRow('Pending Stops', '${state.pendingCount} Stops'),
                _buildSummaryRow(
                  'Success Rate',
                  '${state.tasks.isNotEmpty ? ((state.completedCount / state.tasks.length) * 100).toStringAsFixed(0) : 0}%',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 13, fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
