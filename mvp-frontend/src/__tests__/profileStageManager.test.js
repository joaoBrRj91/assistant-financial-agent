import { describe, it, expect, beforeEach } from 'vitest'
import { detectStage } from '../utils/stageDetector.js'
import { useProfileStage } from '../hooks/useProfileStage.js'
import { createStageBadge } from '../components/StageBadge/StageBadge.js'
import { createStageDivider } from '../components/StageDivider/StageDivider.js'
import { createContextTag } from '../components/ContextTag/ContextTag.js'
import { createQuickReplies } from '../components/QuickReplies/QuickReplies.js'

// ─── detectStage ────────────────────────────────────────────────────────────

describe('detectStage', () => {
  describe('reserve keywords', () => {
    it('detects "reserva" and advances to reserve', () => {
      expect(detectStage('Vamos montar sua reserva de emergência', 'start')).toBe('reserve')
    })

    it('detects "meta" and advances to reserve', () => {
      expect(detectStage('Sua meta financeira é importante', 'start')).toBe('reserve')
    })

    it('detects "guardar por mês" and advances to reserve', () => {
      expect(detectStage('Quanto você consegue guardar por mês?', 'start')).toBe('reserve')
    })
  })

  describe('organization keywords', () => {
    it('detects "anotar" and advances to organization', () => {
      expect(detectStage('Você precisa anotar seus gastos', 'start')).toBe('organization')
    })

    it('detects "controlar" and advances to organization', () => {
      expect(detectStage('Vamos controlar suas despesas', 'start')).toBe('organization')
    })

    it('detects "renda" and advances to organization', () => {
      expect(detectStage('Qual é a sua renda mensal?', 'start')).toBe('organization')
    })

    it('detects "salário mensal" and advances to organization', () => {
      expect(detectStage('Me conta sobre seu salário mensal', 'start')).toBe('organization')
    })

    it('detects "quanto você ganha" and advances to organization', () => {
      expect(detectStage('Quanto você ganha por mês?', 'start')).toBe('organization')
    })
  })

  describe('diagnosis keywords', () => {
    it('detects "guardado" and advances to diagnosis', () => {
      expect(detectStage('Você tem algo guardado hoje?', 'start')).toBe('diagnosis')
    })

    it('detects "te preocupa" and advances to diagnosis', () => {
      expect(detectStage('O que mais te preocupa financeiramente?', 'start')).toBe('diagnosis')
    })

    it('detects "situação financeira" and advances to diagnosis', () => {
      expect(detectStage('Como está sua situação financeira?', 'start')).toBe('diagnosis')
    })
  })

  describe('identification keywords', () => {
    it('detects "primeira vez" and advances to identification', () => {
      expect(detectStage('É a sua primeira vez aqui?', 'start')).toBe('identification')
    })

    it('detects "conversou comigo" and advances to identification', () => {
      expect(detectStage('Você já conversou comigo antes?', 'start')).toBe('identification')
    })

    it('detects "antes" and advances to identification', () => {
      expect(detectStage('Já falamos antes?', 'start')).toBe('identification')
    })
  })

  describe('stage ordering — only advance', () => {
    it('returns null when detected stage equals current stage', () => {
      expect(detectStage('situação financeira', 'diagnosis')).toBeNull()
    })

    it('returns null when detected stage is behind current stage', () => {
      expect(detectStage('primeira vez', 'organization')).toBeNull()
    })

    it('returns null when no keywords match', () => {
      expect(detectStage('Olá, tudo bem com você?', 'start')).toBeNull()
    })

    it('returns null for empty text', () => {
      expect(detectStage('', 'start')).toBeNull()
    })
  })

  describe('most-specific match wins', () => {
    it('returns reserve over diagnosis when both keywords are present', () => {
      expect(detectStage('situação financeira e reserva estratégica', 'start')).toBe('reserve')
    })

    it('returns organization over identification when both match', () => {
      expect(detectStage('antes de anotar seus gastos', 'start')).toBe('organization')
    })
  })

  describe('case insensitivity', () => {
    it('detects uppercase keywords', () => {
      expect(detectStage('RESERVA ESTRATÉGICA', 'start')).toBe('reserve')
    })

    it('detects mixed-case keywords', () => {
      expect(detectStage('Situação Financeira atual', 'start')).toBe('diagnosis')
    })
  })
})

// ─── useProfileStage ────────────────────────────────────────────────────────

