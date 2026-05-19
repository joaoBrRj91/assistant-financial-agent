const BaseProvider = require('./BaseProvider')

/**
 * OpenAI provider stub.
 * Extend this class to add OpenAI support:
 *   1. npm install openai
 *   2. Add OPENAI_API_KEY to .env
 *   3. Replace the TODO blocks below with actual SDK calls
 */
class OpenAIProvider extends BaseProvider {
  constructor() {
    super()
    // TODO: validate process.env.OPENAI_API_KEY
    // TODO: this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async chat(messages) {
    // TODO: const response = await this.client.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    // })
    // TODO: return response.choices[0].message.content
    throw new Error('OpenAIProvider is not yet implemented. Set LLM_PROVIDER=anthropic in .env.')
  }
}

module.exports = OpenAIProvider
