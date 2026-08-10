export function normalizeQuoteOriginal(original) {
  if (!original || typeof original !== 'object' || Array.isArray(original)) return null;
  const text = typeof original.text === 'string' ? original.text.trim() : '';
  const lang = typeof original.lang === 'string' ? original.lang.trim() : '';
  const label = typeof original.label === 'string' ? original.label.trim() : '';
  return text && lang && label ? { text, lang, label } : null;
}

export function createQuoteOriginalController({ button, panel, label, text }) {
  let activeOriginal = null;

  function setExpanded(expanded) {
    const shouldExpand = Boolean(activeOriginal && expanded);
    button?.setAttribute('aria-expanded', String(shouldExpand));
    if (panel) panel.hidden = !shouldExpand;
    return shouldExpand;
  }

  function render(quote) {
    activeOriginal = normalizeQuoteOriginal(quote?.original);
    setExpanded(false);
    if (button) button.hidden = !activeOriginal;
    if (label) label.textContent = activeOriginal?.label ?? '';
    if (text) {
      text.textContent = activeOriginal?.text ?? '';
      if (activeOriginal) text.setAttribute('lang', activeOriginal.lang);
      else text.removeAttribute('lang');
    }
  }

  function toggle() {
    if (!activeOriginal) return false;
    return setExpanded(button?.getAttribute('aria-expanded') !== 'true');
  }

  button?.addEventListener('click', toggle);
  render(null);
  return { render, toggle };
}
