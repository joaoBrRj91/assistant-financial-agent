const BaseProvider = require("./BaseProvider");
const { SYSTEM_PROMPT } = require("../constants/systemPrompt");
const { sanitizeMessagesForAnthropic } = require("../utils/sanitizeMessages");

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-3.1-flash-lite";
const MAX_OUTPUT_TOKENS = 1000;

/**
 * Google Gemini provider.
 * Calls the Generative Language REST API using the API key from process.env.
 * The system prompt and model config live here — never exposed to the browser.
 */
class GeminiProvider extends BaseProvider {
  constructor() {
    super();
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error(
        "GOOGLE_API_KEY is not set in the environment. Check your .env file.",
      );
    }
    this.apiKey = process.env.GOOGLE_API_KEY;
  }

  async chat(messages) {
    const safeMessages = sanitizeMessagesForAnthropic(messages);
    if (safeMessages.length === 0) {
      throw new Error("No valid user messages to send");
    }

    // Gemini uses "model" instead of "assistant" for the AI role
    const contents = safeMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const endpoint = `${BASE_URL}/${MODEL}:generateContent?key=${this.apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const detail =
        errBody.error?.message ??
        JSON.stringify(errBody) ??
        response.statusText;
      console.error("[Gemini]", detail);
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText} — ${detail}`,
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate?.content?.parts?.[0]?.text) {
      throw new Error(
        `Gemini returned no content. finishReason: ${candidate?.finishReason ?? "unknown"}`,
      );
    }
    return candidate.content.parts[0].text;
  }
}

module.exports = GeminiProvider;
