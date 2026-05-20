import { STAGES, STAGE_KEYWORDS } from '../constants/stageConfig.js'

// Stages with keyword detection, ordered most-specific-first (furthest stage first)
// so the first match wins the most advanced applicable stage.
const DETECTION_ORDER = ['reserve', 'organization', 'diagnosis', 'identification']

/**
 * Infers the next conversation stage from a cleaned bot response.
 *
 * @param {string} cleanedText   Bot response with special tokens already stripped
 * @param {string} currentStage  Current stage value (one of STAGES)
 * @returns {string|null}        Next stage, or null if no advancement detected
 */
export function detectStage(cleanedText, currentStage) {
  const lower = cleanedText.toLowerCase()
  const currentIndex = STAGES.indexOf(currentStage)

  for (const stage of DETECTION_ORDER) {
    const stageIndex = STAGES.indexOf(stage)
    if (stageIndex <= currentIndex) continue

    if (STAGE_KEYWORDS[stage].some(kw => lower.includes(kw))) {
      return stage
    }
  }

  return null
}
