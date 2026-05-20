import { describe, it, expect, vi } from 'vitest'
import { createReserveCard } from '../components/ReserveCard/ReserveCard.js'

const VALID_CALC_DATA = {
  salario: 3500,
  despesas: 2975,
  meta: 8925,
  mensal: 350,
  prazo: 25.5
}

describe('createReserveCard', () => {
  describe('render conditions', () => {
    it('returns a DOM element when calcData is valid and isCTA is false', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      expect(card).not.toBeNull()
      expect(card).toBeInstanceOf(HTMLElement)
    })

    it('returns null when calcData is null', () => {
      expect(createReserveCard(null, false)).toBeNull()
    })

    it('returns null when calcData is undefined', () => {
      expect(createReserveCard(undefined, false)).toBeNull()
    })

    it('returns null when isCTA is true (even with valid calcData)', () => {
      expect(createReserveCard(VALID_CALC_DATA, true)).toBeNull()
    })

    it('returns null when a required field is missing', () => {
      const { prazo: _removed, ...partial } = VALID_CALC_DATA
      expect(createReserveCard(partial, false)).toBeNull()
    })

    it('returns null when a field is zero', () => {
      expect(createReserveCard({ ...VALID_CALC_DATA, despesas: 0 }, false)).toBeNull()
    })

    it('returns null when a field is negative', () => {
      expect(createReserveCard({ ...VALID_CALC_DATA, salario: -100 }, false)).toBeNull()
    })
  })

  describe('card structure', () => {
    it('renders exactly 5 rows', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      const rows = card.querySelectorAll('.card-row')
      expect(rows).toHaveLength(5)
    })

    it('each row has a label and a value element', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      const rows = card.querySelectorAll('.card-row')
      rows.forEach(row => {
        expect(row.querySelector('.card-row-label')).not.toBeNull()
        expect(row.querySelector('.card-row-value')).not.toBeNull()
      })
    })
  })

  describe('monetary value formatting', () => {
    it('displays salario as BRL currency', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      expect(card.textContent).toContain('R$ 3.500')
    })

    it('displays despesas as BRL currency', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      expect(card.textContent).toContain('R$ 2.975')
    })

    it('displays meta as BRL currency', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      expect(card.textContent).toContain('R$ 8.925')
    })

    it('displays mensal as BRL currency', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      expect(card.textContent).toContain('R$ 350')
    })
  })

  describe('timeline formatting', () => {
    it('displays prazo as human-readable timeline', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      expect(card.textContent).toContain('~26 months')
    })

    it('displays years format for prazo >= 36', () => {
      const card = createReserveCard({ ...VALID_CALC_DATA, prazo: 36 }, false)
      expect(card.textContent).toContain('3 years')
    })
  })

  describe('visual styling', () => {
    it('last row (timeline) value has highlight class', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      const rows = card.querySelectorAll('.card-row')
      const lastRow = rows[rows.length - 1]
      const valueEl = lastRow.querySelector('.card-row-value')
      expect(valueEl.classList.contains('card-row-value--highlight')).toBe(true)
    })

    it('non-timeline rows do NOT have the highlight class', () => {
      const card = createReserveCard(VALID_CALC_DATA, false)
      const rows = card.querySelectorAll('.card-row')
      const nonTimelineRows = Array.from(rows).slice(0, 4)
      nonTimelineRows.forEach(row => {
        const valueEl = row.querySelector('.card-row-value')
        expect(valueEl.classList.contains('card-row-value--highlight')).toBe(false)
      })
    })
  })

  describe('stage callback', () => {
    it('calls onStageAdvance when card is created with valid data', () => {
      const onStageAdvance = vi.fn()
      createReserveCard(VALID_CALC_DATA, false, onStageAdvance)
      expect(onStageAdvance).toHaveBeenCalledWith('reserve')
    })

    it('does not call onStageAdvance when calcData is invalid', () => {
      const onStageAdvance = vi.fn()
      createReserveCard(null, false, onStageAdvance)
      expect(onStageAdvance).not.toHaveBeenCalled()
    })

    it('does not call onStageAdvance when isCTA is true', () => {
      const onStageAdvance = vi.fn()
      createReserveCard(VALID_CALC_DATA, true, onStageAdvance)
      expect(onStageAdvance).not.toHaveBeenCalled()
    })

    it('works without onStageAdvance callback (no error thrown)', () => {
      expect(() => createReserveCard(VALID_CALC_DATA, false)).not.toThrow()
    })
  })
})
