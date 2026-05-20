# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinBot is an MVP for a conversational financial education chatbot for Brazilian financial educator Maurício Fidelis. It guides users through a structured 6-stage financial onboarding journey, ultimately inviting them to a paid consultation via WhatsApp.

All user-facing content is in **Brazilian Portuguese**.

## Running the Project

### Frontend (`mvp-frontend/`)

No build tools are required. From `mvp-frontend/`, serve `index.html` via a local HTTP server (required for ES modules):

```
cd mvp-frontend
npx serve . --listen 3000
# or
python -m http.server 8080
```

Then open `http://localhost:PORT` in a browser. Enter a valid Anthropic API key when prompted.

The chat UI calls `https://api.anthropic.com/v1/messages` directly from the browser.

### Backend (`mvp-backend/`)

```
cd mvp-backend
npm install
node server.js
```

### Reference documents (read-only)

- `Docs/Code Mockup/assistente_financeiro_mvp.html` — Original monolithic demo (~2,100 lines)
- `Docs/Business/Persona/assistente_educacao_financeira_v4.md` — Plain-text reference version of the system prompt

## Running Tests

```
cd mvp-frontend
npm run test
```

Uses Vitest with jsdom environment. 8 test files covering all major modules.

## Architecture

### Conversational Flow (6 Stages)

| Stage Key | Label | Purpose |
|-----------|-------|---------|
| `start` | — | Initial state before first interaction |
| `identification` | Identificação | Greet and classify: new vs. returning user |
| `diagnosis` | Diagnóstico | One-question-at-a-time financial health check |
| `organization` | Organização | Teach expense tracking; collect monthly income |
| `reserve` | Reserva Estratégica | Generate personalized emergency fund plan |
| `lead` | Consultoria | Invite to paid consultation via WhatsApp |

### Message Processing Pipeline

1. User submits message → `useConversation.sendMessage(text)`
2. `useProfileStage.processUserMessage(text)` detects client type from early messages
3. Full history + system prompt sent to Claude API (`claude-haiku-4-5-20251001`)
4. Bot response parsed by `tokenParser` for embedded special tokens:
   - `|||CALC|||{JSON}|||` → renders a `ReserveCard` financial calculation card
   - `|||CTA|||` → renders a `CTABubble` consultation offer
   - `|||RETURNING|||{theme}|||` → sets returning-customer context via `ContextTag`
5. `useProfileStage.processResponseText(text)` detects stage transitions from keywords
6. `renderer.renderBotMessage()` orchestrates all UI output: text, card, CTA, context tag, divider
7. `renderer.renderQuickReplies()` updates stage-specific buttons

### File Structure

```
MVP/                                    Git repo root
├── CLAUDE.md
├── README.md
│
├── mvp-frontend/                       Frontend application
│   ├── index.html                      Entry point (API key screen → chat UI)
│   ├── package.json
│   ├── vitest.config.js
│   │
│   └── src/
│       ├── main.js                     App initialization & event wiring
│       │
│       ├── hooks/
│       │   ├── useConversation.js      Messages, API calls, token parsing, localStorage
│       │   └── useProfileStage.js      Stage tracking, client type, localStorage
│       │
│       ├── services/
│       │   └── anthropicService.js     Thin fetch wrapper for POST /v1/messages
│       │
│       ├── utils/
│       │   ├── tokenParser.js          Pure parser: extracts calcData, isCTA, returningTheme
│       │   ├── stageDetector.js        Stage transition detection by keyword matching
│       │   ├── ctaDetector.js          Affirmative intent detection (isAffirmative)
│       │   ├── formatReserve.js        BRL currency & timeline formatting
│       │   └── whatsapp.js             wa.me deep link builder
│       │
│       ├── constants/
│       │   ├── systemPrompt.js         Single source of truth for system prompt
│       │   ├── stageConfig.js          Stage definitions, keywords, color themes
│       │   ├── quickReplies.js         Quick reply options per stage
│       │   └── whatsapp.js             Phone number & message template config
│       │
│       ├── components/
│       │   ├── ReserveCard/
│       │   │   ├── ReserveCard.js      Financial calculation card (5 rows)
│       │   │   └── CardRow.js          Individual card row element
│       │   ├── CTABubble/
│       │   │   └── CTABubble.js        Consultation offer bubble (teal border)
│       │   ├── CTACard/
│       │   │   └── CTACard.js          Fixed-content CTA card
│       │   ├── CTAQuickReplies/
│       │   │   └── CTAQuickReplies.js  Yes/No buttons for CTA
│       │   ├── QuickReplies/
│       │   │   └── QuickReplies.js     Stage-specific quick reply buttons
│       │   ├── StageBadge/
│       │   │   └── StageBadge.js       Header badge showing current stage
│       │   ├── StageDivider/
│       │   │   └── StageDivider.js     Visual separator between stage transitions
│       │   └── ContextTag/
│       │       └── ContextTag.js       Amber tag for returning client context
│       │
│       ├── ui/
│       │   ├── domRefs.js              Cached DOM element references
│       │   └── renderer.js             All rendering functions & UI orchestration
│       │
│       ├── styles/
│       │   └── main.css                All styling (CSS variables, layouts)
│       │
│       ├── SpecStructure/
│       │   └── specs/                  Acceptance-criteria specs (implemented)
│       │       ├── 01_conversational_engine_spec.md
│       │       ├── 02_reserve_calculator_spec.md
│       │       ├── 03_profile_stage_spec.md
│       │       └── 04_cta_spec.md
│       │
│       └── __tests__/
│           ├── useConversation.test.js
│           ├── tokenParser.test.js
│           ├── anthropicService.test.js
│           ├── formatReserve.test.js
│           ├── ReserveCard.test.js
│           ├── profileStageManager.test.js
│           ├── renderMarkdown.test.js
│           └── commercialCTA.test.js
│
├── mvp-backend/                        Backend application
│   ├── server.js
│   ├── package.json
│   ├── constants/
│   ├── factory/
│   ├── providers/
│   └── routes/
│
└── Docs/                               Reference and legacy documents (read-only)
    ├── Business/
    │   ├── Persona/
    │   │   └── assistente_educacao_financeira_v4.md
    │   └── Specifications/
    │       └── mvp_spec_assistente_financeiro.html
    ├── Code Mockup/
    │   ├── assistente_financeiro_mvp.html
    │   └── system_prompt_finbot.js
    └── UI/
        ├── exemplo_conversa_mvp_financeiro.html
        └── mvp_core_prompt_financeiro.html
```

