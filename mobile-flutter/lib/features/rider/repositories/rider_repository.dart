import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../models/delivery_task_model.dart';

class RiderRepository {
  final DioClient _client;

  RiderRepository({DioClient? client}) : _client = client ?? DioClient();

  Future<List<DeliveryTaskModel>> getRunsheet() async {
    try {
      final response = await _client.get(ApiConstants.riderRunsheet);
      if (response.data?['data'] is List) {
        final list = (response.data['data'] as List)
            .map((item) => DeliveryTaskModel.fromJson(item as Map<String, dynamic>))
            .toList();
        return list;
      }
      return [];
    } catch (e) {
      throw Exception('Failed to load runsheet: $e');
    }
  }

  Future<bool> completeDelivery({
    required String shipmentId,
    double? codCollected,
    bool? otpVerified,
  }) async {
    try {
      final response = await _client.post(
        '/api/v1/riders/complete-delivery',
        data: {
          'shipmentId': shipmentId,
          if (codCollected != null) 'codCollected': codCollected,
          if (otpVerified != null) 'otpVerified': otpVerified,
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      throw Exception('Delivery update failed: $e');
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
    } catch (e) {
      throw Exception('Failure report failed: $e');
    }
  }
}
