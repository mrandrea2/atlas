// Serverless function (Vercel) — proxy verso l'API Claude.
// La chiave API NON sta mai nel frontend: vive solo qui come variabile d'ambiente.
//   ANTHROPIC_API_KEY  (obbligatoria)
//   CLAUDE_MODEL       (opzionale, default: claude-sonnet-4-6)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo non consentito" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY non configurata su Vercel (Settings -> Environment Variables, poi rifai il deploy)." });
    return;
  }

  // Body robusto: a volte arriva come stringa non ancora parsata.
  let body = req.body;
  if (!body || typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } catch { body = {}; }
  }
  const { system, messages, max_tokens } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Richiesta non valida: messaggi mancanti." });
    return;
  }

  const model = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: max_tokens || 1024, system, messages }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      const detail = data?.error?.message || `Errore API (${upstream.status})`;
      res.status(upstream.status).json({ error: detail });
      return;
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: "Impossibile contattare il modello: " + (e?.message || "errore di rete") });
  }
}
