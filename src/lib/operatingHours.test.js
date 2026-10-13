import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertQrisOpen,
  getWibTime,
  isQrisOpen,
  STORE_CLOSED_MESSAGE,
  wibTimeToUtcDate,
} from './operatingHours.js';

test('QRIS opens at 07:00 WIB and is closed one minute before', () => {
  assert.equal(isQrisOpen(wibTimeToUtcDate(6, 59)), false);
  assert.equal(isQrisOpen(wibTimeToUtcDate(7, 0)), true);
});

test('QRIS stays open through the day and closes at 20:00 WIB', () => {
  assert.equal(isQrisOpen(wibTimeToUtcDate(12, 0)), true);
  assert.equal(isQrisOpen(wibTimeToUtcDate(19, 59)), true);
  assert.equal(isQrisOpen(wibTimeToUtcDate(20, 0)), false);
  assert.equal(isQrisOpen(wibTimeToUtcDate(23, 30)), false);
  assert.equal(isQrisOpen(wibTimeToUtcDate(0, 0)), false);
});

test('the rule follows WIB regardless of the instant timezone', () => {
  // 2026-03-01T00:30:00Z is 07:30 WIB, so the store is open even though the
  // UTC clock reads after midnight.
  assert.equal(isQrisOpen(new Date('2026-03-01T00:30:00Z')), true);
  // 2026-03-01T13:00:00Z is 20:00 WIB exactly, so the store is closed.
  assert.equal(isQrisOpen(new Date('2026-03-01T13:00:00Z')), false);
  // 2026-03-01T12:59:00Z is 19:59 WIB.
  assert.equal(isQrisOpen(new Date('2026-03-01T12:59:00Z')), true);
});

test('WIB clock reads correctly across the UTC date boundary', () => {
  assert.deepEqual(getWibTime(new Date('2026-03-01T00:30:00Z')), { hour: 7, minute: 30 });
  assert.deepEqual(getWibTime(new Date('2026-02-28T17:00:00Z')), { hour: 0, minute: 0 });
  assert.deepEqual(getWibTime(new Date('2026-03-01T13:00:00Z')), { hour: 20, minute: 0 });
});

test('assertQrisOpen throws the customer-facing notice only when closed', () => {
  assert.doesNotThrow(() => assertQrisOpen(wibTimeToUtcDate(9, 15)));
  assert.throws(() => assertQrisOpen(wibTimeToUtcDate(20, 0)), (error) => {
    assert.equal(error.message, STORE_CLOSED_MESSAGE);
    assert.match(error.message, /07\.00–20\.00 WIB/);
    return true;
  });
});

test('the closure notice mentions the correct window', () => {
  assert.match(STORE_CLOSED_MESSAGE, /07\.00–20\.00 WIB/);
});
