/**
 * Creates the returning-client context tag shown once per session.
 *
 * @param {string} theme  Previous conversation theme from the RETURNING token
 * @returns {HTMLElement}
 */
export function createContextTag(theme) {
  const el = document.createElement('div')
  el.className = 'context-tag context-tag--amber'

  const em = document.createElement('em')
  em.textContent = `Contexto anterior: ${theme}`

  el.appendChild(em)
  return el
}
