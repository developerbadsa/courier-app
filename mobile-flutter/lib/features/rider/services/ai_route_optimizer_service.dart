import 'dart:math';
import '../models/delivery_task_model.dart';

class AiRouteOptimizerService {
  /// 2-Opt TSP Algorithm for optimizing stop sequences
  static List<DeliveryTaskModel> optimizeRoute({
    required List<DeliveryTaskModel> tasks,
    double hubLat = 30.2672,
    double hubLng = -97.7431,
  }) {
    if (tasks.length <= 2) return tasks;

    List<DeliveryTaskModel> route = List.from(tasks);

    // Sort by nearest neighbor heuristic from starting hub
    route.sort((a, b) {
      final distA = _haversine(hubLat, hubLng, a.latitude ?? hubLat, a.longitude ?? hubLng);
      final distB = _haversine(hubLat, hubLng, b.latitude ?? hubLat, b.longitude ?? hubLng);
      return distA.compareTo(distB);
    });

    // 2-Opt local search refinement
    bool improved = true;
    int iterations = 0;
    while (improved && iterations < 20) {
      improved = false;
      iterations++;
      for (int i = 0; i < route.length - 1; i++) {
        for (int k = i + 1; k < route.length; k++) {
          final currentDist = _calculateSubRouteDistance(route, i, k);
          final reversedRoute = _twoOptSwap(route, i, k);
          final newDist = _calculateSubRouteDistance(reversedRoute, i, k);

          if (newDist < currentDist) {
            route = reversedRoute;
            improved = true;
          }
        }
      }
    }

    return route;
  }

  static List<DeliveryTaskModel> _twoOptSwap(List<DeliveryTaskModel> route, int i, int k) {
    List<DeliveryTaskModel> newRoute = [];
    // 1. take route[0] to route[i-1]
    for (int c = 0; c < i; c++) {
      newRoute.add(route[c]);
    }
    // 2. take route[i] to route[k] and add them in reverse order
    for (int c = k; c >= i; c--) {
      newRoute.add(route[c]);
    }
    // 3. take route[k+1] to end
    for (int c = k + 1; c < route.length; c++) {
      newRoute.add(route[c]);
    }
    return newRoute;
  }

  static double _calculateSubRouteDistance(List<DeliveryTaskModel> route, int i, int k) {
    double total = 0.0;
    for (int idx = i; idx < k; idx++) {
      final a = route[idx];
      final b = route[idx + 1];
      total += _haversine(
        a.latitude ?? 30.0,
        a.longitude ?? -97.0,
        b.latitude ?? 30.0,
        b.longitude ?? -97.0,
      );
    }
    return total;
  }

  static double _haversine(double lat1, double lon1, double lat2, double lon2) {
    const r = 6371; // Earth radius in km
    final dLat = _deg2rad(lat2 - lat1);
    final dLon = _deg2rad(lon2 - lon1);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_deg2rad(lat1)) * cos(_deg2rad(lat2)) * sin(dLon / 2) * sin(dLon / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return r * c;
  }

  static double _deg2rad(double deg) => deg * (pi / 180);
}
