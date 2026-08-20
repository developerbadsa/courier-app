import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  static const String _keyToken = 'shohnaat_jwt_token';
  static const String _keyUser = 'shohnaat_user_data';
  static const String _keyRole = 'shohnaat_user_role';

  final FlutterSecureStorage _secureStorage;
  SharedPreferences? _prefs;

  LocalStorageService({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Token Management
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _keyToken, value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: _keyToken);
  }

  Future<void> clearToken() async {
    await _secureStorage.delete(key: _keyToken);
  }

  // Role Management
  Future<void> saveRole(String role) async {
    if (_prefs == null) await init();
    await _prefs!.setString(_keyRole, role);
  }

  String? getRole() {
    return _prefs?.getString(_keyRole);
  }

  // User Profile JSON
  Future<void> saveUserRaw(String userJson) async {
    if (_prefs == null) await init();
    await _prefs!.setString(_keyUser, userJson);
  }

  String? getUserRaw() {
    return _prefs?.getString(_keyUser);
  }

  // Clear Session
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    if (_prefs == null) await init();
    await _prefs!.clear();
  }
}