describe('useProfileStage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('initialization', () => {
    it('starts with stage "start"', () => {
      const ps = useProfileStage()
      expect(ps.getState().currentStage).toBe('start')
    })

    it('starts with clientType null', () => {
      const ps = useProfileStage()
      expect(ps.getState().clientType).toBeNull()
    })

    it('loads valid stage from localStorage', () => {
      localStorage.setItem('mf_stage', 'diagnosis')
      const ps = useProfileStage()
      expect(ps.getState().currentStage).toBe('diagnosis')
    })

    it('falls back to "start" when localStorage stage is invalid', () => {
      localStorage.setItem('mf_stage', 'unknown-stage')
      const ps = useProfileStage()
      expect(ps.getState().currentStage).toBe('start')
    })

    it('loads clientType "new" from localStorage', () => {
      localStorage.setItem('mf_client_type', 'new')
      const ps = useProfileStage()
      expect(ps.getState().clientType).toBe('new')
    })

    it('loads clientType "returning" from localStorage', () => {
      localStorage.setItem('mf_client_type', 'returning')
      const ps = useProfileStage()
      expect(ps.getState().clientType).toBe('returning')
    })

    it('falls back to null when localStorage clientType is invalid', () => {
      localStorage.setItem('mf_client_type', 'unknown')
      const ps = useProfileStage()
      expect(ps.getState().clientType).toBeNull()
    })
  })

  describe('processUserMessage — client type detection', () => {
    it('sets clientType to "returning" when user says "sim"', () => {
      const ps = useProfileStage()
      ps.processUserMessage('Sim, já estive aqui')
      expect(ps.getState().clientType).toBe('returning')
    })

    it('sets clientType to "returning" when user says "já"', () => {
      const ps = useProfileStage()
      ps.processUserMessage('Já conversei com você')
      expect(ps.getState().clientType).toBe('returning')
    })

    it('sets clientType to "returning" when user says "antes"', () => {
      const ps = useProfileStage()
      ps.processUserMessage('Falamos antes sim')
      expect(ps.getState().clientType).toBe('returning')
    })

    it('sets clientType to "new" when user says "não"', () => {
      const ps = useProfileStage()
      ps.processUserMessage('Não, nunca falei com você')
      expect(ps.getState().clientType).toBe('new')
    })

    it('sets clientType to "new" when user says "primeira vez"', () => {
      const ps = useProfileStage()
      ps.processUserMessage('É minha primeira vez aqui')
      expect(ps.getState().clientType).toBe('new')
    })

    it('sets clientType to "new" when user says "nunca"', () => {
      const ps = useProfileStage()
      ps.processUserMessage('Nunca falei com você antes')
      expect(ps.getState().clientType).toBe('new')
    })

    it('does not change clientType once set', () => {
      const ps = useProfileStage()
      ps.processUserMessage('Sim, já falei antes')
      ps.processUserMessage('Não, é minha primeira vez')
      expect(ps.getState().clientType).toBe('returning')
    })

    it('does not detect clientType after turn 2', () => {
      const ps = useProfileStage()
      ps.processUserMessage('Olá')           // turn 1 — no signal
      ps.processUserMessage('Oi tudo bem')   // turn 2 — no signal
      ps.processUserMessage('Sim, já falei') // turn 3 — should be ignored
      expect(ps.getState().clientType).toBeNull()
    })

    it('persists clientType to localStorage', () => {
      const ps = useProfileStage()
      ps.processUserMessage('Sim, já estive aqui')
      expect(localStorage.getItem('mf_client_type')).toBe('returning')
    })
  })

  describe('processResponseText', () => {
    it('advances stage based on keyword detection', () => {
      const ps = useProfileStage()
      const next = ps.processResponseText('Como está sua situação financeira?')
      expect(next).toBe('diagnosis')
      expect(ps.getState().currentStage).toBe('diagnosis')
    })

    it('returns null when no transition occurs', () => {
      const ps = useProfileStage()
      const next = ps.processResponseText('Olá! Que bom te ver por aqui.')
      expect(next).toBeNull()
      expect(ps.getState().currentStage).toBe('start')
    })

    it('does not go backward', () => {
      localStorage.setItem('mf_stage', 'organization')
      const ps = useProfileStage()
      const next = ps.processResponseText('primeira vez situação financeira')
      expect(next).toBeNull()
      expect(ps.getState().currentStage).toBe('organization')
    })

    it('persists new stage to localStorage', () => {
      const ps = useProfileStage()
      ps.processResponseText('Qual é sua situação financeira?')
      expect(localStorage.getItem('mf_stage')).toBe('diagnosis')
    })
  })

  describe('processReturningToken', () => {
    it('sets clientType to "returning" when not previously set', () => {
      const ps = useProfileStage()
      ps.processReturningToken('dívida no cartão')
      expect(ps.getState().clientType).toBe('returning')
    })

    it('does not override an existing clientType', () => {
      localStorage.setItem('mf_client_type', 'new')
      const ps = useProfileStage()
      ps.processReturningToken('dívida no cartão')
      expect(ps.getState().clientType).toBe('new')
    })

    it('persists "returning" to localStorage', () => {
      const ps = useProfileStage()
      ps.processReturningToken('algum tema')
      expect(localStorage.getItem('mf_client_type')).toBe('returning')
    })
  })

  describe('forceStage', () => {
    it('advances to the specified stage', () => {
      const ps = useProfileStage()
      ps.forceStage('reserve')
      expect(ps.getState().currentStage).toBe('reserve')
    })

    it('does not go backward', () => {
      localStorage.setItem('mf_stage', 'organization')
      const ps = useProfileStage()
      ps.forceStage('diagnosis')
      expect(ps.getState().currentStage).toBe('organization')
    })

    it('persists forced stage to localStorage', () => {
      const ps = useProfileStage()
      ps.forceStage('lead')
      expect(localStorage.getItem('mf_stage')).toBe('lead')
    })

    it('accepts forceStage("lead") from any earlier stage', () => {
      const ps = useProfileStage()
      ps.forceStage('lead')
      expect(ps.getState().currentStage).toBe('lead')
    })
  })
})

