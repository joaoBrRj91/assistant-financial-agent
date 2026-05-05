import { chatArea, stageBadgeSlot, quickRepliesArea } from './domRefs.js'
import { createReserveCard }    from '../components/ReserveCard/ReserveCard.js'
import { createCTABubble }      from '../components/CTABubble/CTABubble.js'
import { createCTAQuickReplies } from '../components/CTAQuickReplies/CTAQuickReplies.js'
import { createQuickReplies }   from '../components/QuickReplies/QuickReplies.js'
import { createStageBadge }     from '../components/StageBadge/StageBadge.js'
import { createStageDivider }   from '../components/StageDivider/StageDivider.js'
import { createContextTag }     from '../components/ContextTag/ContextTag.js'

// Remove special tokens from raw API text before displaying
export function stripTokens(raw) {
  return raw
    .replace(/\|\|\|CALC\|\|\|[\s\S]*?\|\|\|/g, '')
    .replace(/\|\|\|CTA\|\|\|/g, '')
    .replace(/\|\|\|RETURNING\|\|\|[\s\S]*?\|\|\|/g, '')
    .trim()
}

export function appendMessage(role, text) {
  const wrap = document.createElement('div')
  wrap.className = `msg-wrap ${role}`
  const bubble = document.createElement('div')
  bubble.className = 'msg'
  bubble.textContent = text
  wrap.appendChild(bubble)
  chatArea.appendChild(wrap)
}

export function renderStageBadge(stage) {
  stageBadgeSlot.replaceChildren(createStageBadge(stage))
}

// submitFn is passed from main.js to avoid a circular import
export function renderQuickReplies(stage, submitFn) {
  quickRepliesArea.innerHTML = ''
  if (stage === 'lead') {
    const el = createCTAQuickReplies({
      onAffirmative: () => submitFn('__whatsapp__'),
      onDecline: () => submitFn('Ainda tenho dúvidas'),
    })
    quickRepliesArea.appendChild(el)
    return
  }
  const el = createQuickReplies(stage, text => submitFn(text))
  if (el) quickRepliesArea.appendChild(el)
}

// profile is passed from main.js to avoid a circular import
export function renderBotMessage(rawContent, payload, profile) {
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
