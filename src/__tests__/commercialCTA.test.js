import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildWhatsAppUrl } from '../utils/whatsapp.js'
import { WHATSAPP_CONFIG } from '../constants/whatsapp.js'
import { isAffirmative } from '../utils/ctaDetector.js'
import { createCTABubble } from '../components/CTABubble/CTABubble.js'
import { createCTACard } from '../components/CTACard/CTACard.js'
import { createCTAQuickReplies } from '../components/CTAQuickReplies/CTAQuickReplies.js'
import { createReserveCard } from '../components/ReserveCard/ReserveCard.js'

// ─── buildWhatsAppUrl ────────────────────────────────────────────────────────

describe('buildWhatsAppUrl', () => {
  it('returns a wa.me URL with the phone number', () => {
    const url = buildWhatsAppUrl('5511999999999')
    expect(url).toContain('wa.me/5511999999999')
  })

  it('URL-encodes the message when provided', () => {
    const url = buildWhatsAppUrl('5511999999999', 'Hello Maurício!')
    expect(url).toContain(encodeURIComponent('Hello Maurício!'))
  })

  it('omits the text param when no message is provided', () => {
    const url = buildWhatsAppUrl('5511999999999')
    expect(url).not.toContain('text=')
  })

  it('starts with https://wa.me/', () => {
    expect(buildWhatsAppUrl('5511999999999')).toMatch(/^https:\/\/wa\.me\//)
  })
})

// ─── WHATSAPP_CONFIG ─────────────────────────────────────────────────────────

describe('WHATSAPP_CONFIG', () => {
  it('exports a phone field', () => {
    expect(typeof WHATSAPP_CONFIG.phone).toBe('string')
    expect(WHATSAPP_CONFIG.phone.length).toBeGreaterThan(0)
  })

  it('exports a message field', () => {
    expect(typeof WHATSAPP_CONFIG.message).toBe('string')
    expect(WHATSAPP_CONFIG.message.length).toBeGreaterThan(0)
  })
})

// ─── isAffirmative ───────────────────────────────────────────────────────────

describe('isAffirmative', () => {
  it('returns true for "yes"', () => {
    expect(isAffirmative('yes')).toBe(true)
  })

  it('returns true for "Yes, I would like that"', () => {
    expect(isAffirmative('Yes, I would like that')).toBe(true)
  })

  it('returns true for "sure"', () => {
    expect(isAffirmative('sure')).toBe(true)
  })

  it('returns true for "ok"', () => {
    expect(isAffirmative('ok')).toBe(true)
  })

  it('returns true for "please"', () => {
    expect(isAffirmative('please')).toBe(true)
  })

  it('returns true for "great"', () => {
    expect(isAffirmative('great')).toBe(true)
  })

  it('returns true for "sounds good"', () => {
    expect(isAffirmative('sounds good')).toBe(true)
  })

  it('returns true for "more info"', () => {
    expect(isAffirmative('more info')).toBe(true)
  })

  it('returns true for "want"', () => {
    expect(isAffirmative('want')).toBe(true)
  })

  it('returns true for "let"', () => {
    expect(isAffirmative("let's go")).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isAffirmative('YES PLEASE')).toBe(true)
    expect(isAffirmative('SURE')).toBe(true)
  })

  it('matches as substring', () => {
    expect(isAffirmative('yes please send me more info')).toBe(true)
  })

  it('returns false for neutral text', () => {
    expect(isAffirmative('I have a question about budgets')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isAffirmative('')).toBe(false)
  })
})

// ─── createCTACard ───────────────────────────────────────────────────────────

describe('createCTACard', () => {
  it('returns an HTMLElement', () => {
    expect(createCTACard()).toBeInstanceOf(HTMLElement)
  })

  it('content is always the same regardless of arguments', () => {
    const a = createCTACard()
    const b = createCTACard()
    expect(a.textContent).toBe(b.textContent)
  })

  it('contains value proposition text about consultations', () => {
    const text = createCTACard().textContent
    expect(text.toLowerCase()).toMatch(/consult/)
  })

  it('contains a closing question inviting the user to proceed', () => {
    const text = createCTACard().textContent
    expect(text).toMatch(/\?/)
  })

  it('has a teal-themed class', () => {
    expect(createCTACard().className).toContain('teal')
  })
})

