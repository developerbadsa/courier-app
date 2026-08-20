import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_stat_card.dart';
import '../../../core/widgets/filter_pill_bar.dart';
import '../../../core/widgets/status_badge_widget.dart';
import '../../../core/services/location_service.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../auth/cubit/auth_state.dart';
import '../../scanner/screens/camera_barcode_scanner_screen.dart';
import '../cubit/runsheet_cubit.dart';
import '../cubit/runsheet_state.dart';
import '../models/delivery_task_model.dart';
import '../services/ai_route_optimizer_service.dart';
import '../widgets/pod_signature_modal.dart';
import '../widgets/cash_collection_modal.dart';
import 'task_detail_screen.dart';

class RiderHomeScreen extends StatefulWidget {
  const RiderHomeScreen({super.key});

  @override
  State<RiderHomeScreen> createState() => _RiderHomeScreenState();
}

class _RiderHomeScreenState extends State<RiderHomeScreen> {
  final LocationService _locationService = LocationService();
  final TextEditingController _searchController = TextEditingController();

  bool _isGpsActive = false;
  String _selectedFilter = 'ALL';
  bool _isOptimizing = false;

  @override
  void initState() {
    super.initState();
    context.read<RunsheetCubit>().fetchRunsheet();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _locationService.stopLiveTracking();
    super.dispose();
  }

  void _toggleGps(bool val) async {
    if (val) {
      final granted = await _locationService.handleLocationPermission();
      if (!granted) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please enable GPS Location permission in settings.'),
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
            content: Text('⚡ Live GPS Telemetry Broadcast Active!'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } else {
      await _locationService.stopLiveTracking();
      setState(() => _isGpsActive = false);
    }
  }

  void _runAiOptimizer(List<DeliveryTaskModel> tasks) async {
    setState(() => _isOptimizing = true);
    await Future.delayed(const Duration(milliseconds: 700));
    final sorted = AiRouteOptimizerService.optimizeRoute(
      tasks: tasks,
      hubLat: 30.2672,
      hubLng: -97.7431,
    );
    if (mounted) {
      context.read<RunsheetCubit>().updateOptimizedTasks(sorted);
      setState(() => _isOptimizing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✨ AI Route Optimizer: Sequence sorted for minimum fuel & time!'),
          backgroundColor: AppColors.primary,
        ),
      );
    }
  }

