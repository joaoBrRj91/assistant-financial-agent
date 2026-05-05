export const STAGES = [
  'start',
  'identification',
  'diagnosis',
  'organization',
  'reserve',
  'lead',
]

export const STAGE_CONFIG = {
  start:          { label: 'Início',         colorTheme: 'teal',  dividerLabel: null },
  identification: { label: 'Identificação',  colorTheme: 'teal',  dividerLabel: null },
  diagnosis:      { label: 'Diagnóstico',    colorTheme: 'teal',  dividerLabel: 'Diagnóstico' },
  organization:   { label: 'Organização',    colorTheme: 'blue',  dividerLabel: 'Organização & controle' },
  reserve:        { label: 'Reserva',        colorTheme: 'blue',  dividerLabel: 'Reserva estratégica' },
  lead:           { label: 'Consultoria',    colorTheme: 'amber', dividerLabel: 'Consultoria' },
}

// Keywords detected in bot responses (Portuguese). Ordered most-specific-first
// (furthest stage first) so the detector stops at the strongest match.
export const STAGE_KEYWORDS = {
  reserve:        ['reserva', 'meta', 'guardar por mês'],
  organization:   ['anotar', 'controlar', 'renda', 'salário mensal', 'quanto você ganha'],
  diagnosis:      ['guardado', 'te preocupa', 'situação financeira'],
  identification: ['primeira vez', 'conversou comigo', 'antes'],
}
