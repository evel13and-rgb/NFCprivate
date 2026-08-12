const OPENING_QUOTE_CHARACTERS = new Set(['"', '“', '«', '„', '‟', '‹', '‘']);
const CLOSING_QUOTE_CHARACTERS = new Set(['"', '”', '»', '‟', '›', '’']);

export function getQuoteBoundaryDecoration(text) {
  const content = typeof text === 'string' ? text.trim() : '';
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