// ─── createStageBadge ───────────────────────────────────────────────────────

describe('createStageBadge', () => {
  it('returns an HTMLElement', () => {
    expect(createStageBadge('start')).toBeInstanceOf(HTMLElement)
  })

  describe('labels', () => {
    it('shows "Início" for start', () => {
      expect(createStageBadge('start').textContent).toContain('Início')
    })

    it('shows "Identificação" for identification', () => {
      expect(createStageBadge('identification').textContent).toContain('Identificação')
    })

    it('shows "Diagnóstico" for diagnosis', () => {
      expect(createStageBadge('diagnosis').textContent).toContain('Diagnóstico')
    })

    it('shows "Organização" for organization', () => {
      expect(createStageBadge('organization').textContent).toContain('Organização')
    })

    it('shows "Reserva" for reserve', () => {
      expect(createStageBadge('reserve').textContent).toContain('Reserva')
    })

    it('shows "Consultoria" for lead', () => {
      expect(createStageBadge('lead').textContent).toContain('Consultoria')
    })
  })

  describe('color themes', () => {
    it('has teal class for start', () => {
      expect(createStageBadge('start').className).toContain('teal')
    })

    it('has teal class for identification', () => {
      expect(createStageBadge('identification').className).toContain('teal')
    })

    it('has teal class for diagnosis', () => {
      expect(createStageBadge('diagnosis').className).toContain('teal')
    })

    it('has blue class for organization', () => {
      expect(createStageBadge('organization').className).toContain('blue')
    })

    it('has blue class for reserve', () => {
      expect(createStageBadge('reserve').className).toContain('blue')
    })

    it('has amber class for lead', () => {
      expect(createStageBadge('lead').className).toContain('amber')
    })
  })
})

// ─── createStageDivider ─────────────────────────────────────────────────────

describe('createStageDivider', () => {
  it('returns null for "start"', () => {
    expect(createStageDivider('start')).toBeNull()
  })

  it('returns null for "identification"', () => {
    expect(createStageDivider('identification')).toBeNull()
  })

  it('returns an HTMLElement for "diagnosis"', () => {
    expect(createStageDivider('diagnosis')).toBeInstanceOf(HTMLElement)
  })

  it('returns an HTMLElement for "organization"', () => {
    expect(createStageDivider('organization')).toBeInstanceOf(HTMLElement)
  })

  it('returns an HTMLElement for "reserve"', () => {
    expect(createStageDivider('reserve')).toBeInstanceOf(HTMLElement)
  })

  it('returns an HTMLElement for "lead"', () => {
    expect(createStageDivider('lead')).toBeInstanceOf(HTMLElement)
  })

  describe('divider labels', () => {
    it('contains "Diagnóstico" label for diagnosis', () => {
      expect(createStageDivider('diagnosis').textContent).toContain('Diagnóstico')
    })

    it('contains "Organização" label for organization', () => {
      expect(createStageDivider('organization').textContent).toContain('Organização')
    })

    it('contains "Reserva" label for reserve', () => {
      expect(createStageDivider('reserve').textContent).toContain('Reserva')
    })

    it('contains "Consultoria" label for lead', () => {
      expect(createStageDivider('lead').textContent).toContain('Consultoria')
    })
  })

  it('has the stage-divider class', () => {
    expect(createStageDivider('diagnosis').className).toContain('stage-divider')
  })
})

