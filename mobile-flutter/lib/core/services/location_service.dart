import 'dart:async';
import 'package:geolocator/geolocator.dart';
import '../constants/api_constants.dart';
import '../network/dio_client.dart';

class LocationService {
  final DioClient _client;
  StreamSubscription<Position>? _positionStream;
  bool _isTracking = false;

  LocationService({DioClient? client}) : _client = client ?? DioClient();

  bool get isTracking => _isTracking;

  /// Check and request device GPS permissions
  Future<bool> handleLocationPermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

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

  /// Start continuous background GPS broadcasting to backend API
  Future<bool> startLiveTracking({required String riderId}) async {
    final hasPermission = await handleLocationPermission();
    if (!hasPermission) return false;

    _isTracking = true;

    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10, // Updates every 10 meters
    );

    _positionStream = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen((Position position) async {
      await _broadcastCoordinates(
        riderId: riderId,
        latitude: position.latitude,
        longitude: position.longitude,
        speed: position.speed,
        heading: position.heading,
      );
    });

    return true;
  }

  /// Stop GPS stream
  Future<void> stopLiveTracking() async {
    await _positionStream?.cancel();
    _positionStream = null;
    _isTracking = false;
  }

  Future<void> _broadcastCoordinates({
    required String riderId,
    required double latitude,
    required double longitude,
    required double speed,
    required double heading,
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
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
    } catch (_) {
      // Ignored for resilience
    }
  }
}
