import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import '../constants/api_constants.dart';
import '../network/dio_client.dart';

/// Enterprise GPS telemetry service with full Android runtime permission flow
/// and continuous real-time broadcast to Shohnaat tracking backend.
class LocationService {
  final DioClient _client;
  StreamSubscription<Position>? _positionSubscription;
  bool _isTracking = false;
  DateTime? _lastBroadcast;
  double _lastLat = 0;
  double _lastLng = 0;
  String? _riderId;

  static const int _minIntervalSeconds = 8;

  LocationService({DioClient? client}) : _client = client ?? DioClient();

  bool get isTracking => _isTracking;
  double get lastLat => _lastLat;
  double get lastLng => _lastLng;

  /// Request runtime location permission and verify GPS service status.
  Future<bool> handleLocationPermission() async {
    try {
      // 1. Check if device location service (GPS) is turned on
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        await Geolocator.openLocationSettings();
        serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) return false;
      }

      // 2. Check location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        await Geolocator.openAppSettings();
        return false;
      }

      return permission == LocationPermission.always || permission == LocationPermission.whileInUse;
    } catch (e) {
      debugPrint('[LocationService] Permission check error: $e');
      return false;
    }
  }

  /// Get current one-time GPS coordinates
  Future<Map<String, double>?> getCurrentLocation() async {
    try {
      final hasPermission = await handleLocationPermission();
      if (!hasPermission) return null;

      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );

      _lastLat = position.latitude;
      _lastLng = position.longitude;

      return {
        'latitude': position.latitude,
        'longitude': position.longitude,
      };
    } catch (e) {
      debugPrint('[LocationService] getCurrentLocation error: $e');
      final lastKnown = await Geolocator.getLastKnownPosition();
      if (lastKnown != null) {
        return {
          'latitude': lastKnown.latitude,
          'longitude': lastKnown.longitude,
        };
      }
      return null;
    }
  }

  /// Start continuous real-time GPS broadcasting to backend.
  Future<bool> startLiveTracking({required String riderId}) async {
    final hasPermission = await handleLocationPermission();
    if (!hasPermission) return false;

    _isTracking = true;
    _riderId = riderId;

    // Send immediate initial coordinate
    getCurrentLocation().then((loc) {
      if (loc != null) {
        _broadcastCoordinates(
          latitude: loc['latitude']!,
          longitude: loc['longitude']!,
          speed: 0,
          heading: 0,
        );
      }
    });

    // Start live position stream
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10,
    );

    await _positionSubscription?.cancel();
    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen((Position position) {
      if (_isTracking) {
        _broadcastCoordinates(
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed,
          heading: position.heading,
        );
      }
    }, onError: (err) {
      debugPrint('[LocationService] Position stream error: $err');
    });

    return true;
  }

  /// Stop GPS tracking
  Future<void> stopLiveTracking() async {
    _isTracking = false;
    _riderId = null;
    await _positionSubscription?.cancel();
    _positionSubscription = null;
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
      // Offline sync queue handles retry
    }
  }
}
