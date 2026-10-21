export function normalizeQuoteContextNotes(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const term = typeof item.term === 'string' ? item.term.trim() : '';
    const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : '';
    return term && explanation ? [{ term, explanation }] : [];
  });
}

export function createQuoteContextController({ container, button, closeButton, count, panel, list }) {
  let notes = [];

  function getToggleLabel(expanded) {
    if (expanded) return 'Cerrar las notas de contexto';
    const suffix = notes.length === 1 ? '1 nota' : `${notes.length} notas`;
    return `Abrir ${suffix} de contexto`;
  }

  function setExpanded(nextExpanded) {
    const expanded = Boolean(nextExpanded && notes.length);
    if (button) {
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', getToggleLabel(expanded));
      button.setAttribute('title', getToggleLabel(expanded));
    }
    if (panel) panel.hidden = !expanded;
    return expanded;
  }

  function render(quote) {
    notes = normalizeQuoteContextNotes(quote?.context_notes);
    setExpanded(false);
    if (container) container.hidden = notes.length === 0;
    if (count) count.textContent = notes.length ? String(notes.length) : '';

    if (list?.replaceChildren) {
      const documentRef = list.ownerDocument || globalThis.document;
      const entries = notes.map(({ term, explanation }) => {
        const entry = documentRef.createElement('div');
        entry.className = 'quote-context__entry';

        const name = documentRef.createElement('dt');
        name.textContent = term;
        const description = documentRef.createElement('dd');
        description.textContent = explanation;

        entry.append(name, description);
        return entry;
      });
      list.replaceChildren(...entries);
    }

    return notes;
  }

  function toggle() {
    return setExpanded(button?.getAttribute('aria-expanded') !== 'true');
  }

  button?.addEventListener('click', toggle);
  closeButton?.addEventListener('click', () => setExpanded(false));
  render(null);

  return { render, setExpanded, toggle };
}
