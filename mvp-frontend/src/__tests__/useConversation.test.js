import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../services/anthropicService.js', () => ({
  callAnthropicAPI: vi.fn()
}))

import { useConversation } from '../hooks/useConversation.js'
import { callAnthropicAPI } from '../services/anthropicService.js'

const STORAGE_KEY = 'mf_chat_history'
const OPENING_MESSAGE_FRAGMENT = 'Olá! Que bom ter você aqui'

describe('useConversation', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
    callAnthropicAPI.mockResolvedValue('Resposta padrão do assistente')
  })

  describe('initialization', () => {
    it('starts with the opening message when localStorage is empty', () => {
      const engine = useConversation()
      const { messages } = engine.getState()
      expect(messages).toHaveLength(1)
      expect(messages[0].role).toBe('assistant')
      expect(messages[0].content).toContain(OPENING_MESSAGE_FRAGMENT)
    })

    it('loads messages from localStorage when data is a valid array', () => {
      const stored = [
        { role: 'assistant', content: 'Olá!' },
        { role: 'user', content: 'Oi' }
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

      const engine = useConversation()
      const { messages } = engine.getState()
      expect(messages).toEqual(stored)
    })

    it('falls back to opening message when localStorage has corrupt JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{{')

      const engine = useConversation()
      const { messages } = engine.getState()
      expect(messages).toHaveLength(1)
      expect(messages[0].content).toContain(OPENING_MESSAGE_FRAGMENT)
    })

    it('falls back to opening message when localStorage has a non-array value', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: 'user', content: 'hi' }))

      const engine = useConversation()
      const { messages } = engine.getState()
      expect(messages).toHaveLength(1)
      expect(messages[0].content).toContain(OPENING_MESSAGE_FRAGMENT)
    })

    it('starts with isLoading false', () => {
      const engine = useConversation()
      expect(engine.getState().isLoading).toBe(false)
    })

    it('starts with lastPayload null', () => {
      const engine = useConversation()
      expect(engine.getState().lastPayload).toBeNull()
    })
  })

  describe('sendMessage — optimistic update', () => {
    it('appends the user message to messages[] immediately before the API resolves', () => {
      let resolveAPI
      callAnthropicAPI.mockImplementation(
        () => new Promise(resolve => { resolveAPI = resolve })
      )

      const engine = useConversation()
      engine.sendMessage('Olá bot')

      // Synchronous check — API has NOT resolved yet
      const { messages } = engine.getState()
      const userMsg = messages.find(m => m.role === 'user')
      expect(userMsg).toBeDefined()
      expect(userMsg.content).toBe('Olá bot')

      resolveAPI('resposta') // avoid dangling promise
    })

    it('sets isLoading to true while the API call is in progress', () => {
      let resolveAPI
      callAnthropicAPI.mockImplementation(
        () => new Promise(resolve => { resolveAPI = resolve })
      )

      const engine = useConversation()
      engine.sendMessage('Olá')

      expect(engine.getState().isLoading).toBe(true)

      resolveAPI('resposta')
    })
  })

  describe('sendMessage — after API resolves', () => {
    it('resets isLoading to false after the API call resolves', async () => {
      const engine = useConversation()
      await engine.sendMessage('Olá')
      expect(engine.getState().isLoading).toBe(false)
    })

    it('stores the raw API response (tokens included) in messages[]', async () => {
      const rawWithToken = 'Você está indo bem |||CTA||| continue assim'
      callAnthropicAPI.mockResolvedValue(rawWithToken)

      const engine = useConversation()
      await engine.sendMessage('Olá')

      const { messages } = engine.getState()
      const assistantMsg = messages.find(
        m => m.role === 'assistant' && m.content.includes('|||CTA|||')
      )
      expect(assistantMsg).toBeDefined()
    })

    it('persists the full message history to localStorage after sending', async () => {
      const engine = useConversation()
      await engine.sendMessage('Minha mensagem')

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
      expect(Array.isArray(stored)).toBe(true)
      expect(stored.some(m => m.role === 'user' && m.content === 'Minha mensagem')).toBe(true)
    })

    it('sets lastPayload with parsed token data after the API call', async () => {
      const calcJson = '{"salario":5000,"despesas":4250,"meta":12750,"mensal":500,"prazo":25}'
      callAnthropicAPI.mockResolvedValue(`Texto |||CALC|||${calcJson}||| |||CTA|||`)

      const engine = useConversation()
      await engine.sendMessage('Minha renda é 5000')

      const { lastPayload } = engine.getState()
      expect(lastPayload).not.toBeNull()
      expect(lastPayload.isCTA).toBe(true)
      expect(lastPayload.calcData).not.toBeNull()
      expect(lastPayload.calcData.salario).toBe(5000)
      expect(lastPayload.text).not.toContain('|||CALC|||')
      expect(lastPayload.text).not.toContain('|||CTA|||')
    })
  })

  describe('error handling', () => {
    it('appends the fallback message when the API throws a network error', async () => {
      callAnthropicAPI.mockRejectedValue(new Error('Network error'))

      const engine = useConversation()
      await engine.sendMessage('Olá')

      const { messages } = engine.getState()
      const fallback = messages.find(
        m => m.role === 'assistant' && m.content.includes('Tive um problema de conexão')
      )
      expect(fallback).toBeDefined()
    })

    it('resets isLoading to false after an API error', async () => {
      callAnthropicAPI.mockRejectedValue(new Error('Network error'))

      const engine = useConversation()
      await engine.sendMessage('Olá')

      expect(engine.getState().isLoading).toBe(false)
    })

    it('sets lastPayload with all null/false fields after an API error', async () => {
      callAnthropicAPI.mockRejectedValue(new Error('Network error'))

      const engine = useConversation()
      await engine.sendMessage('Olá')

      const { lastPayload } = engine.getState()
      expect(lastPayload).not.toBeNull()
      expect(lastPayload.text).toBe('Tive um problema de conexão. Pode tentar de novo?')
      expect(lastPayload.calcData).toBeNull()
      expect(lastPayload.isCTA).toBe(false)
      expect(lastPayload.returningTheme).toBeNull()
    })
  })
})
