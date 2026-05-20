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
  heading.textContent = 'Quer dar o próximo passo?'

  const body = document.createElement('p')
  body.className = 'cta-card__body'
  body.textContent =
    'Maurício oferece consultorias individuais — juntos vocês vão montar um orçamento real, identificar onde o dinheiro está vazando e criar uma estratégia financeira personalizada.'

  const question = document.createElement('p')
  question.className = 'cta-card__question'
  question.textContent = 'Posso te enviar mais informações?'

  card.appendChild(heading)
  card.appendChild(body)
  card.appendChild(question)

  return card
}
