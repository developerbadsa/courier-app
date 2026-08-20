import 'dart:convert';
import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/local_storage_service.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';

class AuthRepository {
  final DioClient _client;
  final LocalStorageService _storage;

  AuthRepository({DioClient? client, LocalStorageService? storage})
      : _client = client ?? DioClient(),
        _storage = storage ?? LocalStorageService();

  Future<AuthResponseModel> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.post(
        ApiConstants.login,
        data: {
          'email': email.trim(),
          'password': password,
        },
      );

      final authResponse = AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
      
      // Save session credentials
      await _storage.saveToken(authResponse.accessToken);
      await _storage.saveRole(authResponse.user.primaryRole);
      await _storage.saveUserRaw(jsonEncode(authResponse.user.toJson()));

      return authResponse;
    } on DioException catch (e) {
      final msg = e.response?.data?['message']?.toString() ?? 'Invalid email or password';
      throw Exception(msg);
    } catch (e) {
      throw Exception('Login failed: ${e.toString()}');
    }
  }

  Future<UserModel?> getSavedUser() async {
    final raw = _storage.getUserRaw();
    if (raw != null && raw.isNotEmpty) {
      try {
        return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  Future<void> logout() async {
    await _storage.clearAll();
  }
}
