# SPEC · Commercial CTA
**Module:** `CommercialCTA`
**Product:** Financial Assistant · Maurício Fidelis
**Version:** MVP 1.0
**Priority:** HIGH — primary commercial objective of the product

---

## PURPOSE

This is the conversion point of the funnel. It activates when Module 01 returns `isCTA === true`, replacing the standard chat bubble and quick replies with a distinct, high-signal consultation offer.

**Affirmative responses open WhatsApp directly — no API call is made.**

---

## FILES TO CREATE

```
src/components/CTABubble/CTABubble.jsx + .css
src/components/CTACard/CTACard.jsx + .css
src/components/CTAQuickReplies/CTAQuickReplies.jsx + .css
src/utils/whatsapp.js
src/constants/whatsapp.js
src/utils/ctaDetector.js
```

---

## ACTIVATION CONDITION

Module activates **only** when `lastPayload.isCTA === true`.

When active, `isCTA` suppresses the `ReserveCard` from Module 02 — even if `calcData` is also present. The two should not coexist in a well-prompted response, but this acts as a safeguard.

---

## CTA BUBBLE

The main container. Visually distinct from standard bot bubbles via a teal border.

Structure:
1. Model's cleaned text (shown above the card when non-empty; omitted when empty string)
2. `CTACard` — always shown, always the same content

---

## CTA CARD (fixed content)

The value proposition is fixed — never driven by props:

> **Want to go further?**
>
> Maurício offers individual consultations — together you'll build a real budget, find where money is leaking, and create a personalized financial strategy.
>
> Can I send you more information?

Card has a teal-tinted background (teal-50) with teal text, visually separated from the bubble.

---

## CTA QUICK REPLIES

Replaces standard quick replies when stage is `'lead'` (set by Module 03).

Two options:
- **"Yes, I'd like to know more!"** → affirmative path (teal/primary style)
- **"I still have questions"** → negative path (default style)

---

## INTERACTION LOGIC

### Affirmative path (button click or typed affirmative)

```
1. Display user message in chat: "Yes, I'd like to know more!"
2. Open WhatsApp in new tab (noopener, noreferrer)
3. Show confirmation in chat (no API call):
   "Great! I'm sending you to Maurício's WhatsApp. 👋"
```

No Anthropic API call is made for the affirmative path. The WhatsApp redirect replaces it.

### Negative path (button click)

```
1. Send "I still have questions" through normal Module 01 flow
2. API call resumes; model continues educational conversation
```

### Typed affirmative detection

When `currentStage === 'lead'` and the user types instead of clicking, detect intent before routing to the API.

Affirmative signals (case-insensitive, substring match):
`yes`, `want`, `more info`, `sure`, `ok`, `let`, `let's go`, `sounds good`, `great`, `please`

If any signal matches → trigger the affirmative path. Otherwise → normal API call.

---

## WHATSAPP CONFIGURATION

Phone number and pre-filled message are stored in `constants/whatsapp.js` — never hardcoded in a component.

```js
export const WHATSAPP_CONFIG = {
  phone: '5511999999999',   // ← update with Maurício's real number before deploy
  message: "Hello Maurício! I saw the consultation offer and I'd like to know more.",
};
```

The URL builder (`utils/whatsapp.js`) takes a phone string and optional message, returning a `wa.me` deep link with the message URL-encoded.

---

## STAGE TRANSITION

When `CTABubble` renders, immediately force stage to `'lead'` via Module 03:

```js
useEffect(() => {
  if (lastPayload?.isCTA) {
    forceStage('lead');
  }
}, [lastPayload]);
```

The `lead` stage causes Module 03's `QuickReplies` to return `null`, making room for `CTAQuickReplies`.

---

## PERSISTENCE NOTE

This module writes nothing to localStorage directly. Stage `'lead'` is persisted by Module 03. If the user reloads at the `lead` stage, `CTAQuickReplies` correctly renders again.

---

## ACCEPTANCE CRITERIA

- [ ] `CTABubble` renders when `isCTA === true` and does not render otherwise
- [ ] `CTABubble` has a teal border visually distinct from standard bot bubbles
- [ ] `CTACard` content is always shown, never driven by props
- [ ] Model text shown above `CTACard` when non-empty; omitted when empty string
- [ ] `CTAQuickReplies` replaces standard quick replies when stage is `'lead'`
- [ ] Affirmative button opens WhatsApp in a new tab with pre-filled message
- [ ] Affirmative click does NOT trigger an Anthropic API call
- [ ] Confirmation message shown in chat after affirmative click
- [ ] Decline button sends message through normal Module 01 API flow
- [ ] Typed affirmative response (e.g. "yes please") triggers WhatsApp redirect
- [ ] Stage is set to `'lead'` when `CTABubble` renders
- [ ] `ReserveCard` (Module 02) does not render when `isCTA === true`
- [ ] WhatsApp phone number is in `WHATSAPP_CONFIG`, not hardcoded in a component
