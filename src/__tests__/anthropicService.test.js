import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { callAnthropicAPI } from '../services/anthropicService.js'

const API_ENDPOINT = 'https://api.anthropic.com/v1/messages'

describe('callAnthropicAPI', () => {
  let mockFetch

  beforeEach(() => {
    mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const messages = [{ role: 'user', content: 'Olá' }]
  const systemPrompt = 'You are a helpful assistant'
  const apiKey = 'test-api-key-123'

  function okResponse(text = 'Resposta') {
    return {
      ok: true,
      json: () => Promise.resolve({ content: [{ text }] })
    }
  }

  it('makes a POST request to the Anthropic API endpoint', async () => {
    mockFetch.mockResolvedValueOnce(okResponse())
    await callAnthropicAPI(messages, systemPrompt, apiKey)
    expect(mockFetch).toHaveBeenCalledWith(API_ENDPOINT, expect.objectContaining({ method: 'POST' }))
  })

  it('sends the x-api-key header with the provided key', async () => {
    mockFetch.mockResolvedValueOnce(okResponse())
    await callAnthropicAPI(messages, systemPrompt, apiKey)
    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['x-api-key']).toBe(apiKey)
  })

  it('sends the anthropic-version header', async () => {
    mockFetch.mockResolvedValueOnce(okResponse())
    await callAnthropicAPI(messages, systemPrompt, apiKey)
    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['anthropic-version']).toBeDefined()
    expect(typeof headers['anthropic-version']).toBe('string')
  })

  it('sends content-type application/json header', async () => {
    mockFetch.mockResolvedValueOnce(okResponse())
    await callAnthropicAPI(messages, systemPrompt, apiKey)
    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['content-type']).toBe('application/json')
  })

  it('sends messages array in the request body', async () => {
    mockFetch.mockResolvedValueOnce(okResponse())
    await callAnthropicAPI(messages, systemPrompt, apiKey)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.messages).toEqual(messages)
  })

  it('sends the system prompt in the request body', async () => {
    mockFetch.mockResolvedValueOnce(okResponse())
    await callAnthropicAPI(messages, systemPrompt, apiKey)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.system).toBe(systemPrompt)
  })

  it('uses claude-sonnet-4-20250514 as the model', async () => {
    mockFetch.mockResolvedValueOnce(okResponse())
    await callAnthropicAPI(messages, systemPrompt, apiKey)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.model).toBe('claude-sonnet-4-20250514')
  })

  it('uses max_tokens of 1000', async () => {
    mockFetch.mockResolvedValueOnce(okResponse())
    await callAnthropicAPI(messages, systemPrompt, apiKey)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.max_tokens).toBe(1000)
  })

  it('returns the text from data.content[0].text', async () => {
    mockFetch.mockResolvedValueOnce(okResponse('Olá! Como posso ajudar?'))
    const result = await callAnthropicAPI(messages, systemPrompt, apiKey)
    expect(result).toBe('Olá! Como posso ajudar?')
  })

  it('throws when HTTP response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized' })
    await expect(callAnthropicAPI(messages, systemPrompt, apiKey)).rejects.toThrow()
  })

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(callAnthropicAPI(messages, systemPrompt, apiKey)).rejects.toThrow()
  })
})
