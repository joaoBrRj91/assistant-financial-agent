import { QUICK_REPLIES } from '../../constants/quickReplies.js'

/**
 * Creates the quick-reply button bar for the current stage.
 * Returns null for stages with no quick replies (start, lead).
 *
 * @param {string}   stage     Current stage key
 * @param {Function} [onSelect]  Called with the button text when clicked
 * @returns {HTMLElement|null}
 */
export function createQuickReplies(stage, onSelect) {
  const options = QUICK_REPLIES[stage]
  if (!options || options.length === 0) return null

  const container = document.createElement('div')
  container.className = 'quick-replies'

  options.forEach(text => {
    const btn = document.createElement('button')
    btn.className = 'quick-reply-btn'
    btn.textContent = text
    btn.addEventListener('click', () => {
      if (typeof onSelect === 'function') onSelect(text)
    })
    container.appendChild(btn)
  })

  return container
}
