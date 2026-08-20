class ApiConstants {
  // Base URLs (Switchable between local dev and live VPS)
  static const String liveBaseUrl = 'https://api-shohnaat.rahimbadsa.me';
  static const String localBaseUrl = 'http://10.0.2.2:5001'; // Android Emulator localhost
  static const String iosLocalBaseUrl = 'http://localhost:5001';

  // Active Base URL
  static const String baseUrl = liveBaseUrl;

  // Auth Endpoints
  static const String login = '/api/v1/auth/login';
  static const String register = '/api/v1/auth/register';
  static const String getMe = '/api/v1/auth/me';

  // Rider Endpoints
  static const String riderRunsheet = '/api/v1/riders/runsheet';
  static const String updateShipmentStatus = '/api/v1/shipments'; // PATCH /api/v1/shipments/:id/status
  static const String riderTelemetry = '/api/v1/tracking/telemetry';
  static const String optimizeRoute = '/api/v1/riders/optimize-route';

  // Merchant Endpoints
  static const String merchantShipments = '/api/v1/shipments';
  static const String createShipment = '/api/v1/shipments';
  static const String addresses = '/api/v1/addresses';
  static const String pickups = '/api/v1/pickups';

  // Finance Endpoints
  static const String financeSummary = '/api/v1/finance/summary';
  static const String financeLedger = '/api/v1/finance/ledger';
  static const String payoutRequest = '/api/v1/finance/payout-request';

  // Tracking Endpoints
  static const String publicTracking = '/api/v1/tracking';
}
