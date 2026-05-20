const CALC_RE = /\|\|\|CALC\|\|\|([\s\S]*?)\|\|\|/
const RETURNING_RE = /\|\|\|RETURNING\|\|\|([\s\S]*?)\|\|\|/
const REQUIRED_CALC_FIELDS = ['salario', 'despesas', 'meta', 'mensal', 'prazo']

/**
 * Parses special tokens from a raw Anthropic API response.
 * Returns cleaned text plus extracted structured data.
 *
 * @param {string} rawResponse
 * @returns {{ text: string, calcData: object|null, isCTA: boolean, returningTheme: string|null }}
 */
export function parseSpecialTokens(rawResponse) {
  let text = rawResponse
  let calcData = null
  let isCTA = false
  let returningTheme = null

  // --- CALC ---
  const calcMatch = text.match(CALC_RE)
  if (calcMatch) {
    try {
      const parsed = JSON.parse(calcMatch[1])
      const allValid = REQUIRED_CALC_FIELDS.every(
        field => typeof parsed[field] === 'number' && parsed[field] > 0
      )
      if (allValid) {
        calcData = parsed
      }
    } catch (err) {
      console.warn('[tokenParser] Malformed CALC JSON — ignoring:', err.message)
    }
  }

  // --- CTA ---
  if (text.includes('|||CTA|||')) {
    isCTA = true
  }

  // --- RETURNING ---
  const returningMatch = text.match(RETURNING_RE)
  if (returningMatch) {
    returningTheme = returningMatch[1]
  }

  // Strip all tokens from text
  text = text.replace(/\|\|\|CALC\|\|\|[\s\S]*?\|\|\|/g, '')
  text = text.replace(/\|\|\|CTA\|\|\|/g, '')
  text = text.replace(/\|\|\|RETURNING\|\|\|[\s\S]*?\|\|\|/g, '')

  return { text, calcData, isCTA, returningTheme }
}