// ─── createContextTag ───────────────────────────────────────────────────────

describe('createContextTag', () => {
  it('returns an HTMLElement', () => {
    expect(createContextTag('dívida no cartão')).toBeInstanceOf(HTMLElement)
  })

  it('contains the theme text', () => {
    expect(createContextTag('dívida no cartão').textContent).toContain('dívida no cartão')
  })

  it('contains a "Contexto anterior" label', () => {
    expect(createContextTag('algum tema').textContent).toContain('Contexto anterior')
  })

  it('has amber styling class', () => {
    expect(createContextTag('tema').className).toContain('amber')
  })
})

// ─── createQuickReplies ─────────────────────────────────────────────────────

describe('createQuickReplies', () => {
  it('returns null for "start"', () => {
    expect(createQuickReplies('start')).toBeNull()
  })

  it('returns null for "lead"', () => {
    expect(createQuickReplies('lead')).toBeNull()
  })

  it('returns an HTMLElement for "identification"', () => {
    expect(createQuickReplies('identification')).toBeInstanceOf(HTMLElement)
  })

  it('returns an HTMLElement for "diagnosis"', () => {
    expect(createQuickReplies('diagnosis')).toBeInstanceOf(HTMLElement)
  })

  it('returns an HTMLElement for "organization"', () => {
    expect(createQuickReplies('organization')).toBeInstanceOf(HTMLElement)
  })

  it('returns an HTMLElement for "reserve"', () => {
    expect(createQuickReplies('reserve')).toBeInstanceOf(HTMLElement)
  })

  describe('identification options', () => {
    it('has 2 buttons', () => {
      const el = createQuickReplies('identification')
      expect(el.querySelectorAll('button')).toHaveLength(2)
    })

    it('includes a "já conversei" option', () => {
      expect(createQuickReplies('identification').textContent).toContain('já conversei')
    })

    it('includes a "primeira vez" option', () => {
      expect(createQuickReplies('identification').textContent).toContain('primeira vez')
    })
  })

  describe('diagnosis options', () => {
    it('has 3 buttons', () => {
      expect(createQuickReplies('diagnosis').querySelectorAll('button')).toHaveLength(3)
    })

    it('includes a "nada guardado" option', () => {
      expect(createQuickReplies('diagnosis').textContent).toContain('nada guardado')
    })

    it('includes a "dívidas" option', () => {
      expect(createQuickReplies('diagnosis').textContent).toContain('dívidas')
    })
  })

  describe('organization options', () => {
    it('has 2 buttons', () => {
      expect(createQuickReplies('organization').querySelectorAll('button')).toHaveLength(2)
    })

    it('includes an app option', () => {
      expect(createQuickReplies('organization').textContent).toContain('aplicativo')
    })

    it('includes a paper/spreadsheet option', () => {
      expect(createQuickReplies('organization').textContent).toContain('planilha')
    })
  })

  describe('reserve options', () => {
    it('has 2 buttons', () => {
      expect(createQuickReplies('reserve').querySelectorAll('button')).toHaveLength(2)
    })

    it('includes a saving option', () => {
      expect(createQuickReplies('reserve').textContent).toContain('guardo')
    })

    it('includes a budget option', () => {
      expect(createQuickReplies('reserve').textContent).toContain('orçamento')
    })
  })

  describe('onSelect callback', () => {
    it('calls onSelect with button text on click', () => {
      let selected = null
      const el = createQuickReplies('identification', (text) => { selected = text })
      const btn = el.querySelector('button')
      btn.click()
      expect(selected).toBe(btn.textContent)
    })

    it('works without onSelect (no error thrown)', () => {
      const el = createQuickReplies('identification')
      expect(() => el.querySelector('button').click()).not.toThrow()
    })
  })
})
