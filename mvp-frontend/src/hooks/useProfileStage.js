import { STAGES } from '../constants/stageConfig.js'
import { detectStage } from '../utils/stageDetector.js'

const STORAGE_KEYS = {
  clientType: 'mf_client_type',
  stage: 'mf_stage',
}

const RETURNING_SIGNALS = ['sim', 'já', 'antes', 'conversamos', 'voltei', 'lembro']
const NEW_SIGNALS = ['não', 'primeira vez', 'nunca', 'novo', 'jamais']

function loadStage() {
  const stored = localStorage.getItem(STORAGE_KEYS.stage)
  return STAGES.includes(stored) ? stored : 'start'
}

function loadClientType() {
  const stored = localStorage.getItem(STORAGE_KEYS.clientType)
  return stored === 'new' || stored === 'returning' ? stored : null
}

/**
 * Creates a profile-and-stage manager that tracks client type and conversation
 * stage, persisting both to localStorage.
 *
 * @returns {{ getState, processUserMessage, processResponseText, processReturningToken, forceStage }}
 */
export function useProfileStage() {
  let _stage = loadStage()
  let _clientType = loadClientType()
  let _turnCount = 0

  function _setStage(stage) {
    _stage = stage
    localStorage.setItem(STORAGE_KEYS.stage, stage)
  }

  function _setClientType(type) {
    _clientType = type
    localStorage.setItem(STORAGE_KEYS.clientType, type)
  }

  function getState() {
    return { currentStage: _stage, clientType: _clientType }
  }

  /**
   * Called on each user submission. Detects client type from early messages.
   * @param {string} text  Raw user message
   */
  function processUserMessage(text) {
    _turnCount++
    if (_clientType !== null || _turnCount > 2) return

    const lower = text.toLowerCase()
    if (NEW_SIGNALS.some(s => lower.includes(s))) {
      _setClientType('new')
    } else if (RETURNING_SIGNALS.some(s => lower.includes(s))) {
      _setClientType('returning')
    }
  }

  /**
   * Called with the cleaned bot response. Advances stage when keywords match.
   * @param {string} text  Cleaned response text (tokens already stripped)
   * @returns {string|null}  New stage if a transition occurred, otherwise null
   */
  function processResponseText(text) {
    const next = detectStage(text, _stage)
    if (!next) return null
    _setStage(next)
    return next
  }

  /**
   * Called when a RETURNING token arrives from Module 01.
   * Sets clientType to 'returning' if not already assigned.
   * @param {string} theme
   */
  function processReturningToken(theme) {
    if (_clientType === null) {
      _setClientType('returning')
    }
    return theme
  }

  /**
   * Bypasses keyword detection and forces a specific stage.
   * Only advances — never goes backward.
   * @param {string} stage
   */
  function forceStage(stage) {
    const currentIndex = STAGES.indexOf(_stage)
    const targetIndex = STAGES.indexOf(stage)
    if (targetIndex > currentIndex) {
      _setStage(stage)
    }
  }

  return { getState, processUserMessage, processResponseText, processReturningToken, forceStage }
}
