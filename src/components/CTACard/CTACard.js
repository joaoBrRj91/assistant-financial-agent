/**
 * Creates the fixed-content CTA card shown inside a CTABubble.
 * Content is never driven by props.
 *
 * @returns {HTMLElement}
 */
export function createCTACard() {
  const card = document.createElement('div')
  card.className = 'cta-card teal'

  const heading = document.createElement('p')
  heading.className = 'cta-card__heading'
  heading.textContent = 'Want to go further?'

  const body = document.createElement('p')
  body.className = 'cta-card__body'
  body.textContent =
    "Maurício offers individual consultations — together you'll build a real budget, find where money is leaking, and create a personalized financial strategy."

  const question = document.createElement('p')
  question.className = 'cta-card__question'
  question.textContent = 'Can I send you more information?'

  card.appendChild(heading)
  card.appendChild(body)
  card.appendChild(question)

  return card
}
