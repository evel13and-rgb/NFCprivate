export const NFC_MODE = 'nfc';

function normalizeSearch(search) {
  if (typeof search !== 'string') return '';
  return search.startsWith('?') ? search : `?${search}`;
}

export function readNfcRequest(search = '') {
  const params = new URLSearchParams(normalizeSearch(search));
  const quoteId = (params.get('frase') || '').trim();
  const encounterId = (params.get('encuentro') || '').trim();
  const isEntry = params.get('origen') === NFC_MODE;
  const isPinned = params.get('modo') === NFC_MODE && Boolean(quoteId);

  return {
    isNfc: isEntry || isPinned,
    isNewEncounter: isEntry && !isPinned,
    quoteId: isPinned ? quoteId : '',
    encounterId,
  };
}

export function buildPinnedNfcUrl(currentUrl, quoteId, encounterId = '') {
  const url = new URL(currentUrl);
  url.pathname = '/';
  url.search = '';
  url.hash = '';
  url.searchParams.set('modo', NFC_MODE);
  url.searchParams.set('frase', quoteId);
  if (encounterId) url.searchParams.set('encuentro', encounterId);
  return `${url.pathname}${url.search}`;
}
