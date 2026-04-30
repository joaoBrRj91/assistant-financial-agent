import { describe, it, expect, vi } from 'vitest'
import { parseSpecialTokens } from '../utils/tokenParser.js'

describe('parseSpecialTokens', () => {
  describe('return shape', () => {
    it('returns an object with text, calcData, isCTA, returningTheme', () => {
      const result = parseSpecialTokens('Hello')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('calcData')
      expect(result).toHaveProperty('isCTA')
      expect(result).toHaveProperty('returningTheme')
    })
  })

  describe('CALC token', () => {
    const validCalcJson = '{"salario":5000,"despesas":4250,"meta":12750,"mensal":500,"prazo":25}'

    it('strips CALC token from text', () => {
      const raw = `Some text |||CALC|||${validCalcJson}||| more text`
      const { text } = parseSpecialTokens(raw)
      expect(text).not.toContain('|||CALC|||')
      expect(text).not.toContain(validCalcJson)
      expect(text).toContain('Some text')
      expect(text).toContain('more text')
    })

    it('returns calcData with all 5 fields when CALC JSON is valid', () => {
      const { calcData } = parseSpecialTokens(`|||CALC|||${validCalcJson}|||`)
      expect(calcData).toEqual({
        salario: 5000,
        despesas: 4250,
        meta: 12750,
        mensal: 500,
        prazo: 25
      })
    })

    it('returns calcData null when CALC token is absent', () => {
      const { calcData } = parseSpecialTokens('No tokens here')
      expect(calcData).toBeNull()
    })

    it('returns calcData null when CALC JSON is malformed', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { calcData } = parseSpecialTokens('|||CALC|||{bad json{{|}|||')
      expect(calcData).toBeNull()
      consoleSpy.mockRestore()
    })

    it('logs a warning when CALC JSON is malformed', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      parseSpecialTokens('|||CALC|||{bad}|||')
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('returns calcData null when not all 5 required fields are present', () => {
      const partial = '{"salario":5000,"despesas":4250}'
      const { calcData } = parseSpecialTokens(`|||CALC|||${partial}|||`)
      expect(calcData).toBeNull()
    })

    it('returns calcData null when a field is zero (not a positive number)', () => {
      const withZero = '{"salario":5000,"despesas":0,"meta":12750,"mensal":500,"prazo":25}'
      const { calcData } = parseSpecialTokens(`|||CALC|||${withZero}|||`)
      expect(calcData).toBeNull()
    })

    it('returns calcData null when a field is negative', () => {
      const withNeg = '{"salario":-1000,"despesas":4250,"meta":12750,"mensal":500,"prazo":25}'
      const { calcData } = parseSpecialTokens(`|||CALC|||${withNeg}|||`)
      expect(calcData).toBeNull()
    })
  })

  describe('CTA token', () => {
    it('strips CTA token from text', () => {
      const raw = 'Some message |||CTA||| rest of message'
      const { text } = parseSpecialTokens(raw)
      expect(text).not.toContain('|||CTA|||')
      expect(text).toContain('Some message')
    })

    it('returns isCTA true when CTA token is present', () => {
      const { isCTA } = parseSpecialTokens('Message |||CTA|||')
      expect(isCTA).toBe(true)
    })

    it('returns isCTA false when CTA token is absent', () => {
      const { isCTA } = parseSpecialTokens('Regular message with no tokens')
      expect(isCTA).toBe(false)
    })
  })

  describe('RETURNING token', () => {
    it('strips RETURNING token from text', () => {
      const raw = '|||RETURNING|||reserva estratégica||| Hello there'
      const { text } = parseSpecialTokens(raw)
      expect(text).not.toContain('|||RETURNING|||')
      expect(text).not.toContain('reserva estratégica|||')
      expect(text).toContain('Hello there')
    })

    it('returns returningTheme when RETURNING token is present', () => {
      const { returningTheme } = parseSpecialTokens('|||RETURNING|||reserva estratégica|||')
      expect(returningTheme).toBe('reserva estratégica')
    })

    it('returns returningTheme null when RETURNING token is absent', () => {
      const { returningTheme } = parseSpecialTokens('Regular message')
      expect(returningTheme).toBeNull()
    })
  })

  describe('multiple tokens', () => {
    it('strips all tokens and parses all fields when all three tokens are present', () => {
      const calcJson = '{"salario":5000,"despesas":4250,"meta":12750,"mensal":500,"prazo":25}'
      const raw = `Texto |||RETURNING|||tema anterior||| |||CALC|||${calcJson}||| |||CTA|||`

      const { text, calcData, isCTA, returningTheme } = parseSpecialTokens(raw)

      expect(text).not.toContain('|||')
      expect(calcData).not.toBeNull()
      expect(calcData.salario).toBe(5000)
      expect(isCTA).toBe(true)
      expect(returningTheme).toBe('tema anterior')
    })
  })
})
