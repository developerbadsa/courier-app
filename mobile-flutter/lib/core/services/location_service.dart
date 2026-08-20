import 'dart:async';
import 'package:flutter/services.dart';
import '../constants/api_constants.dart';
import '../network/dio_client.dart';

/// Native GPS service using Android/iOS platform channels.
/// No geolocator dependency — direct MethodChannel communication.
class LocationService {
  final DioClient _client;
  final MethodChannel _channel = const MethodChannel('com.shohnaat/gps');
  StreamSubscription? _timerSubscription;
  bool _isTracking = false;
  DateTime? _lastBroadcast;
  double _lastLat = 0;
  double _lastLng = 0;
  String? _riderId;

  static const int _minIntervalSeconds = 10;

  LocationService({DioClient? client}) : _client = client ?? DioClient();

  bool get isTracking => _isTracking;
  double get lastLat => _lastLat;
  double get lastLng => _lastLng;

  /// Request location permission via native channel
  Future<bool> handleLocationPermission() async {
    try {
      final result = await _channel.invokeMethod('requestPermission');
      return result == true;
    } catch (_) {
      return false;
    }
  }

  /// Get current one-time GPS coordinates
  Future<Map<String, double>?> getCurrentLocation() async {
    try {
      final result = await _channel.invokeMethod('getCurrentLocation');
      if (result is Map) {
        return {
          'latitude': (result['latitude'] ?? 0).toDouble(),
          'longitude': (result['longitude'] ?? 0).toDouble(),
        };
      }
    } catch (_) {}
    return null;
  }

  /// Start continuous GPS broadcasting.
  /// Uses native platform timer for background efficiency.
  Future<bool> startLiveTracking({required String riderId}) async {
    final hasPermission = await handleLocationPermission();
    if (!hasPermission) return false;

    _isTracking = true;
    _riderId = riderId;

    // Start native GPS updates (platform handles background)
    try {
      await _channel.invokeMethod('startTracking', {
        'intervalSeconds': _minIntervalSeconds,
        'distanceFilter': 15,
      });
    } catch (_) {}

    // Listen for location updates from native side
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onLocationUpdate' && _isTracking) {
        final data = call.arguments as Map;
        final lat = (data['latitude'] ?? 0).toDouble();
        final lng = (data['longitude'] ?? 0).toDouble();
        final speed = (data['speed'] ?? 0).toDouble();
        final heading = (data['heading'] ?? 0).toDouble();

        await _broadcastCoordinates(
          latitude: lat,
          longitude: lng,
          speed: speed,
          heading: heading,
        );
      }
    });

    // Fallback polling if native channel doesn't deliver updates
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
        speed: 0,
        heading: 0,
      );
    }
  }

  /// Stop GPS tracking
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

    _lastLat = latitude;
    _lastLng = longitude;
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
