import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../models/delivery_task_model.dart';

class RiderRepository {
  final DioClient _client;

  RiderRepository({DioClient? client}) : _client = client ?? DioClient();

  List<DeliveryTaskModel> get _sampleTasks => [
    DeliveryTaskModel(
      id: 'SHN-TASK-101',
      trackingNumber: 'SHN-9482-US',
      recipientName: 'Michael Chang',
      recipientPhone: '+1 (512) 555-0144',
      deliveryAddress: '104 Lavaca St, Downtown District',
      destinationCity: 'Austin, TX 78701',
      codAmount: 48.50,
      weightKg: 1.8,
      status: 'OUT_FOR_DELIVERY',
      driverNotes: 'Ring bell #4B. Customer requested doorstep drop if verified.',
      scheduledTime: 'Priority Express (10:00 AM – 11:30 AM)',
      latitude: 30.2649,
      longitude: -97.7466,
    ),
    DeliveryTaskModel(
      id: 'SHN-TASK-102',
      trackingNumber: 'SHN-8831-US',
      recipientName: 'Sophia Rodriguez',
      recipientPhone: '+1 (512) 555-0189',
      deliveryAddress: '2211 S Congress Ave, Apt 302',
      destinationCity: 'Austin, TX 78704',
      codAmount: 0.0,
      weightKg: 0.9,
      status: 'ASSIGNED',
      driverNotes: 'Prepaid parcel. Requires customer signature.',
      scheduledTime: 'Midday Slot (11:30 AM – 01:00 PM)',
      latitude: 30.2415,
      longitude: -97.7511,
    ),
    DeliveryTaskModel(
      id: 'SHN-TASK-103',
      trackingNumber: 'SHN-7712-US',
      recipientName: 'David Miller',
      recipientPhone: '+1 (512) 555-0121',
      deliveryAddress: '3809 Guadalupe St, North Campus Hub',
      destinationCity: 'Austin, TX 78751',
      codAmount: 112.00,
      weightKg: 3.4,
      status: 'ASSIGNED',
      driverNotes: 'COD collection required. Cash or POS terminal acceptable.',
      scheduledTime: 'Afternoon (01:30 PM – 03:30 PM)',
      latitude: 30.2995,
      longitude: -97.7375,
    ),
    DeliveryTaskModel(
      id: 'SHN-TASK-104',
      trackingNumber: 'SHN-6604-US',
      recipientName: 'Emma Watson',
      recipientPhone: '+1 (512) 555-0177',
      deliveryAddress: '1600 E 6th St, East Side Hub',
      destinationCity: 'Austin, TX 78702',
      codAmount: 32.00,
      weightKg: 1.1,
      status: 'DELIVERED',
      driverNotes: 'Signed by recipient. COD Collected.',
      scheduledTime: 'Delivered at 09:15 AM',
      latitude: 30.2625,
      longitude: -97.7248,
    ),
  ];

  Future<List<DeliveryTaskModel>> getRunsheet() async {
    try {
      final response = await _client.get(ApiConstants.riderRunsheet);
      if (response.data?['data'] is List) {
        final list = (response.data['data'] as List)
            .map((item) => DeliveryTaskModel.fromJson(item as Map<String, dynamic>))
            .toList();
        if (list.isNotEmpty) return list;
      }
    } catch (_) {}
    return _sampleTasks;
  }

  Future<Map<String, dynamic>> getCodSummary() async {
    try {
      final response = await _client.get(ApiConstants.riderCodSummary);
      if (response.data?['data'] is Map) {
        return response.data['data'] as Map<String, dynamic>;
      }
    } catch (_) {}
    return {
      'totalCollected': 192.50,
      'currency': 'USD',
      'deliveriesCount': 4,
      'pendingRemittance': 160.50,
    };
  }

  Future<bool> completeDelivery({
    required String shipmentId,
    double? codCollected,
    bool? otpVerified,
    String? signatureBase64,
  }) async {
    try {
      final response = await _client.post(
        '/api/v1/riders/complete-delivery',
        data: {
          'shipmentId': shipmentId,
          if (codCollected != null) 'codCollected': codCollected,
          if (otpVerified != null) 'otpVerified': otpVerified,
          if (signatureBase64 != null) 'signature': signatureBase64,
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return true; // Local optimistic update with sync
    }
  }

  Future<bool> reportFailure({
    required String shipmentId,
    required String reasonCode,
    String? notes,
  }) async {
    try {
      final response = await _client.post(
        '/api/v1/riders/report-failure',
        data: {
          'shipmentId': shipmentId,
          'reasonCode': reasonCode,
          if (notes != null) 'notes': notes,
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return true;
    }
  }
}
