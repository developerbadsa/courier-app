import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';
import '../network/dio_client.dart';

class OfflineDeliveryAction {
  final String shipmentId;
  final String status;
  final String timestamp;
  final double? collectedAmount;
  final String? otp;
  final String? reason;

  OfflineDeliveryAction({
    required this.shipmentId,
    required this.status,
    required this.timestamp,
    this.collectedAmount,
    this.otp,
    this.reason,
  });

  Map<String, dynamic> toJson() {
    return {
      'shipmentId': shipmentId,
      'status': status,
      'timestamp': timestamp,
      'collectedAmount': collectedAmount,
      'otp': otp,
      'reason': reason,
    };
  }

  factory OfflineDeliveryAction.fromJson(Map<String, dynamic> json) {
    return OfflineDeliveryAction(
      shipmentId: json['shipmentId'] ?? '',
      status: json['status'] ?? 'DELIVERED',
      timestamp: json['timestamp'] ?? DateTime.now().toIso8601String(),
      collectedAmount: json['collectedAmount'] != null ? (json['collectedAmount'] as num).toDouble() : null,
      otp: json['otp'],
      reason: json['reason'],
    );
  }
}

class OfflineSyncService {
  static const String _keyOfflineQueue = 'shohnaat_offline_action_queue';
  static const String _keyCachedRunsheet = 'shohnaat_cached_runsheet_data';

  final DioClient _client;
  SharedPreferences? _prefs;

  OfflineSyncService({DioClient? client}) : _client = client ?? DioClient();

  Future<void> _init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  /// Queue an action when device is offline
  Future<void> queueOfflineAction(OfflineDeliveryAction action) async {
    await _init();
    final queue = await getPendingQueue();
    queue.add(action);
    final jsonList = queue.map((a) => a.toJson()).toList();
    await _prefs!.setString(_keyOfflineQueue, jsonEncode(jsonList));
  }

  /// Retrieve all pending offline actions
  Future<List<OfflineDeliveryAction>> getPendingQueue() async {
    await _init();
    final raw = _prefs!.getString(_keyOfflineQueue);
    if (raw == null || raw.isEmpty) return [];
    try {
      final list = jsonDecode(raw) as List;
      return list.map((item) => OfflineDeliveryAction.fromJson(item as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  /// Synchronize all pending actions to PostgreSQL database
  Future<int> syncPendingQueue() async {
    final queue = await getPendingQueue();
    if (queue.isEmpty) return 0;

    int syncedCount = 0;
    List<OfflineDeliveryAction> remaining = [];

    for (final action in queue) {
      try {
        final response = await _client.patch(
          '${ApiConstants.updateShipmentStatus}/${action.shipmentId}/status',
          data: {
            'status': action.status,
            'collectedAmount': action.collectedAmount,
            'reason': action.reason,
            'syncedFromOffline': true,
          },
        );

        if (response.statusCode == 200 || response.statusCode == 201) {
          syncedCount++;
        } else {
          remaining.add(action);
        }
      } catch (_) {
        remaining.add(action);
      }
    }

    // Save remaining unsynced items
    await _init();
    if (remaining.isEmpty) {
      await _prefs!.remove(_keyOfflineQueue);
    } else {
      final jsonList = remaining.map((a) => a.toJson()).toList();
      await _prefs!.setString(_keyOfflineQueue, jsonEncode(jsonList));
    }

    return syncedCount;
  }

  /// Cache local runsheet for offline viewing
  Future<void> cacheRunsheet(String jsonRaw) async {
    await _init();
    await _prefs!.setString(_keyCachedRunsheet, jsonRaw);
  }

  /// Get cached runsheet
  Future<String?> getCachedRunsheet() async {
    await _init();
    return _prefs!.getString(_keyCachedRunsheet);
  }
}
