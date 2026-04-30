# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinBot is an MVP for a conversational financial education chatbot for Brazilian financial educator Maurício Fidelis. It guides users through a structured 4-stage financial onboarding journey, ultimately inviting them to a paid consultation.

All user-facing content is in **Brazilian Portuguese**.

## Running the Project

No build tools are required. Open any HTML file directly in a browser:

- `General/Code Mockup/assistente_financeiro_mvp.html` — Full interactive demo (primary application)
- `General/UI/exemplo_conversa_mvp_financeiro.html` — Annotated example conversation
- `General/UI/mvp_core_prompt_financeiro.html` — Prompt documentation and MVP scope analysis

The chat UI calls `https://api.anthropic.com/v1/messages` directly from the browser (requires a valid Anthropic API key and internet connection). There is no backend or build step.

## Architecture

### Conversational Flow (4 Stages)

| Stage | Name | Purpose |
|-------|------|---------|
| 0 | Identificação | Greet and classify: new vs. returning user |
| 1 | Diagnóstico | One-question-at-a-time financial health check |
| 2 | Organização | Teach expense tracking; collect monthly income |
| 3 | Reserva Estratégica | Generate personalized emergency fund plan |
| 4 | Lead/Consultoria | Invite to paid consultation |

### Message Processing Pipeline

1. User sends message → appended to in-memory conversation history
2. Full history + system prompt sent to Claude API (`claude-sonnet-4-20250514`)
3. Bot response parsed for embedded special tokens:
   - `|||CALC|||{JSON}|||` → renders a styled financial calculation card
   - `|||CTA|||` → renders a consultation call-to-action bubble
   - `|||RETURNING|||{theme}|||` → sets returning-customer context
4. Stage detected from response content → updates header badge and divider
5. Quick reply buttons updated per stage

### Key Files

- `General/Code Mockup/assistente_financeiro_mvp.html` — ~2,100-line self-contained app; contains all HTML, CSS, and JS
- `General/Code Mockup/system_prompt_finbot.js` — System prompt as a JS module (~500 lines)
- `General/Docs/Persona/assistente_educacao_financeira_v4.md` — Plain-text reference version of the system prompt (easier to edit)
- `src/` — Empty; reserved for future backend

### Design System (CSS Variables)

- Primary: Teal (`#1D9E75`, `#0F6E56`, `#085041`, `#04342C`)
- Accent: Amber (`#BA7517`, `#854F0B`)
- Neutral: Gray (`#5F5E5A`, `#888780`)
- Typography: Georgia serif (display), system-ui (UI)
- Chat container: 420px × 680px, responsive

### Special Message Bubble Types

| Type | Appearance | Trigger |
|------|-----------|---------|
| Bot | Gray, left-aligned | Standard response |
| User | Teal, right-aligned | User input |
| CTA | Border-highlighted | `|||CTA|||` token |
| Returning | Amber background | `|||RETURNING|||` token |

## System Prompt Scope (MVP Boundaries)

The bot **must not**:
- Recommend specific assets or investments
- Provide return simulations
- Guide users through complex debt restructuring or negative credit (negativado)

Out-of-scope requests should be acknowledged warmly and redirected to Maurício's consultation.

## Known Limitations

- **No persistence** — conversation history lives in JS memory, lost on refresh
- **No backend** — client-side only; API key is embedded in the frontend (must be secured before production)
- Stage 4 (lead capture) is partially implemented
- No authentication, analytics, or admin dashboard (planned for V2+)
