// /api/chat.js — Edge function: chat del Coach in STREAMING (token-per-token).
// Usa il modello "fast" (Haiku) per costi bassi e bassa latenza.
export const config = { runtime: "edge" };

const WINDOW_MS = 60000;
const MAX_REQ = 40;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.reset) { hits.set(ip, { count: 1, reset: now + WINDOW_MS }); return false; }
  e.count++;
  return e.count > MAX_REQ;
}

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Metodo non consentito", { status: 405 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "anon";
  if (rateLimited(ip)) return new Response("Troppe richieste in poco tempo. Attendi qualche secondo.", { status: 429 });

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return new Response("ANTHROPIC_API_KEY non configurata su Vercel.", { status: 500 });

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const { system, messages, max_tokens } = body;
  if (!Array.isArray(messages) || messages.length === 0) return new Response("Messaggi mancanti.", { status: 400 });

  const model = process.env.CLAUDE_CHAT_MODEL || "claude-haiku-4-5-20251001";
  const cappedTokens = Math.min(Math.max(parseInt(max_tokens) || 1024, 256), 2048);

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: cappedTokens, system, messages, stream: true }),
  });

  if (!upstream.ok || !upstream.body) {
    const t = await upstream.text().catch(() => "");
    let msg = `Errore API (${upstream.status})`;
    try { msg = JSON.parse(t)?.error?.message || msg; } catch {}
    return new Response(msg, { status: upstream.status || 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();
  let buf = "";
  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n");
      buf = parts.pop();
      for (const line of parts) {
        const l = line.trim();
        if (!l.startsWith("data:")) continue;
        const d = l.slice(5).trim();
        if (!d || d === "[DONE]") continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
            controller.enqueue(encoder.encode(ev.delta.text));
          }
        } catch {}
      }
    },
    cancel() { try { reader.cancel(); } catch {} },
  });

  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