  void _openDialer(String phone) async {
    if (phone.isEmpty) return;
    final uri = Uri.parse('tel:${phone.replaceAll(RegExp(r'[^\d+]'), '')}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _openWhatsApp(String phone, String trackingNumber) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    final uri = Uri.parse(
        'https://wa.me/$cleanPhone?text=Hello,%20this%20is%20your%20Shohnaat%20courier%20rider%20for%20parcel%20$trackingNumber.%20I%20am%20arriving%20shortly.');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _openGoogleMaps(String address) async {
    final uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(address)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _openSignatureModal(DeliveryTaskModel task) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => PodSignatureModal(
        trackingNumber: task.trackingNumber,
        recipientName: task.recipientName,
        onConfirm: (otp) {
          context.read<RunsheetCubit>().completeDelivery(
                shipmentId: task.id,
                codCollected: task.codAmount,
                otpVerified: true,
              );
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('✅ Proof of Delivery recorded for ${task.trackingNumber}!'),
              backgroundColor: AppColors.success,
            ),
          );
        },
      ),
    );
  }

  void _openCashCollectionModal(DeliveryTaskModel task) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CashCollectionModal(
        expectedCod: task.codAmount,
        trackingNumber: task.trackingNumber,
        onCollect: (amount) {
          context.read<RunsheetCubit>().completeDelivery(
                shipmentId: task.id,
                codCollected: amount,
              );
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('💰 \$$amount COD Collected & Confirmed!'),
              backgroundColor: AppColors.success,
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navyBackground,
      appBar: AppBar(
        backgroundColor: AppColors.navyBackground,
        elevation: 0,
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                'assets/images/app_logo.png',
                width: 34,
                height: 34,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Icon(LucideIcons.truck, color: AppColors.cyanAccent, size: 24),
              ),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SHOHNAAT RIDER PRO',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.1,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Austin Central Dispatch Hub',
                  style: TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Barcode Camera Scan Trigger
          IconButton(
            icon: const Icon(LucideIcons.scanLine, color: AppColors.cyanAccent, size: 22),
            tooltip: 'Open Optical Scanner',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CameraBarcodeScannerScreen()),
              );
            },
          ),
          // Logout
          IconButton(
            icon: const Icon(LucideIcons.logOut, color: AppColors.textMuted, size: 20),
            tooltip: 'Sign Out',
            onPressed: () => context.read<AuthCubit>().logout(),
          ),
        ],
      ),
      body: BlocBuilder<RunsheetCubit, RunsheetState>(
        builder: (context, state) {
          final tasks = state is RunsheetLoaded ? state.tasks : <DeliveryTaskModel>[];
          final completedTasks = tasks.where((t) => t.isCompleted).length;
          final pendingTasks = tasks.where((t) => !t.isCompleted).length;
          final totalCod = tasks.where((t) => !t.isCompleted).fold(0.0, (sum, t) => sum + t.codAmount);

          final filteredTasks = tasks.where((t) {
            final query = _searchController.text.trim().toLowerCase();
            final matchesQuery = query.isEmpty ||
                t.trackingNumber.toLowerCase().contains(query) ||
                t.recipientName.toLowerCase().contains(query) ||
                t.deliveryAddress.toLowerCase().contains(query);

            if (!matchesQuery) return false;
            if (_selectedFilter == 'PENDING') return !t.isCompleted;
            if (_selectedFilter == 'COMPLETED') return t.isCompleted;
            if (_selectedFilter == 'OUT_FOR_DELIVERY') return t.isOutForDelivery;
            return true;
          }).toList();

          return RefreshIndicator(
            onRefresh: () async => context.read<RunsheetCubit>().fetchRunsheet(),
            color: AppColors.cyanAccent,
            backgroundColor: AppColors.navyCard,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Rider Shift & Live GPS Telemetry Ribbon
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: AppColors.darkCardGradient,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.navyBorder),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppColors.primaryGradient,
                          ),
                          child: const Icon(LucideIcons.bike, color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Shift Status: On Duty',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.5),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Real-time GPS broadcast to dispatcher',
                                style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        Switch(
                          value: _isGpsActive,
                          onChanged: _toggleGps,
                          activeThumbColor: AppColors.cyanAccent,
                          activeTrackColor: AppColors.primary,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // AI Route Optimizer Callout Banner
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1E3A8A), Color(0xFF0D9488)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(LucideIcons.sparkles, color: Colors.amberAccent, size: 18),
                            ),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'AI Route Optimizer',
                                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                  Text(
                                    'Multi-Stop Traveling Salesman Engine',
                                    style: TextStyle(color: Colors.white70, fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${tasks.length} Total Waypoints • ~45 min ETA',
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            ElevatedButton.icon(
                              onPressed: _isOptimizing ? null : () => _runAiOptimizer(tasks),
                              icon: _isOptimizing
                                  ? const SizedBox(
                                      width: 14,
                                      height: 14,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(LucideIcons.route, size: 14, color: AppColors.navyBackground),
                              label: Text(
                                _isOptimizing ? 'Sorting...' : 'Sort Best Path',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: AppColors.navyBackground),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // 4-Card KPI Stat Grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 1.6,
                    children: [
                      AppStatCard(
                        title: 'Total Run Stops',
                        value: '${tasks.length}',
                        icon: LucideIcons.package,
                        iconColor: AppColors.cyanAccent,
                        trend: '+12% today',
                      ),
                      AppStatCard(
                        title: 'Pending Dropoffs',
                        value: '$pendingTasks',
                        icon: LucideIcons.clock,
                        iconColor: AppColors.warning,
                        trend: 'Active',
                      ),
                      AppStatCard(
                        title: 'Delivered',
                        value: '$completedTasks',
                        icon: LucideIcons.checkCircle2,
                        iconColor: AppColors.success,
                        trend: '100% SLA',
                      ),
                      AppStatCard(
                        title: 'COD to Collect',
                        value: '\$${totalCod.toStringAsFixed(2)}',
                        icon: LucideIcons.banknote,
                        iconColor: Colors.amberAccent,
                        trend: 'Cash/POS',
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Search Bar
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.navySurface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.navyBorder),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (_) => setState(() {}),
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Search by tracking #, recipient, or address...',
                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12.5),
                        prefixIcon: const Icon(LucideIcons.search, color: AppColors.textMuted, size: 18),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(LucideIcons.x, color: AppColors.textMuted, size: 16),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() {});
                                },
                              )
                            : null,
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Filter Capsule Pills
                  FilterPillBar(
                    items: [
                      FilterPillItem(key: 'ALL', label: 'All Tasks', count: tasks.length, icon: LucideIcons.listFilter),
                      FilterPillItem(key: 'PENDING', label: 'Pending', count: pendingTasks, icon: LucideIcons.clock),
                      FilterPillItem(key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: LucideIcons.truck),
                      FilterPillItem(key: 'COMPLETED', label: 'Delivered', count: completedTasks, icon: LucideIcons.checkCircle2),
                    ],
                    selectedKey: _selectedFilter,
                    onSelected: (val) => setState(() => _selectedFilter = val),
                  ),

                  const SizedBox(height: 14),

                  // Runsheet Stops List
                  if (state is RunsheetLoading)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(child: CircularProgressIndicator(color: AppColors.cyanAccent)),
                    )
                  else if (filteredTasks.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: AppColors.navySurface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.navyBorder),
                      ),
                      child: const Center(
                        child: Column(
                          children: [
                            Icon(LucideIcons.packageCheck, size: 48, color: AppColors.textMuted),
                            SizedBox(height: 12),
                            Text(
                              'No delivery tasks found in this view',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: filteredTasks.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final task = filteredTasks[index];
                        return _buildTaskCard(task, index + 1);
                      },
                    ),

                  const SizedBox(height: 30),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTaskCard(DeliveryTaskModel task, int sequenceNumber) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            color: AppColors.navySurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: task.isCompleted
                  ? AppColors.success.withValues(alpha: 0.4)
                  : AppColors.navyBorder,
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card Header: Stop Sequence Badge + Tracking ID + Status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: AppColors.primaryGradient,
                    ),
                    child: Center(
                      child: Text(
                        '$sequenceNumber',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    task.trackingNumber,
                    style: const TextStyle(
                      color: Colors.white,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
              StatusBadgeWidget(status: task.status),
            ],
          ),

          const SizedBox(height: 10),

          // Recipient & Address
          Text(
            task.recipientName,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(LucideIcons.mapPin, color: AppColors.textMuted, size: 14),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  '${task.deliveryAddress}, ${task.destinationCity}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Time Slot & COD Ribbon
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(LucideIcons.clock, color: AppColors.cyanAccent, size: 13),
                  const SizedBox(width: 5),
                  Text(
                    task.scheduledTime ?? 'Standard Slot',
                    style: const TextStyle(color: AppColors.cyanAccent, fontSize: 11, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              if (task.codAmount > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.amber.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    'COD: \$${task.codAmount.toStringAsFixed(2)}',
                    style: const TextStyle(color: Colors.amberAccent, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.success.withValues(alpha: 0.4)),
                  ),
                  child: const Text(
                    'PREPAID',
                    style: TextStyle(color: AppColors.success, fontSize: 10.5, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),

          if (task.driverNotes != null && task.driverNotes!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.info, size: 13, color: AppColors.textMuted),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      task.driverNotes!,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontStyle: FontStyle.italic),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 12),

          // 1-Tap Quick Action Buttons (Call, WhatsApp, Maps, Deliver/Signature)
          Row(
            children: [
              // Call button
              IconButton.filledTonal(
                icon: const Icon(LucideIcons.phone, size: 16),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.navyCard,
                  foregroundColor: Colors.white,
                ),
                tooltip: 'Call Recipient',
                onPressed: () => _openDialer(task.recipientPhone),
              ),
              const SizedBox(width: 6),
              // WhatsApp button
              IconButton.filledTonal(
                icon: const Icon(LucideIcons.messageSquare, size: 16),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.navyCard,
                  foregroundColor: AppColors.success,
                ),
                tooltip: 'WhatsApp Message',
                onPressed: () => _openWhatsApp(task.recipientPhone, task.trackingNumber),
              ),
              const SizedBox(width: 6),
              // Google Maps Navigation
              IconButton.filledTonal(
                icon: const Icon(LucideIcons.navigation, size: 16),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.navyCard,
                  foregroundColor: AppColors.cyanAccent,
                ),
                tooltip: 'Navigate via Google Maps',
                onPressed: () => _openGoogleMaps('${task.deliveryAddress}, ${task.destinationCity}'),
              ),
              const Spacer(),

              // Primary Action: Signature / Deliver
              if (!task.isCompleted) ...[
                if (task.codAmount > 0)
                  ElevatedButton.icon(
                    onPressed: () => _openCashCollectionModal(task),
                    icon: const Icon(LucideIcons.banknote, size: 14, color: Colors.white),
                    label: const Text('Collect & Deliver', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: Colors.white)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber.shade700,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  )
                else
                  ElevatedButton.icon(
                    onPressed: () => _openSignatureModal(task),
                    icon: const Icon(LucideIcons.penTool, size: 14, color: Colors.white),
                    label: const Text('Sign (POD)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: Colors.white)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
              ] else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.success.withValues(alpha: 0.4)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.check, size: 14, color: AppColors.success),
                      SizedBox(width: 4),
                      Text('Completed', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 11.5)),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    ),
  ),
);
}
}
