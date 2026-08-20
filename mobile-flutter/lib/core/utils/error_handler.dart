import 'dart:async';
import 'dart:io';
import 'package:dio/dio.dart';

/// Maps technical errors to user-friendly messages.
class SmartErrorHandler {
  /// Convert any error to a human-readable message
  static String handleError(dynamic error) {
    if (error is DioException) {
      return _handleDioError(error);
    }
    if (error is SocketException) {
      return 'No internet connection. Please check your network and try again.';
    }
    if (error is TimeoutException) {
      return 'Request timed out. The server may be busy — please try again.';
    }
    if (error is FormatException) {
      return 'Unexpected response from server. Please try again.';
    }
    return 'Something went wrong. Please try again.';
  }

  static String _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timed out. Check your internet speed and try again.';

      case DioExceptionType.connectionError:
        if (error.error is SocketException) {
          return 'Cannot reach server. Please check your internet connection.';
        }
        return 'Network error. Please check your connection and try again.';

      case DioExceptionType.badResponse:
        return _handleHttpError(error.response?.statusCode, error.response?.data);

      case DioExceptionType.cancel:
        return 'Request was cancelled.';

      case DioExceptionType.unknown:
        if (error.error is SocketException) {
          return 'No internet connection. Please check your network.';
        }
        return 'Unexpected error. Please try again.';

      default:
        return 'Something went wrong. Please try again.';
    }
  }

  static String _handleHttpError(int? statusCode, dynamic responseData) {
    final serverMessage = responseData?['message']?.toString();

    switch (statusCode) {
      case 400:
        return serverMessage ?? 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You don\'t have permission for this action.';
      case 404:
        return serverMessage ?? 'Not found. The resource may have been removed.';
      case 409:
        return serverMessage ?? 'Conflict — this action was already performed.';
      case 422:
        return serverMessage ?? 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Our team has been notified. Please try again later.';
      case 502:
        return 'Server is temporarily unavailable. Please try again in a few minutes.';
      case 503:
        return 'Service is under maintenance. Please try again later.';
      default:
        return serverMessage ?? 'Error ($statusCode). Please try again.';
    }
  }

  /// Check if error is network-related (can retry when online)
  static bool isNetworkError(dynamic error) {
    if (error is DioException) {
      return error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.connectionError ||
          error.error is SocketException;
    }
    return error is SocketException;
  }

  /// Check if error requires re-login
  static bool requiresReauth(dynamic error) {
    if (error is DioException) {
      return error.response?.statusCode == 401;
    }
    return false;
  }
}
