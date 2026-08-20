class UserModel {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final List<String> roles;
  final String? merchantId;
  final String? riderId;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.roles,
    this.merchantId,
    this.riderId,
  });

  String get primaryRole {
    if (roles.contains('super_admin') || roles.contains('operator')) return 'super_admin';
    if (roles.contains('rider')) return 'rider';
    return 'merchant';
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedRoles = [];
    if (json['roles'] is List) {
      parsedRoles = (json['roles'] as List).map((r) => r.toString()).toList();
    } else if (json['role'] is String) {
      parsedRoles = [json['role'] as String];
    }

    return UserModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString(),
      roles: parsedRoles.isNotEmpty ? parsedRoles : ['merchant'],
      merchantId: json['merchantId']?.toString(),
      riderId: json['riderId']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'roles': roles,
      'merchantId': merchantId,
      'riderId': riderId,
    };
  }
}
