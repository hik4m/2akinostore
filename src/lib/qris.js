function parseFields(payload) {
  if (!/^[\x20-\x7E]+$/.test(payload)) {
    throw new Error('Payload QRIS berisi karakter yang tidak didukung.');
  }

  const fields = [];
  let offset = 0;
  while (offset < payload.length) {
    if (offset + 4 > payload.length) {
      throw new Error('Payload QRIS memiliki struktur TLV yang tidak valid.');
    }

    const id = payload.slice(offset, offset + 2);
    const lengthText = payload.slice(offset + 2, offset + 4);
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(lengthText)) {
      throw new Error('Tag QRIS memiliki format yang tidak valid.');
    }

    const length = Number(lengthText);
    const valueStart = offset + 4;
    const valueEnd = valueStart + length;
    if (valueEnd > payload.length) {
      throw new Error(`Panjang data tag QRIS ${id} tidak valid.`);
    }

    fields.push({ id, value: payload.slice(valueStart, valueEnd) });
    offset = valueEnd;
  }
  return fields;
}

export function crc16CcittFalse(value) {
  let crc = 0xffff;
  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function encodeField({ id, value }) {
  if (value.length > 99) {
    throw new Error(`Data tag QRIS ${id} melebihi batas panjang.`);
  }
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

export function createDynamicQris(staticPayload, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0 || String(amount).length > 13) {
    throw new Error('Nominal pembayaran QRIS tidak valid.');
  }

  const fields = parseFields(staticPayload);
  const crcField = fields.at(-1);
  if (crcField?.id !== '63' || crcField.value.length !== 4 || !/^[0-9A-Fa-f]{4}$/.test(crcField.value)) {
    throw new Error('QRIS sumber tidak memiliki tag CRC yang valid.');
  }

  const payloadWithoutCrc = staticPayload.slice(0, -4);
  if (crc16CcittFalse(payloadWithoutCrc) !== crcField.value.toUpperCase()) {
    throw new Error('Pemeriksaan CRC QRIS sumber gagal; gunakan kode QRIS yang valid.');
  }

  const coreFields = fields.slice(0, -1);
  if (coreFields.some(({ id }) => id === '63') || new Set(coreFields.map(({ id }) => id)).size !== coreFields.length) {
    throw new Error('Payload QRIS sumber memiliki tag tingkat atas duplikat.');
  }
  const fieldValue = (id) => coreFields.find((field) => field.id === id)?.value;
  if (fieldValue('00') !== '01' || !['11', '12'].includes(fieldValue('01'))) {
    throw new Error('QRIS sumber bukan payload EMVCo yang didukung.');
  }
  if (fieldValue('53') !== '360') {
    throw new Error('QRIS sumber tidak menggunakan mata uang Rupiah (IDR).');
  }
  if (!coreFields.some(({ id }) => Number(id) >= 26 && Number(id) <= 51)) {
    throw new Error('QRIS sumber tidak memuat identitas merchant.');
  }
  if (coreFields.some(({ id }) => ['55', '56', '57'].includes(id))) {
    throw new Error('QRIS sumber memiliki pengaturan biaya tambahan yang tidak didukung.');
  }

  const withoutAmount = coreFields.filter(({ id }) => id !== '54');
  const initiationIndex = withoutAmount.findIndex(({ id }) => id === '01');
  if (initiationIndex === -1) {
    throw new Error('Tag inisiasi QRIS tidak ditemukan.');
  }
  withoutAmount[initiationIndex] = { id: '01', value: '12' };

  const currencyIndex = withoutAmount.findIndex(({ id }) => id === '53');
  if (currencyIndex === -1) {
    throw new Error('Tag mata uang QRIS tidak ditemukan.');
  }
  withoutAmount.splice(currencyIndex + 1, 0, { id: '54', value: String(amount) });

  const unsignedPayload = withoutAmount.map(encodeField).join('') + '6304';
  return `${unsignedPayload}${crc16CcittFalse(unsignedPayload)}`;
}

export function validateQrisPayload(payload) {
  const fields = parseFields(payload);
  const crcField = fields.at(-1);
  if (crcField?.id !== '63' || crcField.value.length !== 4 || !/^[0-9A-Fa-f]{4}$/.test(crcField.value)) {
    throw new Error('QRIS dinamis tidak memiliki tag CRC yang valid.');
  }

  const unsignedPayload = payload.slice(0, -4);
  if (crc16CcittFalse(unsignedPayload) !== crcField.value.toUpperCase()) {
    throw new Error('Verifikasi CRC QRIS dinamis gagal.');
  }

  const amountFields = fields.filter(({ id }) => id === '54');
  const initiation = fields.find(({ id }) => id === '01')?.value;
  if (amountFields.length !== 1 || initiation !== '12') {
    throw new Error('QRIS yang dihasilkan tidak memiliki mode dinamis dan nominal tunggal.');
  }

  return Number(amountFields[0].value);
}
