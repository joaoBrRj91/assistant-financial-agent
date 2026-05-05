# FinBot MVP

Chatbot de educação financeira para Maurício Fidelis. Conduz usuários por uma jornada de 5 etapas de onboarding financeiro, culminando em um convite para consultoria paga.

## Pré-requisitos

- **Node.js 18+** — necessário para o servidor local e os testes
- **Chave de API da Anthropic** — obtida em [console.anthropic.com](https://console.anthropic.com)

## Como rodar

O app usa ES Modules nativos do browser. Para isso funcionar, **é obrigatório servir os arquivos via HTTP** (abrir o `index.html` diretamente como arquivo não funciona com ES Modules).

### 1. Instale as dependências

```bash
npm install
```

### 2. Inicie o servidor local

```bash
npm start
```

Isso inicia um servidor estático em `http://localhost:3000`.

### 3. Abra no browser

Acesse `http://localhost:3000` e insira sua chave da Anthropic API na tela inicial.

> **Alternativa:** Se tiver a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code, clique com o botão direito em `index.html` → "Open with Live Server".

## Rodar os testes

```bash
npm test
```

53 testes em 3 suítes: `useConversation`, `tokenParser`, `anthropicService`.

## Estrutura do projeto

```
MVP/
├── index.html                    ← Entrypoint da aplicação
├── src/
│   ├── main.js                   ← Inicialização e orquestração dos módulos
│   ├── hooks/
│   │   ├── useConversation.js    ← Estado, chamadas à API, persistência
│   │   └── useProfileStage.js    ← Tipo de cliente e etapa da conversa
│   ├── services/
│   │   └── anthropicService.js   ← Wrapper HTTP para a API Anthropic
│   ├── utils/
│   │   ├── tokenParser.js        ← Parseia tokens especiais (CALC, CTA, RETURNING)
│   │   ├── stageDetector.js      ← Detecta transições de etapa por palavras-chave
│   │   ├── ctaDetector.js        ← Detecta respostas afirmativas do usuário
│   │   ├── formatReserve.js      ← Formatação de moeda (BRL) e tempo
│   │   └── whatsapp.js           ← Gera link wa.me
│   ├── components/
│   │   ├── ReserveCard/          ← Card de cálculo de reserva emergencial
│   │   ├── CTABubble/            ← Bolha de oferta de consultoria
│   │   ├── CTACard/              ← Conteúdo fixo da oferta
│   │   ├── CTAQuickReplies/      ← Botões de resposta rápida da CTA
│   │   ├── QuickReplies/         ← Botões de resposta rápida padrão
│   │   ├── StageBadge/           ← Badge de etapa no cabeçalho
│   │   ├── StageDivider/         ← Divisor visual entre etapas
│   │   └── ContextTag/           ← Tag de contexto para clientes recorrentes
│   ├── constants/
│   │   ├── systemPrompt.js       ← Prompt do sistema (fonte única da verdade)
│   │   ├── stageConfig.js        ← Configuração das etapas e palavras-chave
│   │   ├── quickReplies.js       ← Opções de resposta rápida por etapa
│   │   └── whatsapp.js           ← Número e mensagem pré-preenchida do WhatsApp
│   └── __tests__/                ← Suíte de testes (Vitest)
├── Docs/
│   └── Code Mockup/
│       └── assistente_financeiro_mvp.html  ← Demo monolítico de referência
└── package.json
```

## Tokens especiais

O modelo pode incluir tokens estruturados na resposta para disparar componentes de UI:

| Token | Efeito |
|-------|--------|
| `\|\|\|CALC\|\|\|{JSON}\|\|\|` | Renderiza o `ReserveCard` com os dados financeiros |
| `\|\|\|CTA\|\|\|` | Renderiza a bolha de oferta de consultoria |
| `\|\|\|RETURNING\|\|\|{tema}\|\|\|` | Define o contexto do cliente recorrente |

## Configuração antes do deploy

1. **Número do WhatsApp** — atualize `src/constants/whatsapp.js` com o número real de Maurício
2. **Chave da API** — nunca exponha a chave em produção; considere um backend proxy
3. **Prompt do sistema** — edite `src/constants/systemPrompt.js` para ajustar o comportamento do assistente

## Referência de demo

O arquivo `Docs/Code Mockup/assistente_financeiro_mvp.html` é um demo monolítico e autocontido (HTML + CSS + JS em um único arquivo) que pode ser aberto diretamente no browser e serve como referência visual da interface.
