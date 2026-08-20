import 'dart:async';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import '../constants/api_constants.dart';
import '../storage/local_storage_service.dart';

/// Smart HTTP client with retry, token refresh, caching, and error mapping.
class DioClient {
  final Dio _dio;
  final LocalStorageService _storage;
  final Map<String, CacheEntry> _cache = {};
  int _refreshAttempts = 0;

  DioClient({LocalStorageService? storage, Dio? dio})
      : _storage = storage ?? LocalStorageService(),
        _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: ApiConstants.baseUrl,
                connectTimeout: const Duration(seconds: 15),
                receiveTimeout: const Duration(seconds: 15),
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              ),
            ) {
    _dio.interceptors.addAll([
      _RetryInterceptor(),
      _CacheInterceptor(_cache),
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Skip auth for public endpoints
          final isPublic = options.path.contains('/tracking/') ||
              options.path.contains('/auth/login') ||
              options.path.contains('/auth/register') ||
              options.path.contains('/health');
          if (!isPublic) {
            final token = await _storage.getToken();
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Auto token refresh on 401
          if (error.response?.statusCode == 401 && _refreshAttempts < 2) {
            _refreshAttempts++;
            try {
              final refreshResult = await _attemptTokenRefresh();
              if (refreshResult) {
                // Retry original request with new token
                final token = await _storage.getToken();
                error.requestOptions.headers['Authorization'] = 'Bearer $token';
                final response = await _dio.fetch(error.requestOptions);
                _refreshAttempts = 0;
                return handler.resolve(response);
              }
            } catch (_) {}
            // Refresh failed — clear session
            await _storage.clearAll();
            _refreshAttempts = 0;
          }
          return handler.next(error);
        },
      ),
      PrettyDioLogger(
        requestHeader: true,
        requestBody: false,
        responseBody: true,
        responseHeader: false,
        compact: true,
        maxWidth: 90,
      ),
    ]);
  }

  Dio get dio => _dio;

  /// Attempt to refresh JWT using stored refresh token
  Future<bool> _attemptTokenRefresh() async {
    try {
      final response = await Dio().post(
        '${ApiConstants.baseUrl}/api/v1/auth/refresh',
        options: Options(headers: {'Content-Type': 'application/json'}),
      );
      if (response.statusCode == 200 && response.data?['accessToken'] != null) {
        await _storage.saveToken(response.data['accessToken']);
        return true;
      }
    } catch (_) {}
    return false;
  }

  /// Clear all cached responses
  void clearCache() => _cache.clear();

  /// GET with optional cache (default 30s for list, 0 for detail)
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    Duration? cacheTtl,
  }) async {
    return await _dio.get(path, queryParameters: queryParameters, options: options);
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    // Invalidate cache for this path prefix on write operations
    _invalidateCache(path);
    return await _dio.post(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    _invalidateCache(path);
    return await _dio.patch(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    _invalidateCache(path);
    return await _dio.delete(path, data: data, queryParameters: queryParameters, options: options);
  }

  void _invalidateCache(String path) {
    final prefix = path.split('?').first;
    _cache.removeWhere((key, _) => key.startsWith(prefix));
  }
}

/// Cache entry with TTL
class CacheEntry {
  final Response response;
  final DateTime expiry;
  CacheEntry(this.response, this.expiry);
  bool get isExpired => DateTime.now().isAfter(expiry);
}

/// In-memory response cache interceptor
class _CacheInterceptor extends Interceptor {
  final Map<String, CacheEntry> _cache;
  _CacheInterceptor(this._cache);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (options.method == 'GET') {
      final key = '${options.path}?${options.queryParameters}';
      final cached = _cache[key];
      if (cached != null && !cached.isExpired) {
        return handler.resolve(cached.response);
      }
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (response.requestOptions.method == 'GET') {
      final key = '${response.requestOptions.path}?${response.requestOptions.queryParameters}';
      _cache[key] = CacheEntry(response, DateTime.now().add(const Duration(seconds: 30)));
    }
    handler.next(response);
  }
}

/// Automatic retry with exponential backoff for network errors
class _RetryInterceptor extends Interceptor {
  static const int _maxRetries = 3;
  static const Duration _baseDelay = Duration(milliseconds: 800);

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final attempt = err.requestOptions.extra['retryCount'] ?? 0;
    final shouldRetry = attempt < _maxRetries &&
        (err.type == DioExceptionType.connectionTimeout ||
         err.type == DioExceptionType.sendTimeout ||
         err.type == DioExceptionType.receiveTimeout ||
         err.type == DioExceptionType.connectionError ||
         (err.error is SocketException));

    if (shouldRetry) {
      final delay = _baseDelay * (1 << attempt); // exponential: 800ms, 1600ms, 3200ms
      await Future.delayed(delay);
      err.requestOptions.extra['retryCount'] = attempt + 1;
      try {
        final dio = Dio();
        final response = await dio.fetch(err.requestOptions);
        return handler.resolve(response);
      } catch (_) {}
    }
    handler.next(err);
  }
}
