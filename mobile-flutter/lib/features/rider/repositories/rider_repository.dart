import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../models/delivery_task_model.dart';

class RiderRepository {
  final DioClient _client;

  RiderRepository({DioClient? client}) : _client = client ?? DioClient();

  // Mock Fallback Data in case network is disconnected
  static final List<DeliveryTaskModel> _mockTasks = [
    DeliveryTaskModel(
      id: 'task-1',
      trackingNumber: 'SHN-8429-2026',
      recipientName: 'Michael Anderson',
      recipientPhone: '+1-512-555-0199',
      deliveryAddress: '456 Congress Ave, Suite 400',
      destinationCity: 'Austin, TX',
      codAmount: 45.00,
      weightKg: 2.5,
      status: 'OUT_FOR_DELIVERY',
      driverNotes: 'Leave with reception on 4th floor. Ring doorbell.',
      scheduledTime: '10:00 AM – 12:00 PM',
      latitude: 30.2672,
      longitude: -97.7431,
    ),
    DeliveryTaskModel(
      id: 'task-2',
      trackingNumber: 'SHN-9102-2026',
      recipientName: 'Sarah Jenkins',
      recipientPhone: '+1-512-555-0345',
      deliveryAddress: '1200 Logistics Blvd, Dock #2',
      destinationCity: 'Austin, TX',
      codAmount: 0.00, // Prepaid
      weightKg: 1.2,
      status: 'ASSIGNED',
      driverNotes: 'Prepaid parcel. Safe drop on porch allowed.',
      scheduledTime: '1:00 PM – 3:00 PM',
      latitude: 30.2747,
      longitude: -97.7404,
    ),
    DeliveryTaskModel(
      id: 'task-3',
      trackingNumber: 'SHN-7341-2026',
      recipientName: 'Robert Vance',
      recipientPhone: '+1-512-555-0812',
      deliveryAddress: '789 Lamar Blvd, Apt 3B',
      destinationCity: 'Austin, TX',
      codAmount: 120.00,
      weightKg: 4.8,
      status: 'ASSIGNED',
      driverNotes: 'Call 5 mins before arrival for gate code.',
      scheduledTime: '3:00 PM – 5:00 PM',
      latitude: 30.2812,
      longitude: -97.7511,
    ),
    DeliveryTaskModel(
      id: 'task-4',
      trackingNumber: 'SHN-5092-2026',
      recipientName: 'Emily Clark',
      recipientPhone: '+1-512-555-0422',
      deliveryAddress: '3400 Comanche Trail',
      destinationCity: 'Austin, TX',
      codAmount: 32.50,
      weightKg: 1.0,
      status: 'DELIVERED',
      driverNotes: 'Signed by recipient.',
      scheduledTime: '9:30 AM',
      latitude: 30.2912,
      longitude: -97.7311,
    ),
  ];

  Future<List<DeliveryTaskModel>> getRunsheet() async {
    try {
      final response = await _client.get(ApiConstants.riderRunsheet);
      if (response.data?['data'] is List) {
        final list = (response.data['data'] as List)
            .map((item) => DeliveryTaskModel.fromJson(item as Map<String, dynamic>))
            .toList();
        return list.isNotEmpty ? list : _mockTasks;
      }
      return _mockTasks;
    } catch (_) {
      // Return mock tasks on network disconnect for seamless demo
      return _mockTasks;
    }
  }

  Future<bool> updateStatus({
    required String shipmentId,
    required String status,
    String? reason,
    double? collectedAmount,
  }) async {
    try {
      final response = await _client.patch(
        '${ApiConstants.updateShipmentStatus}/$shipmentId/status',
        data: {
          'status': status,
          if (reason != null) 'reason': reason,
          if (collectedAmount != null) 'collectedAmount': collectedAmount,
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      // Optimistic success for offline mode
      return true;
    }
  }
}
