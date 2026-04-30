const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1000

/**
 * Sends the full message history to the Anthropic API and returns the raw response text.
 *
 * @param {{ role: string, content: string }[]} messages
 * @param {string} systemPrompt
 * @param {string} apiKey
 * @returns {Promise<string>} raw response text (may contain special tokens)
 */
export async function callAnthropicAPI(messages, systemPrompt, apiKey) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
}
