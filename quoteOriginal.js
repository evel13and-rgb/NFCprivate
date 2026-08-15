const OPENING_QUOTE_CHARACTERS = new Set(['"', '“', '«', '„', '‟', '‹', '‘']);
const CLOSING_QUOTE_CHARACTERS = new Set(['"', '”', '»', '‟', '›', '’']);
const CONTINUATION_QUOTE_CHARACTERS = new Set(['»', '›']);

export function getQuoteBoundaryDecoration(text) {
  const content = typeof text === 'string' ? text.trim() : '';
  if (CONTINUATION_QUOTE_CHARACTERS.has(content.at(0))) {
    return { addOpening: false, addClosing: false };
  }
  return {
    addOpening: !OPENING_QUOTE_CHARACTERS.has(content.at(0)),
    addClosing: !CLOSING_QUOTE_CHARACTERS.has(content.at(-1)),
  };
}

export function formatQuotedText(text) {
  const content = typeof text === 'string' ? text.trim() : '';
  const { addOpening, addClosing } = getQuoteBoundaryDecoration(content);
  return `${addOpening ? '“' : ''}${content}${addClosing ? '”' : ''}`;
}

export function normalizeQuoteOriginal(original) {
  if (!original || typeof original !== 'object' || Array.isArray(original)) return null;
  const text = typeof original.text === 'string' ? original.text.trim() : '';
  const lang = typeof original.lang === 'string' ? original.lang.trim() : '';
  const label = typeof original.label === 'string' ? original.label.trim() : '';
  return text && lang && label ? { text, lang, label } : null;
}

export function createQuoteOriginalController({ button, label, onViewChange }) {
  let activeQuote = null;
  let activeOriginal = null;
  let activeView = 'translation';

  function setView(view) {
    activeView = view === 'original' && activeOriginal ? 'original' : 'translation';
    const showingOriginal = activeView === 'original';
    const sameLanguage = activeOriginal
      && typeof activeQuote?.lang === 'string'
      && activeQuote.lang.trim().toLowerCase() === activeOriginal.lang.trim().toLowerCase();
    const returnViewName = sameLanguage ? 'actualización' : 'traducción';
    if (button) {
      button.hidden = !activeOriginal;
      if (!button.querySelector?.('[data-quote-view]')) {
        button.textContent = showingOriginal
          ? returnViewName[0].toUpperCase() + returnViewName.slice(1)
          : 'Original';
      }
      button.setAttribute('aria-pressed', String(showingOriginal));
      button.setAttribute('aria-label', showingOriginal ? `Ver ${returnViewName}` : 'Ver texto original');
    }
    if (label) {
      label.hidden = !showingOriginal;
      label.textContent = showingOriginal ? activeOriginal.label : '';
    }
    const visibleVersion = showingOriginal
      ? { text: activeOriginal.text, lang: activeOriginal.lang, view: activeView }
      : { text: activeQuote?.t ?? '', lang: activeQuote?.lang ?? '', view: activeView };
    onViewChange?.(visibleVersion);
    return activeView;
  }

  function render(quote) {
    activeQuote = quote && typeof quote === 'object' ? quote : null;
    activeOriginal = normalizeQuoteOriginal(quote?.original);
    return setView('translation');
  }

  function toggle() {
    if (!activeOriginal) return activeView;
    return setView(activeView === 'translation' ? 'original' : 'translation');
  }

  button?.addEventListener('click', toggle);
  render(null);
  return { render, toggle };
}
