import 'user_model.dart';

class AuthResponseModel {
  final bool success;
  final String? message;
  final String accessToken;
  final String? refreshToken;
  final UserModel user;

  AuthResponseModel({
    required this.success,
    this.message,
    required this.accessToken,
    this.refreshToken,
    required this.user,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    final userData = data['user'] as Map<String, dynamic>? ?? {};

    return AuthResponseModel(
      success: json['success'] == true || json['accessToken'] != null,
      message: json['message']?.toString(),
      accessToken: data['accessToken']?.toString() ?? '',
      refreshToken: data['refreshToken']?.toString(),
      user: UserModel.fromJson(userData),
    );
  }
}
