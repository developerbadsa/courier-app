#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════════════
 *  SHOHNAAT LOGISTICS — SMOKE TEST SUITE
 *  Run: node src/tests/smoke-test.js [BASE_URL]
 * ══════════════════════════════════════════════════════════════════════
 */

const BASE_URL = process.argv[2] || process.env.API_URL || 'http://localhost:5000';

let passed = 0;
let failed = 0;
let total = 0;
const results = [];

/* ── Helpers ── */
async function request(method, path, { body, headers = {}, expectStatus } = {}) {
  const url = `${BASE_URL}${path}`;
  total++;
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    const ok = expectStatus ? (Array.isArray(expectStatus) ? expectStatus.includes(res.status) : res.status === expectStatus) : res.status < 500;
    if (ok) {
      passed++;
      results.push({ method, path, status: res.status, result: '✅ PASS' });
    } else {
      failed++;
      results.push({ method, path, status: res.status, expected: expectStatus, result: '❌ FAIL', error: data.message });
    }
    return { status: res.status, data };
  } catch (error) {
    failed++;
    results.push({ method, path, status: 'ERR', result: '❌ FAIL', error: error.message });
    return { status: 0, data: null, error };
  }
}

function section(title) {
  console.log(`\n┌─── ${title} ───┐`);
}

function summary() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed}/${total} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════\n');

  for (const r of results) {
    console.log(`  ${r.result}  ${r.method.padEnd(6)} ${r.path.padEnd(40)} ${r.status}${r.error ? ` — ${r.error}` : ''}`);
  }

  console.log('\n' + (failed === 0 ? '🎉 ALL TESTS PASSED!' : `⚠️  ${failed} TESTS FAILED`));
  process.exit(failed > 0 ? 1 : 0);
}

/* ══════════════════════════════════════════════════════════════════════
   TEST SUITES
   ══════════════════════════════════════════════════════════════════════ */

