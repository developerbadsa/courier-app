/**
 * Unit test suite for Maintenance Mode service & logic
 * Run: node src/tests/maintenance-unit-test.js
 */

const {
  DEFAULT_MAINTENANCE_CONFIG,
  isPathTargeted,
  evaluateScheduleActive,
} = require('../services/systemSettingService');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${name}`);
  }
}

console.log('\n┌─── MAINTENANCE MODE UNIT TESTS ───┐');

// Test 1: Default config properties
console.log('\n[1. Default Configuration]');
assert(DEFAULT_MAINTENANCE_CONFIG.isEnabled === false, 'Default isEnabled is false');
assert(DEFAULT_MAINTENANCE_CONFIG.targetScope === 'CUSTOM', 'Default targetScope is CUSTOM');
assert(Array.isArray(DEFAULT_MAINTENANCE_CONFIG.targetRoles), 'targetRoles is an array');
assert(DEFAULT_MAINTENANCE_CONFIG.allowedRoles.includes('super_admin'), 'super_admin is in allowedRoles');

// Test 2: Route pattern matching (isPathTargeted)
console.log('\n[2. Route Pattern Matching]');
const targetPages = ['/', '/track', '/dashboard', '/dashboard/shipments', '/rider/*'];

assert(isPathTargeted('/', targetPages, 'CUSTOM') === true, 'Matches exact "/" path');
assert(isPathTargeted('/track', targetPages, 'CUSTOM') === true, 'Matches "/track" path');
assert(isPathTargeted('/dashboard', targetPages, 'CUSTOM') === true, 'Matches "/dashboard" path');
assert(isPathTargeted('/dashboard/shipments', targetPages, 'CUSTOM') === true, 'Matches "/dashboard/shipments" path');
assert(isPathTargeted('/rider/tasks/123', targetPages, 'CUSTOM') === true, 'Matches wildcard "/rider/*" path');
assert(isPathTargeted('/admin', targetPages, 'CUSTOM') === false, 'Does not match unlisted "/admin" path');
assert(isPathTargeted('/login', targetPages, 'CUSTOM') === false, 'Does not match unlisted "/login" path');
assert(isPathTargeted('/anything', targetPages, 'ALL') === true, 'Matches any path when targetScope is "ALL"');

// Test 3: Schedule evaluation
console.log('\n[3. Schedule Timer Evaluation]');
const now = new Date();
const pastDate = new Date(now.getTime() - 3600000).toISOString();
const futureDate = new Date(now.getTime() + 3600000).toISOString();

assert(evaluateScheduleActive({ isEnabled: false }) === false, 'Disabled returns false');
assert(evaluateScheduleActive({ isEnabled: true }) === true, 'Enabled with no dates returns true');
assert(evaluateScheduleActive({ isEnabled: true, startAt: pastDate, endAt: futureDate }) === true, 'Active within start & end window returns true');
assert(evaluateScheduleActive({ isEnabled: true, startAt: futureDate }) === false, 'Future start returns false (not started yet)');
assert(evaluateScheduleActive({ isEnabled: true, endAt: pastDate }) === false, 'Past end returns false (already finished)');

console.log('\n═══════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
