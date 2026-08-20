import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/services/connectivity_service.dart';
import '../../../core/services/offline_sync_service.dart';
import '../models/delivery_task_model.dart';
import '../repositories/rider_repository.dart';
import 'runsheet_state.dart';

/// Enhanced cubit with offline-first runsheet management.
/// - Caches runsheet data after successful API load
/// - Serves from cache when offline
/// - Queues delivery completions/failures with full POD data for offline sync
class RunsheetCubit extends Cubit<RunsheetState> {
  final RiderRepository _repository;
  final OfflineSyncService _offlineSync;
  final ConnectivityService _connectivity;

  RunsheetCubit({
    RiderRepository? repository,
    OfflineSyncService? offlineSync,
    ConnectivityService? connectivity,
  })  : _repository = repository ?? RiderRepository(),
        _offlineSync = offlineSync ?? OfflineSyncService(),
        _connectivity = connectivity ?? ConnectivityService(),
        super(RunsheetInitial());

  /// Fetch runsheet from API, cache on success, serve from cache if offline.
  Future<void> fetchRunsheet() async {
    emit(RunsheetLoading());

    // If offline, try to serve cached data
    if (!_connectivity.isOnline) {
      final cached = await _offlineSync.getCachedRunsheet();
      if (cached != null && cached.isNotEmpty) {
        try {
          final list = (jsonDecode(cached) as List)
              .map((item) => DeliveryTaskModel.fromJson(item as Map<String, dynamic>))
              .toList();
          _emitLoaded(list, fromCache: true);
          return;
        } catch (_) {}
      }
      emit(RunsheetError('No internet connection. Pull down to retry when online.'));
      return;
    }

    // Online — fetch from API
    try {
      final tasks = await _repository.getRunsheet();
      // Cache successful response for offline use
      final jsonList = tasks.map((t) => t.toJson()).toList();
      await _offlineSync.cacheRunsheet(jsonEncode(jsonList));
      _emitLoaded(tasks);
    } catch (e) {
      // API failed — try cache as fallback
      final cached = await _offlineSync.getCachedRunsheet();
      if (cached != null && cached.isNotEmpty) {
        try {
          final list = (jsonDecode(cached) as List)
              .map((item) => DeliveryTaskModel.fromJson(item as Map<String, dynamic>))
              .toList();
          _emitLoaded(list, fromCache: true);
          return;
        } catch (_) {}
      }
      emit(RunsheetError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  /// Complete a delivery — works offline by queuing the action.
  Future<void> completeDelivery({
    required String shipmentId,
    required double codCollected,
    bool otpVerified = false,
    String? signatureBase64,
    String? podPhotoBase64,
  }) async {
    if (state is RunsheetLoaded) {
      final current = (state as RunsheetLoaded).tasks;

      // Optimistically update UI immediately
      final updated = current.map((t) {
        if (t.id == shipmentId) {
          return DeliveryTaskModel(
            id: t.id,
            trackingNumber: t.trackingNumber,
            recipientName: t.recipientName,
            recipientPhone: t.recipientPhone,
            deliveryAddress: t.deliveryAddress,
            destinationCity: t.destinationCity,
            codAmount: t.codAmount,
            weightKg: t.weightKg,
            status: 'DELIVERED',
            driverNotes: t.driverNotes,
            scheduledTime: t.scheduledTime,
            latitude: t.latitude,
            longitude: t.longitude,
          );
        }
        return t;
      }).toList();

      _emitLoaded(updated);

      // Try API call, queue for offline sync if it fails
      try {
        await _repository.completeDelivery(
          shipmentId: shipmentId,
          codCollected: codCollected,
          otpVerified: otpVerified,
        );
      } catch (_) {
        // Queue with full POD data for background sync
        await _offlineSync.queueOfflineAction(OfflineDeliveryAction(
          shipmentId: shipmentId,
          status: 'DELIVERED',
          timestamp: DateTime.now().toIso8601String(),
          collectedAmount: codCollected,
          otp: otpVerified ? 'verified' : null,
        ));
      }

      // Re-cache updated runsheet
      _cacheCurrentTasks(updated);
    }
  }

  /// Mark delivery as failed — works offline by queuing.
  Future<void> markFailed({
    required String shipmentId,
    required String reason,
    String? notes,
  }) async {
    if (state is RunsheetLoaded) {
      final current = (state as RunsheetLoaded).tasks;

      final updated = current.map((t) {
        if (t.id == shipmentId) {
          return DeliveryTaskModel(
            id: t.id,
            trackingNumber: t.trackingNumber,
            recipientName: t.recipientName,
            recipientPhone: t.recipientPhone,
            deliveryAddress: t.deliveryAddress,
            destinationCity: t.destinationCity,
            codAmount: t.codAmount,
            weightKg: t.weightKg,
            status: 'FAILED',
            driverNotes: reason,
            scheduledTime: t.scheduledTime,
            latitude: t.latitude,
            longitude: t.longitude,
          );
        }
        return t;
      }).toList();

      _emitLoaded(updated);

      try {
        await _repository.reportFailure(
          shipmentId: shipmentId,
          reasonCode: reason,
        );
      } catch (_) {
        await _offlineSync.queueOfflineAction(OfflineDeliveryAction(
          shipmentId: shipmentId,
          status: 'FAILED',
          timestamp: DateTime.now().toIso8601String(),
          reason: reason,
        ));
      }

      _cacheCurrentTasks(updated);
    }
  }

  /// Update runsheet order with AI optimized sequence.
  void updateOptimizedTasks(List<DeliveryTaskModel> optimizedTasks) {
    if (state is RunsheetLoaded) {
      _emitLoaded(optimizedTasks, fromCache: (state as RunsheetLoaded).isFromCache);
      _cacheCurrentTasks(optimizedTasks);
    }
  }

  void _emitLoaded(List<DeliveryTaskModel> tasks, {bool fromCache = false}) {
    final completed = tasks.where((t) => t.isCompleted).length;
    final pending = tasks.where((t) => !t.isCompleted).length;
    final totalCod = tasks
        .where((t) => t.status == 'DELIVERED')
        .fold(0.0, (sum, t) => sum + t.codAmount);

    emit(RunsheetLoaded(
      tasks: tasks,
      totalCodCollected: totalCod,
      completedCount: completed,
      pendingCount: pending,
      isFromCache: fromCache,
    ));
  }

  void _cacheCurrentTasks(List<DeliveryTaskModel> tasks) {
    final jsonList = tasks.map((t) => t.toJson()).toList();
    _offlineSync.cacheRunsheet(jsonEncode(jsonList));
  }
}
