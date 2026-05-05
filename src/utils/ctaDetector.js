const AFFIRMATIVE_SIGNALS = ['yes', 'want', 'more info', 'sure', 'ok', 'let', "let's go", 'sounds good', 'great', 'please']

/**
 * Returns true if the user's text contains an affirmative intent signal.
 * Case-insensitive substring match.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function isAffirmative(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  return AFFIRMATIVE_SIGNALS.some(signal => lower.includes(signal))
}
