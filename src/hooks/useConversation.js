import { callAnthropicAPI } from '../services/anthropicService.js'
import { parseSpecialTokens } from '../utils/tokenParser.js'
import { SYSTEM_PROMPT } from '../constants/systemPrompt.js'

const STORAGE_KEY = 'mf_chat_history'

const OPENING_MESSAGE = {
  role: 'assistant',
  content:
    'Olá! Que bom ter você aqui. Sou o assistente do Maurício Fidelis, educador financeiro. ' +
    'Estou aqui para te ajudar a organizar sua vida financeira de forma simples e prática. ' +
    'Antes de começar — você já teve alguma conversa comigo antes ou é a primeira vez?'
}

const FALLBACK_MESSAGE = {
  role: 'assistant',
  content: 'Tive um problema de conexão. Pode tentar de novo?'
}

const FALLBACK_PAYLOAD = { text: null, calcData: null, isCTA: false, returningTheme: null }

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Creates a conversational engine that manages message history, API calls,
 * localStorage persistence, and token parsing.
 *
 * @param {string} apiKey  Anthropic API key
 * @returns {{ getState: Function, sendMessage: Function, subscribe: Function }}
 */
export function useConversation(apiKey) {
  let _messages = loadFromStorage() ?? [OPENING_MESSAGE]
  let _isLoading = false
  let _lastPayload = null
  const _listeners = new Set()

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_messages))
  }

  function _notify() {
    const state = getState()
    _listeners.forEach(fn => fn(state))
  }

  function getState() {
    return {
      messages: [..._messages],
      isLoading: _isLoading,
      lastPayload: _lastPayload
    }
  }

  function subscribe(fn) {
    _listeners.add(fn)
    return () => _listeners.delete(fn)
  }

  async function sendMessage(userText) {
    // Optimistic update — user message visible immediately
    _messages = [..._messages, { role: 'user', content: userText }]
    _isLoading = true
    _lastPayload = null
    _persist()
    _notify()

    try {
      const rawResponse = await callAnthropicAPI(_messages, SYSTEM_PROMPT, apiKey)
      const parsed = parseSpecialTokens(rawResponse)

      // Store raw response so the model sees its own tokens in future turns
      _messages = [..._messages, { role: 'assistant', content: rawResponse }]
      _lastPayload = {
        text: parsed.text,
        calcData: parsed.calcData,
        isCTA: parsed.isCTA,
        returningTheme: parsed.returningTheme
      }
    } catch {
      _messages = [..._messages, FALLBACK_MESSAGE]
      _lastPayload = { ...FALLBACK_PAYLOAD }
    } finally {
      _isLoading = false
      _persist()
      _notify()
    }
  }

  return { getState, sendMessage, subscribe }
}
