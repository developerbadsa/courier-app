import 'package:equatable/equatable.dart';
import '../models/delivery_task_model.dart';

abstract class RunsheetState extends Equatable {
  const RunsheetState();

  @override
  List<Object?> get props => [];
}

class RunsheetInitial extends RunsheetState {}

class RunsheetLoading extends RunsheetState {}

class RunsheetLoaded extends RunsheetState {
  final List<DeliveryTaskModel> tasks;
  final double totalCodCollected;
  final int completedCount;
  final int pendingCount;

  const RunsheetLoaded({
    required this.tasks,
    required this.totalCodCollected,
    required this.completedCount,
    required this.pendingCount,
  });

  List<DeliveryTaskModel> get activeTasks =>
      tasks.where((t) => !t.isCompleted).toList();

  List<DeliveryTaskModel> get historyTasks =>
      tasks.where((t) => t.isCompleted).toList();

  @override
  List<Object?> get props => [tasks, totalCodCollected, completedCount, pendingCount];
}

class RunsheetError extends RunsheetState {
  final String message;

  const RunsheetError(this.message);

  @override
  List<Object?> get props => [message];
}
