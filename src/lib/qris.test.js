import assert from 'node:assert/strict';
import test from 'node:test';
import { createDynamicQris, crc16CcittFalse, validateQrisPayload } from './qris.js';

function makePayload(fields) {
  const content = fields.map(({ id, value }) => `${id}${String(value.length).padStart(2, '0')}${value}`).join('');
  const unsignedPayload = `${content}6304`;
  return `${unsignedPayload}${crc16CcittFalse(unsignedPayload)}`;
}

const staticPayload = makePayload([
  { id: '00', value: '01' },
  { id: '01', value: '11' },
  { id: '26', value: 'A00001' },
  { id: '52', value: '5499' },
  { id: '53', value: '360' },
  { id: '58', value: 'ID' },
  { id: '59', value: '2AKINOSTORE' },
  { id: '60', value: 'JAKARTA' },
]);

test('CRC16-CCITT-FALSE matches the standard check value', () => {
  assert.equal(crc16CcittFalse('123456789'), '29B1');
});

test('converts a static QRIS payload into dynamic QRIS with the exact amount', () => {
  const dynamicPayload = createDynamicQris(staticPayload, 2000);
  assert.equal(validateQrisPayload(dynamicPayload), 2000);
  assert.match(dynamicPayload, /010212/);
  assert.match(dynamicPayload, /530336054042000/);
});

test('replaces an existing amount rather than duplicating it', () => {
  const existingDynamicPayload = makePayload([
    { id: '00', value: '01' },
    { id: '01', value: '12' },
    { id: '26', value: 'A00001' },
    { id: '52', value: '5499' },
    { id: '53', value: '360' },
    { id: '54', value: '15000' },
    { id: '58', value: 'ID' },
    { id: '59', value: '2AKINOSTORE' },
    { id: '60', value: 'JAKARTA' },
  ]);
  const updatedPayload = createDynamicQris(existingDynamicPayload, 2000);

  assert.equal(validateQrisPayload(updatedPayload), 2000);
  assert.equal((updatedPayload.match(/54\d{2}2000/g) || []).length, 1);
});

test('rejects invalid amounts and source CRC corruption', () => {
  assert.throws(() => createDynamicQris(staticPayload, 0), /Nominal pembayaran/);
  assert.throws(() => createDynamicQris(staticPayload, 10000000000000), /Nominal pembayaran/);
  assert.throws(() => createDynamicQris(staticPayload.slice(0, -1) + '0', 2000), /CRC/);
});

test('rejects source QRIS codes that add an undisclosed service fee', () => {
  const payloadWithFee = makePayload([
    { id: '00', value: '01' },
    { id: '01', value: '11' },
    { id: '26', value: 'A00001' },
    { id: '52', value: '5499' },
    { id: '53', value: '360' },
    { id: '55', value: '02' },
    { id: '58', value: 'ID' },
    { id: '59', value: '2AKINOSTORE' },
    { id: '60', value: 'JAKARTA' },
  ]);
  assert.throws(() => createDynamicQris(payloadWithFee, 2000), /biaya tambahan/);
});
