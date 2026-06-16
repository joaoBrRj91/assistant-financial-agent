const AnthropicProvider = require('../providers/AnthropicProvider')
const OpenAIProvider = require('../providers/OpenAIProvider')
const GeminiProvider = require('../providers/GeminiProvider')

// Registry of available providers. Add new entries here to extend the factory.
const PROVIDERS = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  gemini: GeminiProvider,
}

/**
 * Factory that reads LLM_PROVIDER from the environment and returns
 * a configured provider instance.
 *
 * Usage: const provider = LLMFactory.getProvider()
 */
const LLMFactory = {
  getProvider() {
    const providerKey = (process.env.LLM_PROVIDER || 'anthropic').toLowerCase()
    const ProviderClass = PROVIDERS[providerKey]

    if (!ProviderClass) {
      throw new Error(
        `Unknown LLM_PROVIDER "${providerKey}". Valid options: ${Object.keys(PROVIDERS).join(', ')}`
      )
    }

    return new ProviderClass()
  },
}

module.exports = LLMFactory
