/**
 * Normalizes conversation history for the Anthropic Messages API.
 * - Valid roles: user | assistant with non-empty trimmed content
 * - Must start with user (leading assistant messages removed)
 * - Roles must alternate (consecutive duplicates keep the last one)
 */
function sanitizeMessagesForAnthropic(messages) {
  if (!Array.isArray(messages)) return [];

  let filtered = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role,
      content: String(m.content ?? "").trim(),
    }))
    .filter((m) => m.content.length > 0);

  while (filtered.length > 0 && filtered[0].role !== "user") {
    filtered = filtered.slice(1);
  }

  const out = [];
  for (const msg of filtered) {
    if (out.length > 0 && out[out.length - 1].role === msg.role) {
      out[out.length - 1] = msg;
    } else {
      out.push(msg);
    }
  }

  return out;
}

module.exports = { sanitizeMessagesForAnthropic };
