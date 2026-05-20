/**
 * Creates a single row DOM element for the ReserveCard.
 *
 * @param {string} label
 * @param {string} value
 * @param {boolean} isHighlight  When true, value receives teal highlight class
 * @returns {HTMLElement}
 */
export function createCardRow(label, value, isHighlight) {
  const row = document.createElement('div')
  row.className = 'card-row'

  const labelEl = document.createElement('span')
  labelEl.className = 'card-row-label'
  labelEl.textContent = label

  const valueEl = document.createElement('span')
  valueEl.className = isHighlight
    ? 'card-row-value card-row-value--highlight'
    : 'card-row-value'
  valueEl.textContent = value

  row.appendChild(labelEl)
  row.appendChild(valueEl)
  return row
}
