import 'package:flutter_bloc/flutter_bloc.dart';
import '../models/delivery_task_model.dart';
import '../repositories/rider_repository.dart';
import 'runsheet_state.dart';

class RunsheetCubit extends Cubit<RunsheetState> {
  final RiderRepository _repository;

  RunsheetCubit({RiderRepository? repository})
      : _repository = repository ?? RiderRepository(),
        super(RunsheetInitial());

  Future<void> fetchRunsheet() async {
    emit(RunsheetLoading());
    try {
      final tasks = await _repository.getRunsheet();
      _emitLoaded(tasks);
    } catch (e) {
      emit(RunsheetError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> completeDelivery({
    required String shipmentId,
    required double codCollected,
  }) async {
    if (state is RunsheetLoaded) {
      final current = (state as RunsheetLoaded).tasks;
      final updated = current.map((t) {
        if (t.id == shipmentId) {
          return DeliveryTaskModel(
            id: t.id,
            trackingNumber: t.trackingNumber,
            recipientName: t.recipientName,
            recipientPhone: t.recipientPhone,
            deliveryAddress: t.deliveryAddress,
            destinationCity: t.destinationCity,
            codAmount: t.codAmount,
            weightKg: t.weightKg,
            status: 'DELIVERED',
            driverNotes: t.driverNotes,
            scheduledTime: t.scheduledTime,
          );
        }
        return t;
      }).toList();

      _emitLoaded(updated);
      await _repository.updateStatus(
        shipmentId: shipmentId,
        status: 'DELIVERED',
        collectedAmount: codCollected,
      );
    }
  }

  Future<void> markFailed({
    required String shipmentId,
    required String reason,
  }) async {
    if (state is RunsheetLoaded) {
      final current = (state as RunsheetLoaded).tasks;
      final updated = current.map((t) {
        if (t.id == shipmentId) {
          return DeliveryTaskModel(
            id: t.id,
            trackingNumber: t.trackingNumber,
            recipientName: t.recipientName,
            recipientPhone: t.recipientPhone,
            deliveryAddress: t.deliveryAddress,
            destinationCity: t.destinationCity,
            codAmount: t.codAmount,
            weightKg: t.weightKg,
            status: 'FAILED',
            driverNotes: reason,
            scheduledTime: t.scheduledTime,
          );
        }
        return t;
      }).toList();

      _emitLoaded(updated);
      await _repository.updateStatus(
        shipmentId: shipmentId,
        status: 'FAILED',
        reason: reason,
      );
    }
  }

  void _emitLoaded(List<DeliveryTaskModel> tasks) {
    final completed = tasks.where((t) => t.isCompleted).length;
    final pending = tasks.where((t) => !t.isCompleted).length;
    final totalCod = tasks
        .where((t) => t.status == 'DELIVERED')
        .fold(0.0, (sum, t) => sum + t.codAmount);

    emit(RunsheetLoaded(
      tasks: tasks,
      totalCodCollected: totalCod,
      completedCount: completed,
      pendingCount: pending,
    ));
  }
}
