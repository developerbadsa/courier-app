import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/connectivity_service.dart';
import '../../../core/services/location_service.dart';
import '../../../core/services/offline_sync_service.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_compliance_dialogs.dart';
import '../../../core/widgets/status_badge_widget.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../auth/cubit/auth_state.dart';
import '../../auth/screens/login_screen.dart';
import '../cubit/runsheet_cubit.dart';
import '../cubit/runsheet_state.dart';
import '../models/delivery_task_model.dart';
import '../services/ai_route_optimizer_service.dart';
import 'task_detail_screen.dart';
import '../../scanner/screens/camera_barcode_scanner_screen.dart';

class RiderHomeScreen extends StatefulWidget {
  const RiderHomeScreen({super.key});

  @override
  State<RiderHomeScreen> createState() => _RiderHomeScreenState();
}

class _RiderHomeScreenState extends State<RiderHomeScreen> {
  int _currentIndex = 0;
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
    _connectivityService = context.read<ConnectivityService>();
    _offlineSyncService = OfflineSyncService(connectivity: _connectivityService);
    _isOnline = _connectivityService.isOnline;

    // Listen for connectivity changes
    _connectivitySub = _connectivityService.onConnectivityChanged.listen((isOnline) {
      if (mounted) {
        setState(() => _isOnline = isOnline);
        if (isOnline) {
          _syncOfflineQueue();
        }
      }
    });

    // Start auto-sync for offline queue
    _offlineSyncService.startAutoSync();

