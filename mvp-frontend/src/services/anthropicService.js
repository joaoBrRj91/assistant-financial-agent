const BACKEND_URL = 'http://localhost:3001/api/chat'

/**
 * Sends the conversation history to the FinBot backend and returns the raw response text.
 * The backend handles LLM provider selection, API key auth, and system prompt injection.
 *
 * @param {{ role: string, content: string }[]} messages
 * @returns {Promise<string>} raw response text (may contain special tokens like |||CALC|||)
 */
export async function callAnthropicAPI(messages) {
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.response
}
