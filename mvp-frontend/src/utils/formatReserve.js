/**
 * Formats a number as Brazilian Real currency.
 * Uses dot as thousands separator, no decimal places.
 *
 * @param {number} value
 * @returns {string} e.g. "R$ 3.500"
 */
export function formatBRL(value) {
  const rounded = Math.round(value)
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${formatted}`
}

/**
 * Formats a prazo (months) as a human-readable timeline string.
 * - prazo >= 36 → "N years" (no ~ prefix)
 * - prazo < 36  → "~N months" (ceiling applied)
 *
 * @param {number} prazo  Months to reach goal
 * @returns {string} e.g. "~26 months" or "3 years"
 */
export function formatTimeline(prazo) {
  if (prazo >= 36) {
    const years = Math.round(prazo / 12)
    return `${years} years`
  }
  const months = Math.ceil(prazo)
  return `~${months} months`
}