// ─── createCTABubble ─────────────────────────────────────────────────────────

describe('createCTABubble', () => {
  it('returns null when isCTA is false', () => {
    expect(createCTABubble('Some text', { isCTA: false })).toBeNull()
  })

  it('returns null when isCTA is undefined', () => {
    expect(createCTABubble('Some text', {})).toBeNull()
  })

  it('returns an HTMLElement when isCTA is true', () => {
    expect(createCTABubble('Hello', { isCTA: true })).toBeInstanceOf(HTMLElement)
  })

  it('has a teal border class distinct from standard bot bubbles', () => {
    const el = createCTABubble('Hello', { isCTA: true })
    expect(el.className).toContain('cta')
  })

  it('always contains a CTACard', () => {
    const el = createCTABubble('Hello', { isCTA: true })
    expect(el.querySelector('.cta-card')).not.toBeNull()
  })

  it('shows model text above CTACard when text is non-empty', () => {
    const el = createCTABubble('Great news for you!', { isCTA: true })
    expect(el.textContent).toContain('Great news for you!')
  })

  it('omits model text element when text is an empty string', () => {
    const el = createCTABubble('', { isCTA: true })
    const textEl = el.querySelector('.cta-bubble__text')
    expect(textEl).toBeNull()
  })

  it('calls onStageAdvance with "lead" when rendered', () => {
    const onStageAdvance = vi.fn()
    createCTABubble('Hello', { isCTA: true, onStageAdvance })
    expect(onStageAdvance).toHaveBeenCalledWith('lead')
  })
})

// ─── createCTAQuickReplies ───────────────────────────────────────────────────

describe('createCTAQuickReplies', () => {
  it('returns an HTMLElement', () => {
    expect(createCTAQuickReplies()).toBeInstanceOf(HTMLElement)
  })

  it('has exactly 2 buttons', () => {
    const el = createCTAQuickReplies()
    expect(el.querySelectorAll('button')).toHaveLength(2)
  })

  it('has an affirmative button (primary style)', () => {
    const el = createCTAQuickReplies()
    const buttons = Array.from(el.querySelectorAll('button'))
    const affirmative = buttons.find(b => b.className.includes('primary') || b.className.includes('teal'))
    expect(affirmative).not.toBeUndefined()
  })

  it('has a negative/default button', () => {
    const el = createCTAQuickReplies()
    const buttons = Array.from(el.querySelectorAll('button'))
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('calls onAffirmative when affirmative button is clicked', () => {
    const onAffirmative = vi.fn()
    const onDecline = vi.fn()
    const el = createCTAQuickReplies({ onAffirmative, onDecline })
    const buttons = Array.from(el.querySelectorAll('button'))
    const affirmBtn = buttons.find(b => b.className.includes('primary') || b.className.includes('teal'))
    affirmBtn.click()
    expect(onAffirmative).toHaveBeenCalled()
    expect(onDecline).not.toHaveBeenCalled()
  })

  it('calls onDecline when negative button is clicked', () => {
    const onAffirmative = vi.fn()
    const onDecline = vi.fn()
    const el = createCTAQuickReplies({ onAffirmative, onDecline })
    const buttons = Array.from(el.querySelectorAll('button'))
    const declineBtn = buttons.find(b => !b.className.includes('primary') && !b.className.includes('teal'))
    declineBtn.click()
    expect(onDecline).toHaveBeenCalled()
    expect(onAffirmative).not.toHaveBeenCalled()
  })

  it('does not throw when no callbacks are provided', () => {
    const el = createCTAQuickReplies()
    const buttons = el.querySelectorAll('button')
    expect(() => buttons[0].click()).not.toThrow()
    expect(() => buttons[1].click()).not.toThrow()
  })
})

// ─── ReserveCard suppression when isCTA ─────────────────────────────────────

describe('createReserveCard — suppressed when isCTA', () => {
  const validCalcData = {
    salario: 5000,
    despesas: 3000,
    meta: 9000,
    mensal: 500,
    prazo: 18,
  }

  it('returns null when isCTA is true, even with valid calcData', () => {
    expect(createReserveCard(validCalcData, true)).toBeNull()
  })

  it('returns an HTMLElement when isCTA is false and calcData is valid', () => {
    expect(createReserveCard(validCalcData, false)).toBeInstanceOf(HTMLElement)
  })
})
