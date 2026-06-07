# ATLAS — Coach AI

Web app con AI integrata per preparatori fisici e personal trainer.
Due modalità: **Coach** (domande tecnico-scientifiche) e **Scheda** (generatore di
allenamenti modificabili, con libreria, statistiche e progressione su 4 settimane).

Stack: React + Vite · Serverless Function su Vercel (proxy AI) · Claude API · Supabase (login + sync).

---

## Due chiavi, due ruoli (importante)

- **`ANTHROPIC_API_KEY`** — privata, sta SOLO sul server (Vercel). Il browser non la
  vede mai: chiama `/api/claude`, che aggiunge la chiave e inoltra a Claude.
- **`VITE_SUPABASE_ANON_KEY`** — pubblica per progettazione: sta nel frontend. La
  sicurezza è garantita dalle policy RLS del database, non dal nasconderla.

Supabase è **opzionale**: se non lo configuri, l'app funziona lo stesso salvando le
schede nel browser (localStorage). Configurandolo, il trainer accede e ritrova le sue
schede su ogni dispositivo.

---

## 1. Database Supabase (per login + sincronizzazione)

1. Crea un progetto su https://supabase.com
2. **SQL Editor → New query** → incolla il contenuto di `supabase/schema.sql` → **Run**
3. **Authentication → Providers**: assicurati che **Email** sia attivo
   (per test rapidi puoi disattivare "Confirm email" in Authentication → Settings)
4. **Project Settings → API**: copia *Project URL* e *anon public key*

(Salta questo passo se per ora vuoi solo il salvataggio locale.)

## 2. GitHub

```bash
git init
git add .
git commit -m "ATLAS Coach AI"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/atlas-coach.git
git push -u origin main
```

## 3. Vercel

1. https://vercel.com → **Add New… → Project** → seleziona il repo (rileva Vite da solo)
2. **Settings → Environment Variables**:

| Nome | Valore | Dove |
|------|--------|------|
| `ANTHROPIC_API_KEY` | la tua chiave (console.anthropic.com) | server |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` *(opzionale, schede)* | server |
| `CLAUDE_CHAT_MODEL` | `claude-haiku-4-5-20251001` *(opzionale, chat)* | server |
| `VITE_SUPABASE_URL` | Project URL di Supabase *(opzionale)* | frontend |
| `VITE_SUPABASE_ANON_KEY` | anon public key *(opzionale)* | frontend |

3. **Deploy**. Avrai l'URL pubblico. Ogni `git push` su `main` ripubblica da solo.

> Le chiavi le inserisci tu nel pannello Vercel: mai nel codice, mai su GitHub.

---

## Sviluppo locale

Con AI funzionante serve `vercel dev` (avvia anche le funzioni in `/api`):

```bash
npm install
cp .env.example .env      # inserisci le tue chiavi in .env
npx vercel dev
```

Solo frontend, senza AI: `npm run dev`.

---

## Note

- **Installabile (PWA)**: su Android/Chrome compare "Aggiungi a schermata Home"; su iPhone usa
  Safari → Condividi → "Aggiungi a Home". Il service worker è *network-first*: online prende
  sempre l'ultima versione (niente build vecchia in cache), offline fa da fallback.
- **Chat in streaming**: il Coach risponde in tempo reale tramite l'endpoint Edge `/api/chat`,
  con dettatura vocale e lettura ad alta voce (Web Speech API del browser, dove supportata).
- **Costi**: la chat usa il modello veloce (Haiku), le schede il modello di qualità (Sonnet);
  c'è un tetto ai token e un rate-limit leggero anti-abuso (40 richieste/min per IP, best-effort).
  Per un limite robusto in produzione si può collegare Upstash/Vercel KV.
- Senza login le schede stanno nel localStorage del browser; con login sono nel cloud (RLS).
- Se l'AI smette di rispondere dopo qualche mese è quasi sempre il modello deprecato:
  aggiorna `CLAUDE_MODEL` / `CLAUDE_CHAT_MODEL` su Vercel e rifai il deploy. Stringhe correnti su
  https://docs.claude.com/en/docs/about-claude/models/overview
