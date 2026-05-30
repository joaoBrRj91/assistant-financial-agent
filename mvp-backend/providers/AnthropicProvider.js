const BaseProvider = require("./BaseProvider");
const { SYSTEM_PROMPT } = require("../constants/systemPrompt");
const {
  sanitizeMessagesForAnthropic,
} = require("../utils/sanitizeMessages");

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1000;

/**
 * Anthropic provider.
 * Calls the Anthropic Messages API using the API key from process.env.
 * The system prompt and model config live here — never exposed to the browser.
 */
class AnthropicProvider extends BaseProvider {
  constructor() {
    super();
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set in the environment. Check your .env file.",
      );
    }
    this.apiKey = process.env.ANTHROPIC_API_KEY;
  }

  async chat(messages) {
    const safeMessages = sanitizeMessagesForAnthropic(messages);
    if (safeMessages.length === 0) {
      throw new Error("No valid user messages to send");
    }

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: safeMessages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const detail =
        errBody.error?.message ?? JSON.stringify(errBody) ?? response.statusText;
      const requestId = response.headers.get("request-id");
      console.error("[Anthropic]", detail, requestId ? `(request-id: ${requestId})` : "");
      throw new Error(
        `Anthropic API error: ${response.status} ${response.statusText} — ${detail}`,
      );
    }

    const data = await response.json();
    return data.content[0].text;
  }
}

module.exports = AnthropicProvider;
