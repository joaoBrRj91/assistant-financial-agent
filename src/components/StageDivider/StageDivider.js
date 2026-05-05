import { STAGE_CONFIG } from '../../constants/stageConfig.js'

/**
 * Creates a visual stage divider to insert into the chat list at a transition.
 * Returns null for stages that don't get a divider (start, identification).
 *
 * @param {string} stage  Stage being entered
 * @returns {HTMLElement|null}
 */
export function createStageDivider(stage) {
  const config = STAGE_CONFIG[stage]
  if (!config?.dividerLabel) return null

  const el = document.createElement('div')
  el.className = 'stage-divider'

  const label = document.createElement('span')
  label.className = 'stage-divider__label'
  label.textContent = config.dividerLabel

  el.appendChild(label)
  return el
}
