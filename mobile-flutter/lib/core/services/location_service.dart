import 'dart:async';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import '../constants/api_constants.dart';
import '../network/dio_client.dart';

/// GPS service using permission_handler for runtime permissions
/// and native MethodChannel for background location tracking.
class LocationService {
  final DioClient _client;
  final MethodChannel _channel = const MethodChannel('com.shohnaat/gps');
  StreamSubscription? _timerSubscription;
  bool _isTracking = false;
  DateTime? _lastBroadcast;
  String? _riderId;

  static const int _minIntervalSeconds = 10;

  LocationService({DioClient? client}) : _client = client ?? DioClient();

  bool get isTracking => _isTracking;

  /// Request location permission using permission_handler (runtime dialog)
  Future<bool> handleLocationPermission() async {
    var status = await Permission.location.status;

    if (status.isGranted) return true;

    // Request permission — shows system dialog
    status = await Permission.location.request();

    if (status.isGranted) return true;

    // If permanently denied, open app settings
    if (status.isPermanentlyDenied) {
      await openAppSettings();
      // Re-check after user returns from settings
      await Future.delayed(const Duration(seconds: 1));
      status = await Permission.location.status;
      return status.isGranted;
    }

    return false;
  }

  /// Get current one-time GPS coordinates
  Future<Map<String, double>?> getCurrentLocation() async {
    try {
      final result = await _channel.invokeMethod('getCurrentLocation');
      if (result is Map) {
        return {
          'latitude': (result['latitude'] ?? 0).toDouble(),
          'longitude': (result['longitude'] ?? 0).toDouble(),
          'speed': (result['speed'] ?? 0).toDouble(),
          'heading': (result['heading'] ?? 0).toDouble(),
        };
      }
    } catch (_) {}
    return null;
  }

  /// Start continuous GPS broadcasting
  Future<bool> startLiveTracking({required String riderId}) async {
    final hasPermission = await handleLocationPermission();
    if (!hasPermission) return false;

    _isTracking = true;
    _riderId = riderId;

    try {
      await _channel.invokeMethod('startTracking', {
        'intervalSeconds': _minIntervalSeconds,
        'distanceFilter': 15,
      });
    } catch (_) {}

    // Listen for native location updates
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onLocationUpdate' && _isTracking) {
        final data = call.arguments as Map;
        await _broadcastCoordinates(
          latitude: (data['latitude'] ?? 0).toDouble(),
          longitude: (data['longitude'] ?? 0).toDouble(),
          speed: (data['speed'] ?? 0).toDouble(),
          heading: (data['heading'] ?? 0).toDouble(),
        );
      }
    });

    // Fallback polling if native channel doesn't deliver
    _timerSubscription = Stream.periodic(
      const Duration(seconds: _minIntervalSeconds),
      (_) => _pollLocation(),
    ).listen((_) {});

    return true;
  }

  Future<void> _pollLocation() async {
    if (!_isTracking) return;
    final loc = await getCurrentLocation();
    if (loc != null) {
      await _broadcastCoordinates(
        latitude: loc['latitude']!,
        longitude: loc['longitude']!,
        speed: loc['speed']!,
        heading: loc['heading']!,
      );
    }
  }

  Future<void> stopLiveTracking() async {
    _isTracking = false;
    _riderId = null;
    await _timerSubscription?.cancel();
    _timerSubscription = null;
    try {
      await _channel.invokeMethod('stopTracking');
    } catch (_) {}
  }

  Future<void> _broadcastCoordinates({
    required double latitude,
    required double longitude,
    required double speed,
    required double heading,
  }) async {
    if (_riderId == null) return;

    final now = DateTime.now();
    if (_lastBroadcast != null &&
        now.difference(_lastBroadcast!).inSeconds < _minIntervalSeconds) {
      return;
    }
    _lastBroadcast = now;

    try {
      await _client.post(
        ApiConstants.riderTelemetry,
        data: {
          'riderId': _riderId,
          'latitude': latitude,
          'longitude': longitude,
          'speed': speed,
          'heading': heading,
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
    } catch (_) {
      // Queued for retry by DioClient interceptor
    }
  }
}
