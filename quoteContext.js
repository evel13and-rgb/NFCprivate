export function normalizeQuoteContextNotes(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const term = typeof item.term === 'string' ? item.term.trim() : '';
    const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : '';
    return term && explanation ? [{ term, explanation }] : [];
  });
}

export function normalizeQuoteLetterContext(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const recipient = typeof value.recipient === 'string' ? value.recipient.trim() : '';
  const date = typeof value.date === 'string' ? value.date.trim() : '';
  if (!recipient || !date) return null;
  const result = { recipient, date };
  for (const field of ['place', 'note']) {
    const normalized = typeof value[field] === 'string' ? value[field].trim() : '';
    if (normalized) result[field] = normalized;
  }
  return result;
}

export function createQuoteContextController({ container, button, closeButton, count, panel, list }) {
  let notes = [];
  let letterContext = null;

  function contextCount() {
    return notes.length + (letterContext ? 1 : 0);
  }

  function getToggleLabel(expanded) {
    if (expanded) return 'Cerrar el contexto del fragmento';
    const total = contextCount();
    const suffix = total === 1 ? '1 elemento' : `${total} elementos`;
    return `Abrir ${suffix} de contexto`;
  }

  function setExpanded(nextExpanded) {
    const expanded = Boolean(nextExpanded && contextCount());
    if (button) {
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', getToggleLabel(expanded));
      button.setAttribute('title', getToggleLabel(expanded));
    }
    if (panel) panel.hidden = !expanded;
    return expanded;
  }

  function createEntry(documentRef, term, explanation, extraClass = '') {
    const entry = documentRef.createElement('div');
    entry.className = `quote-context__entry${extraClass ? ` ${extraClass}` : ''}`;
    const name = documentRef.createElement('dt');
    name.textContent = term;
    const description = documentRef.createElement('dd');
    description.textContent = explanation;
    entry.append(name, description);
    return entry;
  }

  function createSection(documentRef, label, entries, extraClass = '') {
    const section = documentRef.createElement('section');
    section.className = `quote-context__section${extraClass ? ` ${extraClass}` : ''}`;
    const heading = documentRef.createElement('p');
    heading.className = 'quote-context__section-label';
    heading.textContent = label;
    const definitionList = documentRef.createElement('dl');
    definitionList.className = 'quote-context__definition-list';
    definitionList.append(...entries);
    section.append(heading, definitionList);
    return section;
  }

  function render(quote) {
    notes = normalizeQuoteContextNotes(quote?.context_notes);
    letterContext = normalizeQuoteLetterContext(quote?.letter_context);
    setExpanded(false);
    const total = contextCount();
    if (container) container.hidden = total === 0;
    if (count) count.textContent = total ? String(total) : '';

    if (list?.replaceChildren) {
      const documentRef = list.ownerDocument || globalThis.document;
      const sections = [];
      if (letterContext) {
        const letterFields = [
          ['Destinatario', letterContext.recipient],
          ['Fecha', letterContext.date],
          ...(letterContext.place ? [['Lugar', letterContext.place]] : []),
          ...(letterContext.note ? [['Precisión', letterContext.note]] : []),
        ];
        sections.push(createSection(
          documentRef,
          'Datos de la carta',
          letterFields.map(([term, explanation]) => (
            createEntry(documentRef, term, explanation, 'quote-context__entry--letter')
          )),
          'quote-context__section--letter',
        ));
      }
      if (notes.length) {
        sections.push(createSection(
          documentRef,
          'Notas explicativas',
          notes.map(({ term, explanation }) => createEntry(documentRef, term, explanation)),
        ));
      }
      list.replaceChildren(...sections);
    }

    return { letterContext, notes };
  }

  function toggle() {
    return setExpanded(button?.getAttribute('aria-expanded') !== 'true');
  }

  button?.addEventListener('click', toggle);
  closeButton?.addEventListener('click', () => setExpanded(false));
  render(null);

  return { render, setExpanded, toggle };
}
