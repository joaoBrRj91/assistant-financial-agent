# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinBot is an MVP for a conversational financial education chatbot for Brazilian financial educator Maurício Fidelis. It guides users through a structured 5-stage financial onboarding journey, ultimately inviting them to a paid consultation.

All user-facing content is in **Brazilian Portuguese**.

## Running the Project

No build tools are required. Open any HTML file directly in a browser:

- `General/Code Mockup/assistente_financeiro_mvp.html` — Full interactive demo (primary application)
- `General/UI/exemplo_conversa_mvp_financeiro.html` — Annotated example conversation
- `General/UI/mvp_core_prompt_financeiro.html` — Prompt documentation and MVP scope analysis

The chat UI calls `https://api.anthropic.com/v1/messages` directly from the browser (requires a valid Anthropic API key and internet connection). There is no backend or build step.

## Running Tests

```
npm run test
```

Uses Vitest with jsdom environment. 53 tests across 3 suites: `useConversation`, `tokenParser`, `anthropicService`.

## Architecture

### Conversational Flow (5 Stages)

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
- `src/constants/systemPrompt.js` — System prompt exported as ES module
- `src/hooks/useConversation.js` — Core stateful hook: message history, API calls, token parsing, localStorage persistence
- `src/services/anthropicService.js` — Thin fetch wrapper for `POST /v1/messages`
- `src/utils/tokenParser.js` — Stateless parser; extracts `calcData`, `isCTA`, `returningTheme` from raw API text
- `src/__tests__/` — Vitest test suite (53 tests across 3 files)
- `src/SpecStructure/specs/` — Acceptance-criteria specs for 4 upcoming UI modules (ConversationalEngine, ReserveCard, ProfileStageManager, CommercialCTA)

### Module Responsibilities

| Module | File | Role |
|--------|------|------|
| Hook | `src/hooks/useConversation.js` | State, optimistic updates, localStorage, subscribe/notify |
| Service | `src/services/anthropicService.js` | API transport only; no state |
| Parser | `src/utils/tokenParser.js` | Pure function; no side effects |
| Prompt | `src/constants/systemPrompt.js` | Single source of truth for system prompt |

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

- **Persistence implemented** — conversation history, client type, and stage saved to localStorage (`mf_chat_history`, `mf_client_type`, `mf_stage`)
- **No backend** — client-side only; API key embedded in HTML demo (must be secured before production)
- Stage 4 (lead capture/CTA) is specified but UI components not yet built (see `src/SpecStructure/specs/04_cta_spec.md`)
- ReserveCard, StageBadge, and ProfileStageManager UI components pending implementation (specs in `src/SpecStructure/specs/`)
- No authentication, analytics, or admin dashboard (planned for V2+)
