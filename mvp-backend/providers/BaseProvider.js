/**
 * Abstract base class for LLM providers.
 * All concrete providers must extend this class and implement `chat()`.
 */
class BaseProvider {
  /**
   * Sends the conversation history to the LLM and returns the raw response text.
   *
   * @param {{ role: string, content: string }[]} messages - Full conversation history
   * @returns {Promise<string>} Raw response text (may contain special tokens like |||CALC|||)
   */
  async chat(messages) {
    throw new Error(`${this.constructor.name} must implement chat()`)
  }
}

module.exports = BaseProvider
