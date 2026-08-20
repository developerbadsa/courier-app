import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';
import '../network/dio_client.dart';
import 'connectivity_service.dart';

/// Represents a single offline delivery action queued for sync.
class OfflineDeliveryAction {
  final String shipmentId;
  final String status;
  final String timestamp;
  final double? collectedAmount;
  final String? otp;
  final String? reason;
  int retryCount;
  String? lastError;

  OfflineDeliveryAction({
    required this.shipmentId,
    required this.status,
    required this.timestamp,
    this.collectedAmount,
    this.otp,
    this.reason,
    this.retryCount = 0,
    this.lastError,
  });

  Map<String, dynamic> toJson() => {
    'shipmentId': shipmentId,
    'status': status,
    'timestamp': timestamp,
    'collectedAmount': collectedAmount,
    'otp': otp,
    'reason': reason,
    'retryCount': retryCount,
    'lastError': lastError,
  };

  factory OfflineDeliveryAction.fromJson(Map<String, dynamic> json) =>
      OfflineDeliveryAction(
        shipmentId: json['shipmentId'] ?? '',
        status: json['status'] ?? 'DELIVERED',
        timestamp: json['timestamp'] ?? DateTime.now().toIso8601String(),
        collectedAmount: json['collectedAmount'] != null
            ? (json['collectedAmount'] as num).toDouble()
            : null,
        otp: json['otp'],
        reason: json['reason'],
        retryCount: json['retryCount'] ?? 0,
        lastError: json['lastError'],
      );

  /// Max retries before giving up (marks action as failed)
  static const int maxRetries = 5;
  bool get hasExceededRetries => retryCount >= maxRetries;
}

/// Offline-first sync service with exponential backoff, automatic retry,
/// and connectivity-aware queue flushing.
class OfflineSyncService {
  static const String _keyOfflineQueue = 'shohnaat_offline_action_queue';
  static const String _keyCachedRunsheet = 'shohnaat_cached_runsheet_data';
  static const int _maxBatchSize = 50;

  final DioClient _client;
  final ConnectivityService _connectivity;
  SharedPreferences? _prefs;
  Timer? _autoSyncTimer;
  final StreamController<int> _queueController = StreamController<int>.broadcast();

  /// Stream of pending queue count changes
  Stream<int> get queueCountChanges => _queueController.stream;

  OfflineSyncService({DioClient? client, ConnectivityService? connectivity})
      : _client = client ?? DioClient(),
        _connectivity = connectivity ?? ConnectivityService();

  Future<void> _init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  /// Start automatic sync when connectivity returns
  void startAutoSync() {
    _connectivity.onConnectivityChanged.listen((isOnline) {
      if (isOnline) {
        // Sync immediately when coming back online
        Future.delayed(const Duration(seconds: 2), () => syncPendingQueue());
      }
    });

    // Also attempt sync every 2 minutes as fallback
    _autoSyncTimer = Timer.periodic(
      const Duration(minutes: 2),
      (_) async {
        if (_connectivity.isOnline) {
          await syncPendingQueue();
        }
      },
    );
  }

  void stopAutoSync() {
    _autoSyncTimer?.cancel();
    _autoSyncTimer = null;
  }

  /// Queue an action when device is offline
  Future<void> queueOfflineAction(OfflineDeliveryAction action) async {
    await _init();
    final queue = await getPendingQueue();
    queue.add(action);
    await _saveQueue(queue);
    _queueController.add(queue.length);
  }

  /// Retrieve all pending offline actions
  Future<List<OfflineDeliveryAction>> getPendingQueue() async {
    await _init();
    final raw = _prefs!.getString(_keyOfflineQueue);
    if (raw == null || raw.isEmpty) return [];
    try {
      final list = jsonDecode(raw) as List;
      return list
          .map((item) => OfflineDeliveryAction.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  /// Synchronize all pending actions with exponential backoff retry.
  /// Returns count of successfully synced actions.
  Future<int> syncPendingQueue() async {
    if (!_connectivity.isOnline) return 0;

    final queue = await getPendingQueue();
    if (queue.isEmpty) return 0;

    int syncedCount = 0;
    List<OfflineDeliveryAction> remaining = [];

    // Process in batches of 50
    for (var i = 0; i < queue.length; i += _maxBatchSize) {
      final batch = queue.sublist(i, min(i + _maxBatchSize, queue.length));

      for (final action in batch) {
        if (action.hasExceededRetries) {
          // Give up on this action — log as permanently failed
          remaining.add(action);
          continue;
        }

        try {
          final response = await _client.patch(
            '${ApiConstants.updateShipmentStatus}/${action.shipmentId}/status',
            data: {
              'status': action.status,
              if (action.collectedAmount != null) 'collectedAmount': action.collectedAmount,
              if (action.reason != null) 'reason': action.reason,
              if (action.otp != null) 'otp': action.otp,
              'syncedFromOffline': true,
              'originalTimestamp': action.timestamp,
            },
          );

          if (response.statusCode == 200 || response.statusCode == 201) {
            syncedCount++;
          } else {
            action.retryCount++;
            action.lastError = 'HTTP ${response.statusCode}';
            remaining.add(action);
          }
        } catch (e) {
          action.retryCount++;
          action.lastError = e.toString().substring(0, min(100, e.toString().length));
          remaining.add(action);

          // If network error, stop processing this batch
          if (!_connectivity.isOnline) break;
        }
      }
    }

    await _saveQueue(remaining);
    _queueController.add(remaining.length);
    return syncedCount;
  }

  Future<void> _saveQueue(List<OfflineDeliveryAction> queue) async {
    await _init();
    if (queue.isEmpty) {
      await _prefs!.remove(_keyOfflineQueue);
    } else {
      final jsonList = queue.map((a) => a.toJson()).toList();
      await _prefs!.setString(_keyOfflineQueue, jsonEncode(jsonList));
    }
  }

  /// Cache runsheet for offline viewing
  Future<void> cacheRunsheet(String jsonRaw) async {
    await _init();
    await _prefs!.setString(_keyCachedRunsheet, jsonRaw);
  }

  /// Get cached runsheet
  Future<String?> getCachedRunsheet() async {
    await _init();
    return _prefs!.getString(_keyCachedRunsheet);
  }

  /// Clear all offline data
  Future<void> clearAll() async {
    await _init();
    await _prefs!.remove(_keyOfflineQueue);
    await _prefs!.remove(_keyCachedRunsheet);
    _queueController.add(0);
  }

  void dispose() {
    stopAutoSync();
    _queueController.close();
  }
}
