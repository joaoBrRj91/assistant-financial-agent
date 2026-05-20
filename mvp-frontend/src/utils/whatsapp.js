/**
 * Builds a wa.me deep link for WhatsApp.
 *
 * @param {string} phone    Phone number in international format without '+' (e.g. '5511999999999')
 * @param {string} [message] Optional pre-filled message (will be URL-encoded)
 * @returns {string} Full wa.me URL
 */
export function buildWhatsAppUrl(phone, message) {
  const base = `https://wa.me/${phone}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
