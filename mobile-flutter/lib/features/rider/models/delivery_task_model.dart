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

  bool get isCompleted =>
      status == 'DELIVERED' || status == 'FAILED' || status == 'RETURNED';
  bool get isOutForDelivery =>
      status == 'OUT_FOR_DELIVERY' || status == 'IN_TRANSIT';
  bool get isPending =>
      status == 'ASSIGNED' || status == 'PENDING' || status == 'CREATED';

  factory DeliveryTaskModel.fromJson(Map<String, dynamic> json) {
    final shipment = json['shipment'] is Map
        ? json['shipment'] as Map<String, dynamic>
        : json;
    final consignee = shipment['consignee'] is Map
        ? shipment['consignee'] as Map<String, dynamic>
        : null;
    final deliveryAddr = shipment['deliveryAddress'] is Map
        ? shipment['deliveryAddress'] as Map<String, dynamic>
        : (shipment['deliveryAddressSnap'] is Map
            ? shipment['deliveryAddressSnap'] as Map<String, dynamic>
            : null);

    return DeliveryTaskModel(
      id: shipment['id']?.toString() ?? json['id']?.toString() ?? 'TSK-01',
      trackingNumber: shipment['trackingNumber']?.toString() ??
          json['trackingNumber']?.toString() ??
          'SHN-8821-US',
      recipientName: consignee?['name']?.toString() ??
          json['consigneeName']?.toString() ??
          json['recipientName']?.toString() ??
          'Customer Recipient',
      recipientPhone: consignee?['phone']?.toString() ??
          json['consigneePhone']?.toString() ??
          json['recipientPhone']?.toString() ??
          '+1 (512) 555-0199',
      deliveryAddress: deliveryAddr?['line1']?.toString() ??
          deliveryAddr?['street']?.toString() ??
          json['deliveryAddress']?.toString() ??
          json['address']?.toString() ??
          '742 Evergreen Terrace, Downtown Hub',
      destinationCity: deliveryAddr?['city']?.toString() ??
          json['destinationCity']?.toString() ??
          'Austin, TX',
      codAmount: double.tryParse(
              shipment['codAmount']?.toString() ?? json['codAmount']?.toString() ?? '0.0') ??
          0.0,
      weightKg: double.tryParse(
              shipment['weightKg']?.toString() ?? json['weightKg']?.toString() ?? '1.2') ??
          1.2,
      status: (shipment['currentStatus']?.toString() ??
              json['currentStatus']?.toString() ??
              json['status']?.toString() ??
              'ASSIGNED')
          .toUpperCase(),
      driverNotes: shipment['specialInstructions']?.toString() ??
          json['driverNotes']?.toString() ??
          'Signature required upon delivery. Handle with care.',
      scheduledTime: json['timeSlot']?.toString() ??
          'Priority Window (09:30 AM – 12:30 PM)',
      latitude: double.tryParse(
              deliveryAddr?['latitude']?.toString() ?? json['latitude']?.toString() ?? '30.2672') ??
          30.2672,
      longitude: double.tryParse(
              deliveryAddr?['longitude']?.toString() ?? json['longitude']?.toString() ?? '-97.7431') ??
          -97.7431,
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

  DeliveryTaskModel copyWith({
    String? id,
    String? trackingNumber,
    String? recipientName,
    String? recipientPhone,
    String? deliveryAddress,
    String? destinationCity,
    double? codAmount,
    double? weightKg,
    String? status,
    String? driverNotes,
    String? scheduledTime,
    double? latitude,
    double? longitude,
  }) {
    return DeliveryTaskModel(
      id: id ?? this.id,
      trackingNumber: trackingNumber ?? this.trackingNumber,
      recipientName: recipientName ?? this.recipientName,
      recipientPhone: recipientPhone ?? this.recipientPhone,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      destinationCity: destinationCity ?? this.destinationCity,
      codAmount: codAmount ?? this.codAmount,
      weightKg: weightKg ?? this.weightKg,
      status: status ?? this.status,
      driverNotes: driverNotes ?? this.driverNotes,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
    );
  }
}
