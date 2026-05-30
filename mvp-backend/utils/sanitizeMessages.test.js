const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { sanitizeMessagesForAnthropic } = require("./sanitizeMessages");

describe("sanitizeMessagesForAnthropic", () => {
  it("removes leading assistant messages", () => {
    const result = sanitizeMessagesForAnthropic([
      { role: "assistant", content: "Olá!" },
      { role: "user", content: "Oi" },
    ]);
    assert.deepEqual(result, [{ role: "user", content: "Oi" }]);
  });

  it("removes multiple leading assistants", () => {
    const result = sanitizeMessagesForAnthropic([
      { role: "assistant", content: "A" },
      { role: "assistant", content: "B" },
      { role: "user", content: "Oi" },
    ]);
    assert.deepEqual(result, [{ role: "user", content: "Oi" }]);
  });

  it("keeps valid alternating history unchanged", () => {
    const input = [
      { role: "user", content: "Oi" },
      { role: "assistant", content: "Olá" },
      { role: "user", content: "Tudo bem?" },
    ];
    assert.deepEqual(sanitizeMessagesForAnthropic(input), input);
  });

  it("collapses consecutive user messages keeping the last", () => {
    const result = sanitizeMessagesForAnthropic([
      { role: "user", content: "primeira" },
      { role: "user", content: "segunda" },
    ]);
    assert.deepEqual(result, [{ role: "user", content: "segunda" }]);
  });

  it("returns empty when there is no user message", () => {
    assert.deepEqual(
      sanitizeMessagesForAnthropic([
        { role: "assistant", content: "só assistente" },
      ]),
      [],
    );
  });

  it("returns empty for non-array input", () => {
    assert.deepEqual(sanitizeMessagesForAnthropic(null), []);
  });

  it("drops messages with empty content", () => {
    const result = sanitizeMessagesForAnthropic([
      { role: "user", content: "   " },
      { role: "user", content: "ok" },
    ]);
    assert.deepEqual(result, [{ role: "user", content: "ok" }]);
  });
});
