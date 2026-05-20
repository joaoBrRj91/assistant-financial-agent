import { useConversation }  from './hooks/useConversation.js'
import { useProfileStage }  from './hooks/useProfileStage.js'
import { buildWhatsAppUrl } from './utils/whatsapp.js'
import { isAffirmative }    from './utils/ctaDetector.js'
import { WHATSAPP_CONFIG }  from './constants/whatsapp.js'
import {
  app, chatArea, msgInput, sendBtn, typingEl,
} from './ui/domRefs.js'
import {
  renderStageBadge, renderQuickReplies, renderBotMessage, appendMessage,
} from './ui/renderer.js'

let conversation = null
let profile = null
let renderedCount = 0

function handleWhatsApp() {
  const url = buildWhatsAppUrl(WHATSAPP_CONFIG.phone, WHATSAPP_CONFIG.message)
  window.open(url, '_blank')
}

function submitMessage(text) {
  if (text === '__whatsapp__') { handleWhatsApp(); return }

  const trimmed = text.trim()
  if (!trimmed || !conversation) return

  // Affirmative reply in CTA stage opens WhatsApp directly, no API call
  if (profile.getState().currentStage === 'lead' && isAffirmative(trimmed)) {
    handleWhatsApp()
    return
  }

  msgInput.value = ''
  conversation.sendMessage(trimmed)
}

function onStateChange(state) {
  const { messages, isLoading, lastPayload } = state
  const newMessages = messages.slice(renderedCount)

  for (let i = 0; i < newMessages.length; i++) {
    const msg = newMessages[i]
    const isLast = renderedCount + i === messages.length - 1

    if (msg.role === 'user') {
      profile.processUserMessage(msg.content)
      appendMessage('user', msg.content)
      renderedCount++
    } else if (msg.role === 'assistant') {
      if (isLoading) break // wait for full response before rendering bot bubble
      const payload = isLast ? lastPayload : null
      renderBotMessage(msg.content, payload, profile)
      renderedCount++
    }
  }

  typingEl.hidden = !isLoading
  sendBtn.disabled = isLoading
  msgInput.disabled = isLoading

  const { currentStage } = profile.getState()
  renderStageBadge(currentStage)
  renderQuickReplies(currentStage, submitMessage)

  chatArea.scrollTop = chatArea.scrollHeight
}

function initApp() {
  profile = useProfileStage()
  conversation = useConversation()

  conversation.subscribe(onStateChange)

  // Render persisted state (if any) or the opening message
  onStateChange(conversation.getState())

  msgInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitMessage(msgInput.value)
    }
  })
  sendBtn.addEventListener('click', () => submitMessage(msgInput.value))
}

initApp()
