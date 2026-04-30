# SPEC · Profile & Stage Management
**Module:** `ProfileStageManager`
**Product:** Financial Assistant · Maurício Fidelis
**Version:** MVP 1.0
**Priority:** HIGH — drives UX personalization and conversation progression

---

## PURPOSE

Tracks two independent states that persist across the full session:

1. **Client type** — whether this is a new or returning user (set once, never changed)
2. **Conversation stage** — which step of the funnel the user is currently in

These states drive: the header badge, visual stage dividers in the chat, the context tag for returning clients, and the quick reply options shown at each step.

**This module does not call the API and does not render chat bubbles.**

---

## FILES TO CREATE

```
src/context/ProfileStageContext.jsx
src/hooks/useProfileStage.js
src/utils/stageDetector.js
src/constants/stageConfig.js
src/constants/quickReplies.js
src/components/StageBadge/StageBadge.jsx + .css
src/components/StageDivider/StageDivider.jsx + .css
src/components/ContextTag/ContextTag.jsx + .css
src/components/QuickReplies/QuickReplies.jsx + .css
```

---

## STATE DEFINITIONS

### Client type

```
null → 'new' | 'returning'
```

Set on first detection. **Never changes after that**, even if later messages contradict it.

### Conversation stage

Six values, advancing in order only — never backward:

```
start → identification → diagnosis → organization → reserve → lead
```

| Stage | Meaning |
|---|---|
| `start` | Initial state before the first exchange |
| `identification` | Determining whether user is new or returning |
| `diagnosis` | Exploring their current financial situation |
| `organization` | Teaching tracking; capturing monthly income |
| `reserve` | Reserve calculation presented |
| `lead` | CTA shown; user deciding on consultation |

---

## PERSISTENCE

| localStorage key | Value | Notes |
|---|---|---|
| `mf_client_type` | `'new'` \| `'returning'` | Persists across reloads |
| `mf_stage` | stage string | Falls back to `'start'` if invalid |

---

## STAGE DETECTION LOGIC

Stage transitions are inferred from the model's cleaned response text (tokens already stripped). Match from most specific to most general:

| Keywords detected in response | Advance to |
|---|---|
| "reserve", "goal", "save per month" | `reserve` |
| "write down", "track", "income", "monthly salary", "how much do you earn" | `organization` |
| "money saved", "worries you", "financial situation", "right now" | `diagnosis` |
| "first time", "talked with me", "before" | `identification` |

Rules:
- Only advance if the detected stage is strictly ahead of the current one
- If no keywords match, no transition occurs
- `forceStage('reserve')` called by Module 02, and `forceStage('lead')` called by Module 04, bypass detection entirely

### Client type detection (early turns only)

When `clientType` is still `null` and the turn count is ≤ 2, scan the user's message:

- **Returning signals:** "yes", "already", "before", "we talked", "returning", "back", "remember"
- **New signals:** "no", "first time", "never", "new", "haven't"

The `RETURNING` token from Module 01 also sets `clientType = 'returning'` if not already set.

---

## INTEGRATION SEQUENCE

On each user submission, `ChatShell` runs these steps in order:

```
1. processUserMessage(text, turnCount)     — detect client type (early turns)
2. sendMessage(text)                       — Module 01 API call
   ↓
   lastPayload arrives { text, calcData, isCTA, returningTheme }
3. if returningTheme → processReturningToken(theme)
      → sets clientType = 'returning'
      → pushes context-tag item to chatItems (once per session)
4. if isCTA → forceStage('lead')
      → Module 04 takes over rendering
5. else → newStage = processResponseText(text)
      → if newStage has a divider label → push divider item to chatItems
6. if calcData → forceStage('reserve')    — called by Module 02
7. push assistant message item to chatItems
```

---

## STAGE BADGE

Displayed in the chat header. Updates label and color on every stage transition.

| Stage | Label | Color theme |
|---|---|---|
| `start`, `identification` | Start / Identification | Teal (default) |
| `diagnosis` | Diagnosis | Teal |
| `organization`, `reserve` | Organization / Reserve | Blue |
| `lead` | Consultation | Amber |

---

## STAGE DIVIDERS

A text divider is inserted into the chat list at each stage transition, between the prior message and the new one.

Dividers appear for: `diagnosis`, `organization`, `reserve`, `lead`.
**No divider** for the `start → identification` transition.

Divider labels:

| Stage | Label |
|---|---|
| `diagnosis` | Diagnosis |
| `organization` | Organization & control |
| `reserve` | Strategic reserve |
| `lead` | Consultation |

Dividers are items in the `chatItems` array in `ChatShell`, not chat bubbles. They render as a horizontal rule with a centered label.

---

## CONTEXT TAG (returning clients)

When `returningTheme` arrives from Module 01, show a one-time tag in the chat that reads:

> *Previous context: {theme}*

The tag has amber styling (warm, soft background). It appears once per session, even if multiple `RETURNING` tokens arrive. It is not shown for new clients.

---

## QUICK REPLIES

Stage-driven options shown below the chat input. Replace with Module 04's `CTAQuickReplies` at the `lead` stage.

| Stage | Options |
|---|---|
| `identification` | "Yes, I have chatted before" · "No, it's my first time" |
| `diagnosis` | "I have nothing saved" · "I have a little saved" · "I have debt" |
| `organization` | "I prefer a mobile app" · "I prefer paper or spreadsheet" |
| `reserve` | "How do I save that amount?" · "Help me build my budget" |
| `start`, `lead` | None (no quick replies) |

---

## ACCEPTANCE CRITERIA

- [ ] Stage badge updates label and color on every stage transition
- [ ] Stage only advances, never goes back
- [ ] Stage divider inserted exactly once per transition
- [ ] No divider for `start → identification`
- [ ] Context tag shown exactly once per session for returning clients
- [ ] Context tag never shown for new clients
- [ ] Quick replies update immediately on stage change
- [ ] No quick replies at `start` or `lead` stages
- [ ] `clientType` is immutable after first assignment
- [ ] `RETURNING` token sets `clientType = 'returning'` if not already set
- [ ] Both `clientType` and `currentStage` persist across page reloads
- [ ] `forceStage('reserve')` correctly advances stage when called by Module 02
- [ ] Returning client context tag has amber visual treatment
