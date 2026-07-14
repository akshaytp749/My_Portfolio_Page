import { AGENT_SYSTEM_PROMPT } from "../src/data/resume.js";

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 600;
const MAX_MESSAGES = 20; // ~10 user turns
const MAX_CONTENT_CHARS = 1200;

function validate(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return "messages must be a non-empty array";
  if (messages.length > MAX_MESSAGES) return "conversation too long — email akshaythomas.p@gmail.com instead";
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return "invalid role";
    if (typeof m.content !== "string" || !m.content.trim()) return "content must be a non-empty string";
    if (m.content.length > MAX_CONTENT_CHARS) return "message too long";
  }
  if (messages[messages.length - 1].role !== "user") return "last message must be from the user";
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "agent backend not configured" });
  }

  const { messages } = req.body ?? {};
  const invalid = validate(messages);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: AGENT_SYSTEM_PROMPT,
        messages: messages.map(({ role, content }) => ({ role, content })),
      }),
    });

    if (!anthropicRes.ok) {
      const detail = await anthropicRes.text();
      console.error("anthropic error", anthropicRes.status, detail);
      return res.status(502).json({ error: "upstream model error" });
    }

    const data = await anthropicRes.json();
    const reply = (data.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("chat handler error", err);
    return res.status(500).json({ error: "agent unavailable" });
  }
}
