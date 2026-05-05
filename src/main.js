import { useConversation } from './hooks/useConversation.js'
import { useProfileStage } from './hooks/useProfileStage.js'
import { createReserveCard } from './components/ReserveCard/ReserveCard.js'
import { createCTABubble } from './components/CTABubble/CTABubble.js'
import { createCTAQuickReplies } from './components/CTAQuickReplies/CTAQuickReplies.js'
import { createQuickReplies } from './components/QuickReplies/QuickReplies.js'
import { createStageBadge } from './components/StageBadge/StageBadge.js'
import { createStageDivider } from './components/StageDivider/StageDivider.js'
import { createContextTag } from './components/ContextTag/ContextTag.js'
import { buildWhatsAppUrl } from './utils/whatsapp.js'
import { isAffirmative } from './utils/ctaDetector.js'
import { WHATSAPP_CONFIG } from './constants/whatsapp.js'

// --- DOM refs ---
const apiKeyScreen = document.getElementById('api-key-screen')
const apiKeyForm = document.getElementById('api-key-form')
const apiKeyInput = document.getElementById('api-key-input')
const app = document.getElementById('app')
const chatArea = document.getElementById('chat-area')
const stageBadgeSlot = document.getElementById('stage-badge-slot')
const quickRepliesArea = document.getElementById('quick-replies-area')
const msgInput = document.getElementById('msg-input')
const sendBtn = document.getElementById('send-btn')
const typingEl = document.getElementById('typing-indicator')

let conversation = null
let profile = null
let renderedCount = 0

// Remove special tokens from raw API text before displaying
function stripTokens(raw) {
  return raw
    .replace(/\|\|\|CALC\|\|\|[\s\S]*?\|\|\|/g, '')
    .replace(/\|\|\|CTA\|\|\|/g, '')
    .replace(/\|\|\|RETURNING\|\|\|[\s\S]*?\|\|\|/g, '')
    .trim()
}

function appendMessage(role, text) {
  const wrap = document.createElement('div')
  wrap.className = `msg-wrap ${role}`
  const bubble = document.createElement('div')
  bubble.className = 'msg'
  bubble.textContent = text
  wrap.appendChild(bubble)
  chatArea.appendChild(wrap)
}

function handleWhatsApp() {
  const url = buildWhatsAppUrl(WHATSAPP_CONFIG.phone, WHATSAPP_CONFIG.message)
  window.open(url, '_blank')
}

function renderQuickReplies(stage) {
  quickRepliesArea.innerHTML = ''
  if (stage === 'lead') {
    const el = createCTAQuickReplies({
      onAffirmative: handleWhatsApp,
      onDecline: () => submitMessage('Ainda tenho dúvidas'),
    })
    quickRepliesArea.appendChild(el)
    return
  }
  const el = createQuickReplies(stage, text => submitMessage(text))
  if (el) quickRepliesArea.appendChild(el)
}

function renderStageBadge(stage) {
  stageBadgeSlot.replaceChildren(createStageBadge(stage))
}

function renderBotMessage(rawContent, payload) {
  const displayText = payload ? (payload.text ?? '') : stripTokens(rawContent)

  if (payload?.returningTheme) {
    profile.processReturningToken(payload.returningTheme)
    chatArea.appendChild(createContextTag(payload.returningTheme))
  }

  if (payload?.text) {
    const newStage = profile.processResponseText(payload.text)
    if (newStage) {
      const divider = createStageDivider(newStage)
      if (divider) chatArea.appendChild(divider)
    }
  }

  if (payload?.isCTA) {
    const bubble = createCTABubble(displayText, {
      isCTA: true,
      onStageAdvance: s => profile.forceStage(s),
    })
    chatArea.appendChild(bubble)
  } else {
    if (displayText) appendMessage('bot', displayText)

    const card = createReserveCard(payload?.calcData ?? null, false, s => profile.forceStage(s))
    if (card) {
      const wrap = document.createElement('div')
      wrap.className = 'msg-wrap bot'
      wrap.appendChild(card)
      chatArea.appendChild(wrap)
    }
  }
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
      renderBotMessage(msg.content, payload)
      renderedCount++
    }
  }

  typingEl.hidden = !isLoading
  sendBtn.disabled = isLoading
  msgInput.disabled = isLoading

  const { currentStage } = profile.getState()
  renderStageBadge(currentStage)
  renderQuickReplies(currentStage)

  chatArea.scrollTop = chatArea.scrollHeight
}

async function submitMessage(text) {
  const trimmed = text.trim()
  if (!trimmed || !conversation) return

  // Affirmative reply in CTA stage opens WhatsApp directly, no API call
  if (profile.getState().currentStage === 'lead' && isAffirmative(trimmed)) {
    handleWhatsApp()
    return
  }

  msgInput.value = ''
  await conversation.sendMessage(trimmed)
}

function handleSend() {
  submitMessage(msgInput.value)
}

function initApp(apiKey) {
  apiKeyScreen.hidden = true
  app.hidden = false

  profile = useProfileStage()
  conversation = useConversation(apiKey)

  conversation.subscribe(onStateChange)

  // Render persisted state (if any) or the opening message
  onStateChange(conversation.getState())

  msgInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  })
  sendBtn.addEventListener('click', handleSend)
}

apiKeyForm.addEventListener('submit', e => {
  e.preventDefault()
  const key = apiKeyInput.value.trim()
  if (!key) return
  initApp(key)
})
