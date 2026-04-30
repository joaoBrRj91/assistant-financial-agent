# SPEC · Conversational Engine
**Module:** `ConversationalEngine`
**Product:** Financial Assistant · Maurício Fidelis
**Version:** MVP 1.0
**Priority:** CRITICAL — all other modules depend on this one

---

## PURPOSE

This module is the runtime core. It owns the Anthropic API call, the full message history, and the structured payload that drives all UI decisions. It exposes a single custom hook — `useConversation` — to the rest of the application.

**It does not render anything.**

---

## FILES TO CREATE

```
src/hooks/useConversation.js
src/services/anthropicService.js
src/utils/tokenParser.js
src/constants/systemPrompt.js
```

---

## SYSTEM PROMPT

Use the prompt exactly as defined in `system_prompt_finbot.js`. Export it as a static string from `constants/systemPrompt.js` with no modifications, no logic, and no interpolation.

```js
// constants/systemPrompt.js
export const SYSTEM_PROMPT = `Você é o assistente financeiro virtual do Maurício Fidelis, educador financeiro.
 
SEU PAPEL:
Ajudar o usuário a organizar a vida financeira com clareza e ação prática — e no momento certo, convidá-lo para uma consultoria com o Maurício.
 
IDENTIDADE E TOM:
- Fale como um amigo que entende de finanças, nunca como consultor técnico
- Nunca julgue. Acolhe primeiro, orienta depois
- Use linguagem simples. Se usar termos técnicos, explique imediatamente
- Seja direto e humano. Evite respostas longas e frias
 
FLUXO PRINCIPAL (siga rigorosamente esta ordem, adaptando ao contexto do cliente):
 
ETAPA 0 — IDENTIFICAÇÃO (sempre primeira mensagem da sessão)
Após a saudação, pergunte: "Você já teve alguma conversa comigo antes ou é a primeira vez?"
- Se NOVO: siga o fluxo abaixo do zero, apresentando cada etapa com naturalidade
- Se RECORRENTE: pergunte sobre o assunto anterior, use-o como CONTEXTO para conduzir o mesmo fluxo abaixo. Não repita o que já foi explicado. Avance de onde o usuário parou ou aprofunde o tema anterior dentro das etapas.
 
ETAPA 1 — DIAGNÓSTICO
Faça UMA pergunta por vez:
- "Você tem algum dinheiro guardado hoje?"
- "O que te preocupa mais na sua vida financeira agora?"
Use as respostas para personalizar todo o restante.
 
ETAPA 2 — ORGANIZAÇÃO E CONTROLE
- Ensine o apontamento financeiro como primeiro passo prático
- Sugira método simples: anotar tudo por 7 dias
- Pergunte sobre renda mensal para personalizar o próximo passo
 
ETAPA 3 — RESERVA ESTRATÉGICA
- Explique o conceito de forma simples
- Com base na renda informada, calcule:
  * Despesas estimadas = 85% da renda
  * Meta mínima = despesas × 3
  * Sugestão mensal = 10% da renda
  * Prazo = meta ÷ valor mensal
- Apresente o plano de forma clara e acessível
 
ETAPA 4 — CAPTURA DE LEAD (CTA)
Acione quando: o usuário criou um plano, tem dúvida avançada, ou quer dar o próximo passo.
Mensagem: "Você está no caminho certo. Se quiser dar o próximo passo com acompanhamento personalizado, o Maurício oferece consultorias individuais. Posso te passar mais informações?"
 
ESTRUTURA DE CADA RESPOSTA:
1. Explicação simples (1-3 frases)
2. Exemplo do dia a dia quando relevante
3. Uma ação para fazer hoje
4. Uma pergunta para continuar a conversa
 
LIMITES DO MVP:
- Não recomende ativos específicos
- Não oriente sobre dívidas complexas ou negativação
- Não simule investimentos com rentabilidade projetada
 
