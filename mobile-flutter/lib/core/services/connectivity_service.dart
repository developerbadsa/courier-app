import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Monitors device connectivity and provides online/offline status.
/// Emits stream events when connectivity changes.
class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _controller = StreamController<bool>.broadcast();
  StreamSubscription? _subscription;
  bool _isOnline = true;

  /// Current online status
  bool get isOnline => _isOnline;

  /// Stream of connectivity changes (true = online, false = offline)
  Stream<bool> get onConnectivityChanged => _controller.stream;

  /// Initialize connectivity monitoring
  Future<void> init() async {
    final result = await _connectivity.checkConnectivity();
    _isOnline = result != ConnectivityResult.none;

    _subscription = _connectivity.onConnectivityChanged.listen((result) {
      final wasOnline = _isOnline;
      _isOnline = result != ConnectivityResult.none;
      if (wasOnline != _isOnline) {
        _controller.add(_isOnline);
      }
    });
  }

  /// Check connectivity on-demand (for manual refresh)
  Future<bool> checkConnectivity() async {
    final result = await _connectivity.checkConnectivity();
    _isOnline = result != ConnectivityResult.none;
    return _isOnline;
  }

  void dispose() {
    _subscription?.cancel();
    _controller.close();
  }
}
