import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callAnthropicAPI } from "../services/anthropicService.js";

const BACKEND_URL = "http://localhost:3001/api/chat";

describe("callAnthropicAPI", () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const messages = [{ role: "user", content: "Olá" }];

  function okResponse(text = "Resposta") {
    return {
      ok: true,
      json: () => Promise.resolve({ response: text }),
    };
  }

  it("makes a POST request to the backend endpoint", async () => {
    mockFetch.mockResolvedValueOnce(okResponse());
    await callAnthropicAPI(messages);
    expect(mockFetch).toHaveBeenCalledWith(
      BACKEND_URL,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("sends content-type application/json header", async () => {
    mockFetch.mockResolvedValueOnce(okResponse());
    await callAnthropicAPI(messages);
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers["content-type"]).toBe("application/json");
  });

  it("sends messages array in the request body", async () => {
    mockFetch.mockResolvedValueOnce(okResponse());
    await callAnthropicAPI(messages);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.messages).toEqual(messages);
  });

  it("returns the text from data.response", async () => {
    mockFetch.mockResolvedValueOnce(okResponse("Olá! Como posso ajudar?"));
    const result = await callAnthropicAPI(messages);
    expect(result).toBe("Olá! Como posso ajudar?");
  });

  it("throws when HTTP response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
    });
    await expect(callAnthropicAPI(messages)).rejects.toThrow();
  });

  it("throws on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(callAnthropicAPI(messages)).rejects.toThrow();
  });
});