REGRA DE OURO:
Nunca deixe o usuário sem um próximo passo claro. Seja conciso — máximo 4 parágrafos curtos por resposta.
 
FORMATO ESPECIAL:
Quando calcular a reserva estratégica, inclua os dados no formato JSON ao final da resposta assim:
|||CALC|||{"salario": NUMBER, "despesas": NUMBER, "meta": NUMBER, "mensal": NUMBER, "prazo": NUMBER}|||
 
Quando acionar o CTA, inclua ao final:
|||CTA|||
 
Quando identificar que é cliente recorrente e já souber o tema anterior, inclua:
|||RETURNING|||{tema anterior em uma frase curta}|||`;
```

> **Note:** The prompt is in Brazilian Portuguese — this is intentional. The assistant speaks to the user in Portuguese. Do not translate it.

---

## API CALL

- **Endpoint:** `https://api.anthropic.com/v1/messages`
- **Model:** `claude-sonnet-4-20250514`
- **max_tokens:** `1000`
- **Inputs:** full `messages[]` array + system prompt string
- **Output:** `data.content[0].text` (raw string, may contain tokens)
- Throw on any non-OK HTTP response

---

## TOKEN PARSING

`parseSpecialTokens(rawResponse)` is a pure function that returns:

```js
{
  text: string,           // cleaned text with all tokens removed
  calcData: object|null,  // parsed CALC payload, or null
  isCTA: boolean,         // true when |||CTA||| present
  returningTheme: string|null  // extracted RETURNING theme, or null
}
```

**Rules:**
- Strip all three token patterns from `text` before returning
- If CALC JSON is malformed, log a warning and return `calcData: null` — do not throw
- `calcData` is only valid when all five fields (`salario`, `despesas`, `meta`, `mensal`, `prazo`) are present positive numbers

---

## SESSION STATE

The hook maintains:

| State | Type | Persisted |
|---|---|---|
| `messages[]` | `{role, content}[]` | Yes — localStorage `mf_chat_history` |
| `isLoading` | boolean | No |
| `lastPayload` | ParsedPayload or null | No — ephemeral, current render only |

**Initialization:** load from localStorage on first render. If storage is absent, corrupt, or not a valid array, fall back to a single opening message:

> *"Olá! Que bom ter você aqui. Sou o assistente do Maurício Fidelis, educador financeiro. Estou aqui para te ajudar a organizar sua vida financeira de forma simples e prática. Antes de começar — você já teve alguma conversa comigo antes ou é a primeira vez?"*

**Optimistic update:** append the user message to `messages[]` immediately before the API call resolves, so it appears in the UI without delay.

**Storage:** always store the **raw** API response (tokens included) — the model must see its own tokens in future turns to maintain context.

**Display stripping:** UI components must strip tokens from `content` before rendering. Do this in the component layer, not in the hook.

---

## ERROR HANDLING

Any network failure or HTTP error must:
1. Append a friendly fallback assistant message: *"Tive um problema de conexão. Pode tentar de novo?"*
2. Set a valid `lastPayload` for that fallback (all fields null/false)
3. Always reset `isLoading` to `false`

Never expose HTTP status codes or technical error details to the user.

---

## ACCEPTANCE CRITERIA

- [ ] Hook initializes from localStorage when data is present and valid
- [ ] Falls back to opening message when storage is empty or corrupt
- [ ] User message appears in UI immediately (before API responds)
- [ ] `isLoading` is `true` during API call and always reset to `false` after
- [ ] All 3 tokens stripped from `text` in returned payload
- [ ] Raw response (tokens included) stored in `messages[]` and localStorage
- [ ] `calcData` is `null` when CALC token absent or JSON invalid
- [ ] `isCTA` is `false` when CTA token absent
- [ ] `returningTheme` is `null` when RETURNING token absent
- [ ] Fallback message shown on any API/network error
- [ ] localStorage updated after every state change
