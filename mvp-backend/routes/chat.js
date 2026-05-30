const express = require('express')
const LLMFactory = require('../factory/LLMFactory')
const { sanitizeMessagesForAnthropic } = require('../utils/sanitizeMessages')

const router = express.Router()

// Instantiate once at module load — fails fast at startup if API key is missing
const provider = LLMFactory.getProvider()

/**
 * POST /api/chat
 *
 * Body: { messages: Array<{ role: string, content: string }> }
 * Response 200: { response: string }
 * Response 400: { error: string }  — invalid input
 * Response 502: { error: string }  — LLM provider failure
 */
router.post('/chat', async (req, res) => {
  const { messages } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' })
  }

  const safeMessages = sanitizeMessagesForAnthropic(messages)
  if (safeMessages.length === 0) {
    return res.status(400).json({ error: 'no valid user messages after sanitization' })
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[chat route] sanitized messages:', safeMessages.length)
  }

  try {
    const response = await provider.chat(messages)
    res.json({ response })
  } catch (err) {
    console.error('[chat route] Provider error:', err.message)
    res.status(502).json({ error: 'LLM provider error' })
  }
})

module.exports = router