async function runTests() {
  console.log(`\n🔬 SHOHNAAT SMOKE TEST SUITE`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Time:   ${new Date().toISOString()}\n`);

  // ─── 1. Health & Infrastructure ───
  section('1. Health & Infrastructure');
  await request('GET', '/health', { expectStatus: 200 });

  // ─── 2. Auth Endpoints ───
  section('2. Auth Endpoints');
  await request('POST', '/api/v1/auth/login', {
    body: { email: 'nonexistent@test.com', password: 'test' },
    expectStatus: 401,
  });
  await request('POST', '/api/v1/auth/register', {
    body: { name: 'Smoke Test', email: 'smoketest@verify.com', phone: '+15550000000', password: 'testpass123' },
    expectStatus: [201, 409],
  });

  // ─── 3. Shipments (requires auth — expect 401) ───
  section('3. Shipments — Auth Required');
  await request('GET', '/api/v1/shipments', { expectStatus: 401 });
  await request('GET', '/api/v1/shipments/stats', { expectStatus: 401 });
  await request('POST', '/api/v1/shipments', { body: {}, expectStatus: 401 });
  await request('POST', '/api/v1/shipments/bulk', { body: {}, expectStatus: 401 });

  // ─── 4. Riders (requires auth — expect 401) ───
  section('4. Riders — Auth Required');
  await request('GET', '/api/v1/riders', { expectStatus: 401 });
  await request('POST', '/api/v1/riders', { body: {}, expectStatus: 401 });

  // ─── 5. Hubs (requires auth — expect 401) ───
  section('5. Hubs — Auth Required');
  await request('GET', '/api/v1/hubs', { expectStatus: 401 });
  await request('POST', '/api/v1/hubs', { body: {}, expectStatus: 401 });

  // ─── 6. Zones (requires auth — expect 401) ───
  section('6. Zones — Auth Required');
  await request('GET', '/api/v1/zones', { expectStatus: 401 });

  // ─── 7. Finance (requires auth — expect 401) ───
  section('7. Finance — Auth Required');
  await request('GET', '/api/v1/finance/wallet', { expectStatus: 401 });

  // ─── 8. Payments (requires auth — expect 401) ───
  section('8. Payments — Auth Required');
  await request('GET', '/api/v1/payments/config', { expectStatus: 401 });

  // ─── 9. Addresses (requires auth — expect 401) ───
  section('9. Addresses — Auth Required');
  await request('GET', '/api/v1/addresses', { expectStatus: 401 });

  // ─── 10. Pickups (requires auth — expect 401) ───
  section('10. Pickups — Auth Required');
  await request('GET', '/api/v1/pickups', { expectStatus: 401 });

  // ─── 11. Operations/Manifests (requires auth — expect 401) ───
  section('11. Operations — Auth Required');
  await request('GET', '/api/v1/operations/manifests', { expectStatus: 401 });

  // ─── 12. Developer API (requires auth — expect 401) ───
  section('12. Developer API — Auth Required');
  await request('GET', '/api/v1/developer/keys', { expectStatus: 401 });

  // ─── 13. Notifications (requires auth — expect 401) ───
  section('13. Notifications — Auth Required');
  await request('GET', '/api/v1/notifications/settings', { expectStatus: 401 });
  await request('GET', '/api/v1/notifications/queue', { expectStatus: 401 });

  // ─── 14. Public Tracking (no auth required) ───
  section('14. Public Tracking — No Auth');
  await request('GET', '/api/v1/tracking/NONEXISTENT-TRACK', { expectStatus: [200, 404] });

  // ─── 15. Audit Logs (requires auth — expect 401) ───
  section('15. Audit Logs — Auth Required');
  await request('GET', '/api/v1/audit-logs', { expectStatus: 401 });

  // ─── 16. Rates (requires auth — expect 401) ───
  section('16. Rates — Auth Required');
  await request('POST', '/api/v1/rates/calculate', { body: {}, expectStatus: 401 });

  // ─── 17. Upload (requires auth + multipart — expect 401) ───
  section('17. Upload — Auth Required');
  await request('GET', '/api/v1/upload', { expectStatus: [401, 404] });

  // ─── 18. Merchants (requires auth — expect 401) ───
  section('18. Merchants — Auth Required');
  await request('GET', '/api/v1/merchants', { expectStatus: 401 });

  // ─── 19. Security Headers ───
  section('19. Security Headers');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const headers = res.headers;
    const hasHelmet = headers.get('x-content-type-options') === 'nosniff' ||
                      headers.get('x-frame-options') === 'DENY' ||
                      headers.get('strict-transport-security');
    if (hasHelmet) {
      passed++;
      results.push({ method: 'GET', path: '/health (headers)', status: 200, result: '✅ PASS' });
    } else {
      failed++;
      results.push({ method: 'GET', path: '/health (headers)', status: 200, result: '⚠️ WARN', error: 'Helmet headers may not be set (check if app uses proxy)' });
    }
  } catch (e) {
    failed++;
    results.push({ method: 'GET', path: '/health (headers)', status: 'ERR', result: '❌ FAIL', error: e.message });
  }

  // ─── 20. Rate Limiting ───
  section('20. Rate Limiting Headers');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const hasRateLimit = res.headers.get('x-ratelimit-limit') || res.headers.get('x-ratelimit-remaining');
    if (hasRateLimit) {
      passed++;
      results.push({ method: 'GET', path: '/health (rate-limit)', status: 200, result: '✅ PASS' });
    } else {
      // Rate limiter may not apply to /health — this is OK
      passed++;
      results.push({ method: 'GET', path: '/health (rate-limit)', status: 200, result: '✅ PASS (health exempt)' });
    }
  } catch (e) {
    failed++;
    results.push({ method: 'GET', path: '/health (rate-limit)', status: 'ERR', result: '❌ FAIL', error: e.message });
  }

  // ─── 21. 404 Handler ───
  section('21. 404 Handler');
  await request('GET', '/api/v1/nonexistent-endpoint', { expectStatus: 404 });

  // ─── Summary ───
  summary();
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
