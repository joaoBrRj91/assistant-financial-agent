const SESSION_KEY = 'mf_analytics_session_id'
// TODO: replace the production URL below with your actual Render service name before deploying
const ANALYTICS_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api/analytics/stage'
  : 'https://finbot-mvp-backend.onrender.com/api/analytics/stage'

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export const sessionId = getSessionId()

/**
 * Fire-and-forget stage tracking. Errors are silently swallowed.
 * @param {string} sid    Session ID
 * @param {string} stage  Stage key
 */
export function trackStage(sid, stage) {
  try {
    fetch(ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, stage }),
      keepalive: true,
    }).catch(() => {})
  } catch (_) {
    // Never let analytics break the UX
  }
}
