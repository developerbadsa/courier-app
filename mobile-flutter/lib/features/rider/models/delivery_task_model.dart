class DeliveryTaskModel {
  final String id;
  final String trackingNumber;
  final String recipientName;
  final String recipientPhone;
  final String deliveryAddress;
  final String destinationCity;
  final double codAmount;
  final double weightKg;
  final String status;
  final String? driverNotes;
  final String? scheduledTime;
  final double? latitude;
  final double? longitude;

  DeliveryTaskModel({
    required this.id,
    required this.trackingNumber,
    required this.recipientName,
    required this.recipientPhone,
    required this.deliveryAddress,
    required this.destinationCity,
    required this.codAmount,
    required this.weightKg,
    required this.status,
    this.driverNotes,
    this.scheduledTime,
    this.latitude,
    this.longitude,
  });

  bool get isCompleted => status == 'DELIVERED' || status == 'FAILED' || status == 'RETURNED';
  bool get isOutForDelivery => status == 'OUT_FOR_DELIVERY';
  bool get isPending => status == 'ASSIGNED' || status == 'IN_TRANSIT';

  factory DeliveryTaskModel.fromJson(Map<String, dynamic> json) {
    return DeliveryTaskModel(
      id: json['id']?.toString() ?? '',
      trackingNumber: json['trackingNumber']?.toString() ?? '',
      recipientName: json['consigneeName']?.toString() ?? json['recipientName']?.toString() ?? 'Customer',
      recipientPhone: json['consigneePhone']?.toString() ?? json['recipientPhone']?.toString() ?? '',
      deliveryAddress: json['deliveryAddress']?.toString() ?? json['address']?.toString() ?? '',
      destinationCity: json['destinationCity']?.toString() ?? json['city']?.toString() ?? 'Austin, TX',
      codAmount: double.tryParse(json['codAmount']?.toString() ?? '0.0') ?? 0.0,
      weightKg: double.tryParse(json['weightKg']?.toString() ?? '1.0') ?? 1.0,
      status: json['currentStatus']?.toString() ?? json['status']?.toString() ?? 'ASSIGNED',
      driverNotes: json['driverNotes']?.toString() ?? json['specialInstructions']?.toString(),
      scheduledTime: json['timeSlot']?.toString() ?? 'Morning (8AM–12PM)',
      latitude: double.tryParse(json['latitude']?.toString() ?? ''),
      longitude: double.tryParse(json['longitude']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'trackingNumber': trackingNumber,
      'consigneeName': recipientName,
      'consigneePhone': recipientPhone,
      'deliveryAddress': deliveryAddress,
      'destinationCity': destinationCity,
      'codAmount': codAmount,
      'weightKg': weightKg,
      'currentStatus': status,
      'driverNotes': driverNotes,
      'timeSlot': scheduledTime,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
