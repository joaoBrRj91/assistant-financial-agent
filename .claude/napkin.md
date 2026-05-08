# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-05-08] ES modules require HTTP server — no file:// protocol**
   Do instead: always serve via `npx serve .` or `python -m http.server 8080`, never open index.html directly.

2. **[2026-05-08] API key is entered at runtime, not stored**
   Do instead: when testing browser flow, always have an Anthropic API key ready to paste at the prompt screen.

3. **[2026-05-08] Tests use Vitest with jsdom — run `npm run test`**
   Do instead: run `npm run test` to execute all 7 test files; do not use jest or other runners.

## Shell & Command Reliability
1. **[2026-05-08] Working directory has spaces — always quote paths**
   Do instead: wrap all paths in double quotes when using Bash tool (e.g., `"C:\Users\joaon\Projetos\Assistente Financeiro (FinBot)\3-Project\MVP"`).

## Domain Behavior Guardrails
1. **[2026-05-08] All user-facing content must be in Brazilian Portuguese**
   Do instead: never write UI text, bot messages, or quick reply labels in English — always use pt-BR.

2. **[2026-05-08] Bot must not recommend assets, simulate returns, or handle negativado cases**
   Do instead: redirect out-of-scope requests warmly to Maurício's WhatsApp consultation.

3. **[2026-05-08] CALC token requires exactly 5 fields: gastosMensais, metaReserva, prazoMeses, aporteMensal, percentualRenda**
   Do instead: when generating or testing CALC token JSON, always include all 5 positive numeric fields.

## User Directives
1. **[2026-05-08] SDD (Spec-Driven Development) workflow is in use**
   Do instead: specs live in `src/SpecStructure/specs/`; implement features against those specs and run tests to validate.
