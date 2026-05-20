import { describe, it, expect } from 'vitest'
import { formatBRL, formatTimeline } from '../utils/formatReserve.js'

describe('formatBRL', () => {
  it('formats 3500 as "R$ 3.500"', () => {
    expect(formatBRL(3500)).toBe('R$ 3.500')
  })

  it('formats 20000 as "R$ 20.000"', () => {
    expect(formatBRL(20000)).toBe('R$ 20.000')
  })

  it('formats 350 as "R$ 350" (no thousands separator)', () => {
    expect(formatBRL(350)).toBe('R$ 350')
  })

  it('formats 8925 as "R$ 8.925"', () => {
    expect(formatBRL(8925)).toBe('R$ 8.925')
  })

  it('formats 2975 as "R$ 2.975"', () => {
    expect(formatBRL(2975)).toBe('R$ 2.975')
  })

  it('has no decimal places (no comma-separated fraction)', () => {
    // pt-BR decimal separator is comma — absence of comma confirms no fractional part
    expect(formatBRL(3500)).not.toContain(',')
    expect(formatBRL(3500.75)).not.toContain(',')
  })
})

describe('formatTimeline', () => {
  it('returns "~9 months" for prazo = 9 (well under threshold)', () => {
    expect(formatTimeline(9)).toBe('~9 months')
  })

  it('returns "~24 months" for prazo = 24 (boundary — not strictly > threshold)', () => {
    expect(formatTimeline(24)).toBe('~24 months')
  })

  it('returns "~25 months" for prazo = 24.1 (ceiling applied; still months)', () => {
    expect(formatTimeline(24.1)).toBe('~25 months')
  })

  it('returns "~26 months" for prazo = 25.5 (ceiling applied)', () => {
    expect(formatTimeline(25.5)).toBe('~26 months')
  })

  it('returns "3 years" for prazo = 36 (exactly 3 years — shows as years, no ~)', () => {
    expect(formatTimeline(36)).toBe('3 years')
  })

  it('returns "4 years" for prazo = 48 (clearly in years range)', () => {
    expect(formatTimeline(48)).toBe('4 years')
  })

  it('returns "~35 months" for prazo = 35 (just below years threshold)', () => {
    expect(formatTimeline(35)).toBe('~35 months')
  })

  it('does not add ~ prefix for years display', () => {
    expect(formatTimeline(36)).not.toContain('~')
  })

  it('adds ~ prefix for months display', () => {
    expect(formatTimeline(12)).toMatch(/^~/)
  })
})
