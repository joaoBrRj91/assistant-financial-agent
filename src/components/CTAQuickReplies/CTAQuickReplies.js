/**
 * Creates the CTA-specific quick reply buttons.
 * Shown in place of standard quick replies when stage is 'lead'.
 *
 * @param {object}   [callbacks]
 * @param {Function} [callbacks.onAffirmative]  Called when affirmative button is clicked
 * @param {Function} [callbacks.onDecline]      Called when decline button is clicked
 * @returns {HTMLElement}
 */
export function createCTAQuickReplies(callbacks = {}) {
  const { onAffirmative, onDecline } = callbacks

  const container = document.createElement('div')
  container.className = 'cta-quick-replies'

  const affirmBtn = document.createElement('button')
  affirmBtn.className = 'quick-reply-btn quick-reply-btn--primary teal'
  affirmBtn.textContent = 'Sim, quero saber mais!'
  affirmBtn.addEventListener('click', () => {
    if (typeof onAffirmative === 'function') onAffirmative()
  })

  const declineBtn = document.createElement('button')
  declineBtn.className = 'quick-reply-btn'
  declineBtn.textContent = 'Ainda tenho dúvidas'
  declineBtn.addEventListener('click', () => {
    if (typeof onDecline === 'function') onDecline()
  })

  container.appendChild(affirmBtn)
  container.appendChild(declineBtn)

  return container
}
