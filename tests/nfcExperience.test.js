import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPinnedNfcUrl, readNfcRequest } from '../nfcExperience.js';

test('una entrada desde la pulsera representa un encuentro nuevo', () => {
  assert.deepEqual(readNfcRequest('?origen=nfc&encuentro=scan-1'), {
    isNfc: true,
    isNewEncounter: true,
    quoteId: '',
    encounterId: 'scan-1',
  });
});

test('una frase NFC fijada se conserva al recargar', () => {
  assert.deepEqual(readNfcRequest('?modo=nfc&frase=quote-90&encuentro=scan-1'), {
    isNfc: true,
    isNewEncounter: false,
    quoteId: 'quote-90',
    encounterId: 'scan-1',
  });
});

test('la URL fijada elimina la señal que produciría un nuevo sorteo', () => {
  assert.equal(
    buildPinnedNfcUrl('https://paramoliterario.com/?origen=nfc&encuentro=scan-1', 'quote-90', 'scan-1'),
    '/?modo=nfc&frase=quote-90&encuentro=scan-1',
  );
  assert.equal(readNfcRequest('?modo=nfc&frase=quote-90&encuentro=scan-1').isNewEncounter, false);
});

test('la portada normal no activa el modo NFC', () => {
  assert.deepEqual(readNfcRequest(''), {
    isNfc: false,
    isNewEncounter: false,
    quoteId: '',
    encounterId: '',
  });
});
