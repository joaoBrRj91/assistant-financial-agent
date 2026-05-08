import { createCTACard } from '../CTACard/CTACard.js'
import { renderMarkdown } from '../../utils/renderMarkdown.js'

/**
 * Creates the CTA bubble DOM element.
 * Returns null when isCTA is not true.
 *
 * @param {string}   text               Cleaned model text (shown above card when non-empty)
 * @param {object}   [options]
 * @param {boolean}  [options.isCTA]    Must be true to render
 * @param {Function} [options.onStageAdvance]  Called with 'lead' on render
 * @returns {HTMLElement|null}
 */
export function createCTABubble(text, options = {}) {
  if (!options.isCTA) return null

  const bubble = document.createElement('div')
  bubble.className = 'cta-bubble'

  if (text && text.length > 0) {
    const textEl = document.createElement('p')
    textEl.className = 'cta-bubble__text'
    textEl.innerHTML = renderMarkdown(text)
    bubble.appendChild(textEl)
  }

  bubble.appendChild(createCTACard())

  if (typeof options.onStageAdvance === 'function') {
    options.onStageAdvance('lead')
  }

  return bubble
}
