/**
 * Converts a subset of markdown to safe HTML.
 * Escapes HTML entities first to prevent XSS, then applies transformations.
 *
 * Supported: **bold**, \n → <br>
 *
 * @param {string} text
 * @returns {string} HTML string safe for innerHTML
 */
export function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}
