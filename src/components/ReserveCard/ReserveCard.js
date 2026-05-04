import { formatBRL, formatTimeline } from '../../utils/formatReserve.js'
import { createCardRow } from './CardRow.js'

const REQUIRED_FIELDS = ['salario', 'despesas', 'meta', 'mensal', 'prazo']

function isValidCalcData(calcData) {
  if (!calcData || typeof calcData !== 'object') return false
  return REQUIRED_FIELDS.every(
    field => typeof calcData[field] === 'number' && calcData[field] > 0
  )
}

/**
 * Creates the ReserveCard DOM element to render inside a bot bubble.
 * Returns null when conditions for rendering are not met.
 *
 * @param {object|null} calcData
 * @param {boolean}     isCTA
 * @param {Function}    [onStageAdvance]  Called with 'reserve' on successful render
 * @returns {HTMLElement|null}
 */
export function createReserveCard(calcData, isCTA, onStageAdvance) {
  if (isCTA || !isValidCalcData(calcData)) {
    return null
  }

  const card = document.createElement('div')
  card.className = 'reserve-card'

  const rows = [
    { label: 'Renda mensal',    value: formatBRL(calcData.salario),        highlight: false },
    { label: 'Gastos estimados', value: formatBRL(calcData.despesas),      highlight: false },
    { label: 'Meta (3 meses)',  value: formatBRL(calcData.meta),           highlight: false },
    { label: 'Guardar por mês', value: formatBRL(calcData.mensal),         highlight: false },
    { label: 'Prazo estimado',  value: formatTimeline(calcData.prazo),     highlight: true  },
  ]

  rows.forEach(({ label, value, highlight }) => {
    card.appendChild(createCardRow(label, value, highlight))
  })

  if (typeof onStageAdvance === 'function') {
    onStageAdvance('reserve')
  }

  return card
}
