// /api/claude.js — Node serverless. Richieste che producono JSON: schede, sostituzioni, progressione.
// Modello in base al "tier": fast (Haiku) per richieste leggere, quality (Sonnet) per le schede.
//   ANTHROPIC_API_KEY   (obbligatoria)
//   CLAUDE_MODEL        (opzionale, default schede: claude-sonnet-4-6)
//   CLAUDE_CHAT_MODEL   (opzionale, default fast: claude-haiku-4-5-20251001)

const WINDOW_MS = 60000;
const MAX_REQ = 40; // per IP a finestra (best-effort, anti-abuso leggero)
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.reset) { hits.set(ip, { count: 1, reset: now + WINDOW_MS }); return false; }
  e.count++;
  return e.count > MAX_REQ;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Metodo non consentito" }); return; }

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (rateLimited(ip)) { res.status(429).json({ error: "Troppe richieste in poco tempo. Attendi qualche secondo." }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) { res.status(500).json({ error: "ANTHROPIC_API_KEY non configurata su Vercel (Settings -> Environment Variables, poi rifai il deploy)." }); return; }

  let body = req.body;
  if (!body || typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch { body = {}; } }
  const { system, messages, max_tokens, tier } = body;
  if (!Array.isArray(messages) || messages.length === 0) { res.status(400).json({ error: "Richiesta non valida: messaggi mancanti." }); return; }

  const model = tier === "fast"
    ? (process.env.CLAUDE_CHAT_MODEL || "claude-haiku-4-5-20251001")
    : (process.env.CLAUDE_MODEL || "claude-sonnet-4-6");
  const cappedTokens = Math.min(Math.max(parseInt(max_tokens) || 1024, 256), 8000);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: cappedTokens, system, messages }),
    });
    const data = await upstream.json();
    if (!upstream.ok) { res.status(upstream.status).json({ error: data?.error?.message || `Errore API (${upstream.status})` }); return; }
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: "Impossibile contattare il modello: " + (e?.message || "errore di rete") });
  }
}
