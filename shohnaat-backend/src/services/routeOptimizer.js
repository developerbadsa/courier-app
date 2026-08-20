/**
 * AI Route Optimization Engine
 * Fast Nearest Neighbor + 2-Opt Local Search for TSP
 * Optimizes 20-50 daily delivery stops into most efficient order
 */

/**
 * Haversine distance between two coordinates in km
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Build distance matrix for all stops + hub
 */
function buildDistanceMatrix(hub, stops) {
  const points = [hub, ...stops];
  const n = points.length;
  const matrix = Array.from({ length: n }, () => new Float64Array(n));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineDistance(points[i].lat, points[i].lng, points[j].lat, points[j].lng);
      matrix[i][j] = d;
      matrix[j][i] = d;
    }
  }
  return matrix;
}

/**
 * Total route distance for a given order of stops
 */
function routeDistance(matrix, order) {
  let dist = 0;
  for (let i = 0; i < order.length - 1; i++) {
    dist += matrix[order[i]][order[i + 1]];
  }
  return dist;
}

/**
 * Phase 1: Nearest Neighbor heuristic — fast initial solution
 */
function nearestNeighbor(matrix, startIdx, n) {
  const visited = new Set([startIdx]);
  const order = [startIdx];

  let current = startIdx;
  while (visited.size < n) {
    let bestDist = Infinity;
    let bestNext = -1;

    for (let j = 0; j < n; j++) {
      if (!visited.has(j)) {
        const d = matrix[current][j];
        if (d < bestDist) {
          bestDist = d;
          bestNext = j;
        }
      }
    }

    if (bestNext === -1) break;
    visited.add(bestNext);
    order.push(bestNext);
    current = bestNext;
  }

  return order;
}

/**
 * Phase 2: 2-Opt local search — refine the route by removing crossing edges
 * Runs O(n²) per iteration, typically converges in < 10 iterations
 */
function twoOpt(matrix, order) {
  const n = order.length;
  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        // Calculate cost of removing edges (i-1,i) and (j,j+1)
        // and adding edges (i-1,j) and (i,j+1)
        const d1 = matrix[order[i - 1]][order[i]] + matrix[order[j]][order[j + 1 < n ? j + 1 : 0]];
        const d2 = matrix[order[i - 1]][order[j]] + matrix[order[i]][order[j + 1 < n ? j + 1 : 0]];

        if (d2 < d1 - 0.001) {
          // Reverse segment between i and j
          const segment = order.slice(i, j + 1).reverse();
          order.splice(i, j - i + 1, ...segment);
          improved = true;
        }
      }
    }
  }

  return { order, iterations };
}

/**
 * Main optimization function
 * @param {Object} params
 * @param {Object} params.hub - { lat, lng }
 * @param {Array} params.stops - [{ shipmentId, lat, lng, priority, timeWindow }]
 * @returns {Object} optimized route with distances and ETA
 */
function optimizeRoute({ hub, stops }) {
  if (!stops || stops.length === 0) {
    return { optimized: [], totalDistanceKm: 0, estimatedDriveMinutes: 0, saved: { distanceKm: 0, minutes: 0 } };
  }

  const startTime = Date.now();

  // Build distance matrix (hub + all stops)
  const matrix = buildDistanceMatrix(hub, stops);

  // Nearest Neighbor initial solution
  const nnOrder = nearestNeighbor(matrix, 0, stops.length + 1);
  const nnDistance = routeDistance(matrix, nnOrder);

  // 2-Opt refinement
  const refined = twoOpt(matrix, [...nnOrder]);
  const optimizedDistance = routeDistance(matrix, refined.order);

  // Build result — skip index 0 (hub) in output
  const optimized = refined.order
    .filter((idx) => idx > 0) // remove hub from delivery list
    .map((idx, position) => ({
      ...stops[idx - 1], // -1 because stops array is 0-indexed but matrix has hub at 0
      sequence: position + 1,
    }));

  // Calculate individual segment distances
  for (let i = 0; i < optimized.length; i++) {
    const fromIdx = refined.order[i];
    const toIdx = refined.order[i + 1];
    if (toIdx !== undefined) {
      optimized[i].segmentDistanceKm = Math.round(matrix[fromIdx][toIdx] * 100) / 100;
    } else {
      optimized[i].segmentDistanceKm = 0;
    }
  }

  // Estimate drive time (avg 30 km/h in city traffic)
  const avgSpeedKmh = 30;
  const estimatedDriveMinutes = Math.round((optimizedDistance / avgSpeedKmh) * 60);

  // Naive distance (unoptimized, just sequential order)
  const naiveOrder = [0, ...stops.map((_, i) => i + 1)];
  const naiveDistance = routeDistance(matrix, naiveOrder);

  const saved = {
    distanceKm: Math.round((naiveDistance - optimizedDistance) * 100) / 100,
    minutes: Math.round(((naiveDistance - optimizedDistance) / avgSpeedKmh) * 60),
  };

  const processingMs = Date.now() - startTime;

  return {
    optimized,
    totalDistanceKm: Math.round(optimizedDistance * 100) / 100,
    estimatedDriveMinutes: estimatedDriveMinutes,
    naiveDistanceKm: Math.round(naiveDistance * 100) / 100,
    saved,
    processingMs,
    algorithm: 'Nearest Neighbor + 2-Opt',
  };
}

module.exports = { optimizeRoute, haversineDistance };
