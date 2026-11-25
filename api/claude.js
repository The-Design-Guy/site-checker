// POST /api/claude — forwards a Messages API request to Anthropic with the
// server's key, and streams the answer back untouched (the progress ring needs it).
const { authed, send, readJSON } = require("./_lib");

const BASE = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
const ALLOWED = ["model", "max_tokens", "system", "messages", "tools", "tool_choice", "stream", "temperature", "thinking", "stop_sequences", "metadata"];

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "POST only" });
  if (!process.env.APP_PASSWORD) return send(res, 503, { error: "APP_PASSWORD is not set on the server" });
  if (!authed(req)) return send(res, 401, { error: "wrong password" });
  if (!process.env.ANTHROPIC_API_KEY) return send(res, 503, { error: "ANTHROPIC_API_KEY is not set on the server" });

  let body;
  try { body = await readJSON(req); } catch (e) { return send(res, 400, { error: "bad JSON" }); }
  if (!/^claude-/.test(String(body.model || ""))) return send(res, 400, { error: "model must be a Claude model" });
  if (!(body.max_tokens > 0) || body.max_tokens > 32000) return send(res, 400, { error: "max_tokens must be 1–32000" });
  const clean = {};
  for (const k of ALLOWED) if (body[k] !== undefined) clean[k] = body[k];

  let up;
  try {
    up = await fetch(BASE + "/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(clean),
    });
  } catch (e) {
    return send(res, 502, { error: "could not reach Anthropic" });
  }

  res.statusCode = up.status;
  res.setHeader("content-type", up.headers.get("content-type") || "application/json");
  res.setHeader("cache-control", "no-store");
  if (!up.body) return res.end();
  for await (const chunk of up.body) res.write(chunk);
  res.end();
};
