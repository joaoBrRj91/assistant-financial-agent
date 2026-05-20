# SPEC · Reserve Calculator
**Module:** `ReserveCalculator`
**Product:** Financial Assistant · Maurício Fidelis
**Version:** MVP 1.0
**Priority:** HIGH — the central value-delivery feature of the product

---

## PURPOSE

Renders a structured calculation card inside a bot chat bubble when the Conversational Engine (Module 01) returns a valid `calcData` object. This is a pure presentational module — it owns no state and makes no API calls.

---

## FILES TO CREATE

```
src/components/ReserveCard/ReserveCard.jsx
src/components/ReserveCard/CardRow.jsx
src/components/ReserveCard/ReserveCard.css
src/utils/formatReserve.js
```

---

## WHEN IT RENDERS

`ReserveCard` renders **only** when both conditions are true:
1. `calcData` is a valid object (all five fields are present positive numbers)
2. `isCTA` is `false`

If `isCTA` is `true`, this module does not render — Module 04 takes over entirely.

---

## INPUT DATA

The card receives `calcData` with these fields:

| Field | Meaning | Example |
|---|---|---|
| `salario` | Monthly net income | `3500` |
| `despesas` | Estimated expenses (income × 0.85) | `2975` |
| `meta` | Reserve goal (expenses × 3) | `8925` |
| `mensal` | Monthly savings target (income × 0.10) | `350` |
| `prazo` | Months to reach goal (goal ÷ monthly savings) | `25.5` |

---

## CARD LAYOUT

Five rows displayed in this order, inside the bot bubble below the message text:

| Label | Value | Style |
|---|---|---|
| Monthly income | formatted BRL | normal |
| Estimated expenses | formatted BRL | normal |
| Goal (3 months) | formatted BRL | normal |
| Save per month | formatted BRL | normal |
| Estimated timeline | human-readable duration | **highlighted** (teal value) |

---

## FORMATTING RULES

**Currency (`formatBRL`):**
- Brazilian Real format, pt-BR locale
- No decimal places
- Examples: `3500 → "R$ 3.500"`, `20000 → "R$ 20.000"`

**Timeline (`formatTimeline`):**
- `prazo > 24`: round to years → `"3 years"` (no `~` prefix)
- `prazo ≤ 24`: round up to whole months, add `~` prefix → `"~9 months"`
- Boundary: `prazo = 24` → `"~24 months"` (threshold is strictly greater than 24)
- `prazo = 24.1` → `"~25 months"` (ceiling, still ≤ 24 check fails → months)

All formatting logic belongs in `utils/formatReserve.js`, not inline in JSX.

---

## VISUAL STYLE

The card sits inside the bot bubble, separated from the message text by `margin-top: 10px`. It has:
- Subtle surface background with a light border
- Rows separated by hairline borders (last row has no border)
- Labels in muted text color
- Values in bold, standard text color
- Timeline row value in teal to draw the eye

---

## PLACEMENT IN THE CHAT

`ReserveCard` renders inside the same bubble as the bot's message text — not as a separate bubble.

```
[Bot bubble]
  Message text...
  ┌─ ReserveCard ───────────────────┐
  │  Monthly income       R$ 3.500  │
  │  Estimated expenses   R$ 2.975  │
  │  Goal (3 months)      R$ 8.925  │
  │  Save per month       R$ 350    │
  │  Estimated timeline   ~26 months│
  └─────────────────────────────────┘
```

For MVP, associate `calcData` with the most recent assistant message using `lastPayload` from `useConversation`. This is sufficient — persisting `calcData` inside the message history is a v2 concern.

---

## STAGE TRANSITION

When `ReserveCard` renders, notify Module 03 to advance the stage to `'reserve'`:

```js
useEffect(() => {
  if (lastPayload?.calcData && !lastPayload?.isCTA) {
    advanceStage('reserve');
  }
}, [lastPayload]);
```

---

## ACCEPTANCE CRITERIA

- [ ] Card renders with all 5 rows when `calcData` is valid
- [ ] Card renders nothing (`null`) when `calcData` is `null` or invalid
- [ ] Card never renders when `isCTA === true`
- [ ] Monetary values use Brazilian locale (dot as thousands separator, no decimals)
- [ ] `prazo ≤ 24` → displayed as `~N months`
- [ ] `prazo > 24` → displayed as `N years` (no `~`)
- [ ] `prazo = 24` → `"~24 months"` (boundary)
- [ ] `prazo = 24.1` → `"~25 months"` (ceiling, still months)
- [ ] Timeline row value is teal; other values are default text color
- [ ] Card appears inside the bot bubble, not as a separate bubble
- [ ] Stage advances to `'reserve'` after card renders
- [ ] All formatting logic is in `formatReserve.js`, not inline in JSX
