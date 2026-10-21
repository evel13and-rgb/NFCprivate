export function normalizeQuoteContextNotes(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const term = typeof item.term === 'string' ? item.term.trim() : '';
    const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : '';
    return term && explanation ? [{ term, explanation }] : [];
  });
}

export function createQuoteContextController({ container, button, panel, list }) {
  let notes = [];

  function setExpanded(nextExpanded) {
    const expanded = Boolean(nextExpanded && notes.length);
    if (button) {
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', expanded
        ? 'Cerrar las notas de contexto'
        : 'Abrir las notas de contexto');
    }
    if (panel) panel.hidden = !expanded;
    return expanded;
  }

  function render(quote) {
    notes = normalizeQuoteContextNotes(quote?.context_notes);
    setExpanded(false);
    if (container) container.hidden = notes.length === 0;

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
  render(null);

  return { render, setExpanded, toggle };
}
