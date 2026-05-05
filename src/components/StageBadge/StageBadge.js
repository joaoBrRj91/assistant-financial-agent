import { STAGE_CONFIG } from '../../constants/stageConfig.js'

/**
 * Creates the stage badge shown in the chat header.
 * @param {string} stage  Current stage key
 * @returns {HTMLElement}
 */
export function createStageBadge(stage) {
  const config = STAGE_CONFIG[stage] ?? STAGE_CONFIG.start
  const el = document.createElement('span')
  el.className = `stage-badge stage-badge--${config.colorTheme}`
  el.textContent = config.label
  return el
}