### Module Responsibilities

| Module | File | Owns | Does NOT own |
|--------|------|------|--------------|
| ConversationalEngine | `mvp-frontend/src/hooks/useConversation.js` | Messages, API calls, token parsing, localStorage | Stage/client state, rendering |
| ProfileStageManager | `mvp-frontend/src/hooks/useProfileStage.js` | Stage tracking, client type, localStorage | API calls, rendering |
| Service | `mvp-frontend/src/services/anthropicService.js` | HTTP transport only | Any state |
| Parser | `mvp-frontend/src/utils/tokenParser.js` | Pure token extraction | Any side effects |
| Renderer | `mvp-frontend/src/ui/renderer.js` | All DOM updates | State management, API calls |
| Components | `mvp-frontend/src/components/` | DOM creation, formatting | State, API calls |

### localStorage Keys

| Key | Owner | Content |
|-----|-------|---------|
| `mf_chat_history` | `useConversation` | Full message array (JSON) |
| `mf_stage` | `useProfileStage` | Current stage key string |
| `mf_client_type` | `useProfileStage` | `'new'` \| `'returning'` \| `null` |

### Special Tokens

| Token | Format | Renders |
|-------|--------|---------|
| CALC | `|||CALC|||{JSON}|||` | `ReserveCard` with 5 required numeric fields |
| CTA | `|||CTA|||` | `CTABubble` + `CTACard` + `CTAQuickReplies` |
| RETURNING | `|||RETURNING|||{theme}|||` | `ContextTag` with amber background |

CALC JSON must contain: `gastosMensais`, `metaReserva`, `prazoMeses`, `aporteMensal`, `percentualRenda` (all positive numbers).

### Design System (CSS Variables)

- Primary: Teal (`#1D9E75`, `#0F6E56`, `#085041`, `#04342C`)
- Accent: Amber (`#BA7517`, `#854F0B`)
- Neutral: Gray (`#5F5E5A`, `#888780`)
- Typography: Georgia serif (display), system-ui (UI)
- Chat container: 420px × 680px, responsive

## System Prompt Scope (MVP Boundaries)

The bot **must not**:
- Recommend specific assets or investments
- Provide return simulations
- Guide users through complex debt restructuring or negative credit (negativado)

Out-of-scope requests should be acknowledged warmly and redirected to Maurício's consultation.

## Known Limitations

- **No backend** — client-side only; API key entered at runtime (not stored server-side)
- **Direct browser API calls** — uses `anthropic-dangerous-direct-browser-access` header; must be secured before production
- **No authentication, analytics, or admin dashboard** — planned for V2+
- **WhatsApp config uses placeholder** — `mvp-frontend/src/constants/whatsapp.js` phone number must be updated before production
