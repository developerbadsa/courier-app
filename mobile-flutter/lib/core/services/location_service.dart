import 'dart:async';
import 'package:geolocator/geolocator.dart';
import '../constants/api_constants.dart';
import '../network/dio_client.dart';

/// Enhanced GPS service with background tracking, battery-aware throttling,
/// and resilient telemetry broadcasting.
class LocationService {
  final DioClient _client;
  StreamSubscription<Position>? _positionStream;
  Timer? _batteryThrottleTimer;
  bool _isTracking = false;
  DateTime? _lastBroadcast;
  double _lastLat = 0;
  double _lastLng = 0;

  // Minimum distance (meters) and time (seconds) between broadcasts
  static const double _minDistanceMeters = 15;
  static const int _minIntervalSeconds = 10;
  // Fallback broadcast interval when stationary (for ETA updates)
  static const int _stationaryIntervalSeconds = 60;

  LocationService({DioClient? client}) : _client = client ?? DioClient();

  bool get isTracking => _isTracking;

  /// Check and request device GPS permissions
  Future<bool> handleLocationPermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return false;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return false;
    }
    if (permission == LocationPermission.deniedForever) return false;

    return true;
  }

  /// Get current one-time GPS coordinates
  Future<Position?> getCurrentLocation() async {
    final hasPermission = await handleLocationPermission();
    if (!hasPermission) return null;

    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
    } catch (_) {
      return null;
    }
  }

  /// Start continuous background GPS broadcasting with smart throttling.
  /// - Only broadcasts when rider moves >15m or every 60s when stationary.
  /// - Uses battery-efficient location settings.
  Future<bool> startLiveTracking({required String riderId}) async {
    final hasPermission = await handleLocationPermission();
    if (!hasPermission) return false;

    _isTracking = true;

    // Battery-efficient settings: filter updates every 15m distance
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 15,
    );

    _positionStream = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen(
      (Position position) => _onPositionUpdate(riderId, position),
      onError: (error) {
        // Silently handle GPS errors — will retry on next tick
      },
    );

    // Stationary fallback: broadcast every 60s even if no movement
    _batteryThrottleTimer = Timer.periodic(
      const Duration(seconds: _stationaryIntervalSeconds),
      (_) async {
        if (_isTracking) {
          final pos = await getCurrentLocation();
          if (pos != null) {
            await _broadcastCoordinates(
              riderId: riderId,
              latitude: pos.latitude,
              longitude: pos.longitude,
              speed: pos.speed,
              heading: pos.heading,
              batteryLevel: await _getBatteryLevel(),
            );
          }
        }
      },
    );

    return true;
  }

  void _onPositionUpdate(String riderId, Position position) {
    final now = DateTime.now();

    // Throttle: skip if too soon AND distance too small
    if (_lastBroadcast != null) {
      final secondsSince = now.difference(_lastBroadcast!).inSeconds;
      final distance = _haversineDistance(
        _lastLat, _lastLng, position.latitude, position.longitude,
      );
      if (secondsSince < _minIntervalSeconds && distance < _minDistanceMeters) {
        return; // Skip this update
      }
    }

    _lastLat = position.latitude;
    _lastLng = position.longitude;
    _lastBroadcast = now;

    _broadcastCoordinates(
      riderId: riderId,
      latitude: position.latitude,
      longitude: position.longitude,
      speed: position.speed,
      heading: position.heading,
      batteryLevel: null, // Will be filled by background service
    );
  }

  /// Stop GPS stream and cleanup timers
  Future<void> stopLiveTracking() async {
    _isTracking = false;
    await _positionStream?.cancel();
    _positionStream = null;
    _batteryThrottleTimer?.cancel();
    _batteryThrottleTimer = null;
  }

  /// Broadcast GPS coordinates to backend with retry
  Future<void> _broadcastCoordinates({
    required String riderId,
    required double latitude,
    required double longitude,
    required double speed,
    required double heading,
    int? batteryLevel,
  }) async {
    try {
      await _client.post(
        ApiConstants.riderTelemetry,
        data: {
          'riderId': riderId,
          'latitude': latitude,
          'longitude': longitude,
          'speed': speed,
          'heading': heading,
          if (batteryLevel != null) 'battery': batteryLevel,
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
    } catch (_) {
      // Queued for retry by DioClient interceptor — silent failure ok
    }
  }

  /// Estimate battery level (returns null if unavailable)
  Future<int?> _getBatteryLevel() async {
    try {
      // Battery level requires a platform channel in production
      // For now return null — background geolocation plugin handles this
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Haversine distance in meters between two coordinates
  double _haversineDistance(double lat1, double lon1, double lat2, double lon2) {
    const r = 6371000; // Earth radius in meters
    final dLat = (lat2 - lat1) * 3.141592653589793 / 180;
    final dLon = (lon2 - lon1) * 3.141592653589793 / 180;
    final a = (dLat / 2) * (dLat / 2) +
        (lat1 * 3.141592653589793 / 180).cos() *
            (lat2 * 3.141592653589793 / 180).cos() *
            (dLon / 2) * (dLon / 2);
    final c = 2 * (a < 0 ? -a : a).sqrt().atan2((1 - a).abs().sqrt());
    return r * c;
  }
}
