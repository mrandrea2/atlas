// Serverless function (Vercel) — proxy verso l'API Claude.
// La chiave API NON sta mai nel frontend: vive solo qui, come variabile d'ambiente.
// Imposta su Vercel:  ANTHROPIC_API_KEY  (obbligatoria)
//                     CLAUDE_MODEL       (opzionale, default: claude-sonnet-4-6)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo non consentito" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY non configurata su Vercel" });
    return;
  }

  const model = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
  const { system, messages, max_tokens } = req.body || {};

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: max_tokens || 1024,
        system,
        messages,
      }),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Errore nella chiamata al modello" });
  }
}