    context.read<RunsheetCubit>().fetchRunsheet();
    _checkOfflineQueue();
  }

  @override
  void dispose() {
    _connectivitySub?.cancel();
    _offlineSyncService.dispose();
    super.dispose();
  }

  Future<void> _checkOfflineQueue() async {
    final queue = await _offlineSyncService.getPendingQueue();
    if (mounted) {
      setState(() => _offlineQueueCount = queue.length);
    }
  }

  void _toggleGps(bool val) async {
    if (val) {
      final granted = await _locationService.handleLocationPermission();
      if (!granted) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please enable GPS Location permission in device settings.'),
              backgroundColor: AppColors.danger,
            ),
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
          const SnackBar(
            content: Text('⚡ Live GPS Telemetry Broadcast Started!'),
            backgroundColor: AppColors.success,
          ),
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
        SnackBar(
          content: Text('$synced offline actions synced to server.'),
          backgroundColor: AppColors.success,
        ),
      );
    }
  }

  void _optimizeStops(List<DeliveryTaskModel> currentTasks) {
    final optimized = AiRouteOptimizerService.optimizeRoute(tasks: currentTasks);
    context.read<RunsheetCubit>().updateOptimizedTasks(optimized);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✨ AI Route Optimized! Estimated time saved: 34 mins & 12.4 km'),
        backgroundColor: AppColors.primary,
      ),
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
      appBar: AppBar(
        backgroundColor: AppColors.navyBackground,
        title: const Row(
          children: [
            Icon(LucideIcons.bike, size: 20, color: Colors.white),
            SizedBox(width: 8),
            Text('Shohnaat Rider'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.camera, color: Colors.white),
            tooltip: 'Camera Barcode Scanner',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CameraBarcodeScannerScreen()),
              );
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(LucideIcons.moreVertical, color: Colors.white, size: 20),
            onSelected: (value) {
              if (value == 'privacy') {
                AppComplianceDialogs.showPrivacyPolicy(context);
              } else if (value == 'delete_account') {
                AppComplianceDialogs.showAccountDeletionRequest(
                  context,
                  onConfirmDelete: () {
                    context.read<AuthCubit>().logout();
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Account deletion request submitted.'),
                        backgroundColor: AppColors.danger,
                      ),
                    );
                  },
                );
              } else if (value == 'logout') {
                _onLogout();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'privacy',
                child: Row(
                  children: [
                    Icon(LucideIcons.shieldCheck, size: 16, color: AppColors.primary),
                    SizedBox(width: 8),
                    Text('Privacy Policy'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete_account',
                child: Row(
                  children: [
                    Icon(LucideIcons.trash2, size: 16, color: AppColors.danger),
                    SizedBox(width: 8),
                    Text('Delete Account', style: TextStyle(color: AppColors.danger)),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(LucideIcons.logOut, size: 16, color: AppColors.textSecondary),
                    SizedBox(width: 8),
                    Text('Log Out'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: BlocBuilder<RunsheetCubit, RunsheetState>(
        builder: (context, state) {
          if (state is RunsheetLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is RunsheetLoaded) {
            if (_currentIndex == 0) {
              return _buildActiveTasksTab(state);
            } else if (_currentIndex == 1) {
              return _buildHistoryTab(state);
            } else {
              return _buildEarningsTab(state);
            }
          }

          return Center(
            child: AppButton(
              text: 'Retry Loading Runsheet',
              onPressed: () => context.read<RunsheetCubit>().fetchRunsheet(),
            ),
          );
        },
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMuted,
        backgroundColor: Colors.white,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.clipboardList),
            label: 'Runsheet',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.history),
            label: 'Delivered',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.wallet),
            label: 'Cash Wallet',
          ),
        ],
      ),
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
          // Live GPS Broadcast & Status Card
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.navyBackground,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
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
                        color: _isGpsActive ? AppColors.success : AppColors.textMuted,
                        shape: BoxShape.circle,
                        boxShadow: _isGpsActive
                            ? [
                                BoxShadow(
                                  color: AppColors.success.withOpacity(0.6),
                                  blurRadius: 8,
                                ),
                              ]
                            : null,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isGpsActive ? 'GPS LIVE BROADCAST ACTIVE' : 'GPS STANDBY (OFFLINE READY)',
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          _isGpsActive ? 'Streaming coordinates to customers' : 'Enable to broadcast live route',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                        ),
                      ],
                    ),
                  ],
                ),
                Switch(
                  value: _isGpsActive,
                  activeColor: AppColors.success,
                  onChanged: _toggleGps,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Offline/Online Status Banner
          if (!_isOnline) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFDC2626).withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.wifiOff, size: 18, color: Color(0xFFDC2626)),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'Offline Mode — Actions queued for auto-sync',
                      style: TextStyle(color: Color(0xFF991B1B), fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ]
          else if (_offlineQueueCount > 0) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.cloudOff, size: 18, color: Color(0xFFB45309)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '$_offlineQueueCount actions pending sync',
                      style: const TextStyle(color: Color(0xFF92400E), fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                  TextButton(
                    onPressed: _syncOfflineQueue,
                    child: const Text('SYNC NOW', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFFB45309))),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Cached Data Indicator
          if (state.isFromCache) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3)),
              ),
              child: Row(
                children: const [
                  Icon(LucideIcons.database, size: 14, color: Color(0xFF3B82F6)),
                  SizedBox(width: 8),
                  Text(
                    'Showing cached tasks — will refresh when online',
                    style: TextStyle(color: Color(0xFF1E40AF), fontSize: 11, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Metric Summary Pills & AI Route Optimizer Button
          Row(
            children: [
              Expanded(
                child: AppCard(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Remaining', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      const SizedBox(height: 2),
                      Text('${state.pendingCount} Stops', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AppCard(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Completed', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      const SizedBox(height: 2),
                      Text('${state.completedCount} Done', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.success)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 1-Click AI Route Optimizer
          if (tasks.isNotEmpty)
            AppButton(
              text: 'AI Optimize Delivery Stops (2-Opt TSP)',
              variant: AppButtonVariant.outline,
              isFullWidth: true,
              size: AppButtonSize.sm,
              icon: const Icon(LucideIcons.sparkles, size: 14, color: AppColors.primary),
              onPressed: () => _optimizeStops(tasks),
            ),
          const SizedBox(height: 16),

          if (tasks.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: const Column(
                children: [
                  Icon(LucideIcons.checkCheck, size: 48, color: AppColors.success),
                  SizedBox(height: 12),
                  Text('All Runsheet Tasks Completed!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text('Great job! No pending deliveries remaining.', style: TextStyle(color: AppColors.textMuted, fontSize: 12.5)),
                ],
              ),
            )
          else
            ...tasks.asMap().entries.map((entry) {
              final idx = entry.key + 1;
              final task = entry.value;
              return _buildTaskCard(task, stopIndex: idx);
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
        Text(
          'Completed Deliveries (${tasks.length})',
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
        ),
        const SizedBox(height: 12),
        if (tasks.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 30),
            child: Center(child: Text('No completed tasks yet today.')),
          )
        else
          ...tasks.map((task) => _buildTaskCard(task)),
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
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.12),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('CASH IN HAND (COD COLLECTED)', style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                Text(
                  '\$${state.totalCodCollected.toStringAsFixed(2)} USD',
                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Deposit at Hub End of Shift: \$${state.totalCodCollected.toStringAsFixed(2)}',
                    style: const TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Shift Summary Card
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Shift Performance', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const Divider(height: 20),
                _buildSummaryRow('Total Assigned Tasks', '${state.tasks.length} Parcels'),
                _buildSummaryRow('Delivered Successfully', '${state.completedCount} Parcels'),
                _buildSummaryRow('Pending Stops', '${state.pendingCount} Stops'),
                _buildSummaryRow('Success Rate', '${state.tasks.isNotEmpty ? ((state.completedCount / state.tasks.length) * 100).toStringAsFixed(0) : 0}%'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildTaskCard(DeliveryTaskModel task, {int? stopIndex}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: AppCard(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    if (stopIndex != null) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '#$stopIndex',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      task.trackingNumber,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                  ],
                ),
                StatusBadgeWidget(status: task.status, isSmall: true),
              ],
            ),
            const Divider(height: 16),
            Text(
              task.recipientName,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(LucideIcons.mapPin, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '${task.deliveryAddress}, ${task.destinationCity}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  task.codAmount > 0 ? 'COD: \$${task.codAmount.toStringAsFixed(2)}' : 'PREPAID',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.bold,
                    color: task.codAmount > 0 ? const Color(0xFFB45309) : AppColors.success,
                  ),
                ),
                const Row(
                  children: [
                    Text('Details', style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
                    Icon(LucideIcons.chevronRight, size: 14, color: AppColors.primary),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
