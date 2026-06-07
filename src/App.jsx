import React, { useState, useRef, useEffect } from "react";
import { Dumbbell, MessageSquareText, Send, Sparkles, RotateCw, Copy, Check, Plus, Shuffle, X, Bookmark, FolderOpen, Download, Trash2, TrendingUp, ArrowLeft, User, LogOut, Cloud, CalendarCheck, FileText, Mic, Volume2 } from "lucide-react";
import { supabase, supabaseEnabled } from "./supabase";
import { jsPDF } from "jspdf";

// ---- stile (font + palette "chalk & iron": charcoal caldo + accento ember) ----
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

:root{
  --bg:#15120E; --surface:#1E1A14; --surface2:#272118; --text:#F3EEE4;
  --muted:#9C9387; --accent:#FF5A1F; --accent-soft:rgba(255,90,31,.13);
  --border:rgba(243,238,228,.09);
}
*{box-sizing:border-box}
.atlas{font-family:'Hanken Grotesk',sans-serif;background:var(--bg);color:var(--text);
  min-height:100vh;display:flex;flex-direction:column;letter-spacing:-.01em;
  background-image:radial-gradient(120% 80% at 50% -10%,rgba(255,90,31,.07),transparent 60%);}
.disp{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-.03em}

.top{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;
  border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(21,18,14,.85);backdrop-filter:blur(10px);z-index:5}
.brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:19px}
.brand .mark{width:30px;height:30px;border-radius:9px;background:var(--accent);
  display:grid;place-items:center;color:#15120E;box-shadow:0 4px 14px rgba(255,90,31,.4)}
.tabs{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);padding:4px;border-radius:13px}
.tab{display:flex;align-items:center;gap:7px;padding:8px 13px;border-radius:9px;font-weight:600;font-size:13.5px;
  background:transparent;color:var(--muted);border:0;cursor:pointer;transition:.18s}
.tab.on{background:var(--accent);color:#15120E}
.tab:not(.on):hover{color:var(--text)}

.wrap{flex:1;display:flex;flex-direction:column;max-width:780px;width:100%;margin:0 auto;padding:0 16px}

/* chat */
.scroll{flex:1;overflow-y:auto;padding:22px 2px 8px}
.hero{text-align:center;margin:42px 0 30px}
.hero h1{font-size:30px;font-weight:800;margin:0 0 8px}
.hero p{color:var(--muted);font-size:15px;max-width:430px;margin:0 auto;line-height:1.5}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:22px}
.credit{text-align:center;margin-top:28px;font-size:12px;color:var(--muted);letter-spacing:.01em}
.credit a{color:var(--muted);text-decoration:none;border-bottom:1px solid var(--border);padding-bottom:1px;transition:.15s;font-weight:600}
.credit a:hover{color:var(--accent);border-color:var(--accent)}
.brand .bwrap{display:flex;flex-direction:column;line-height:1.04}
.brand .bsub{font-size:9px;font-weight:700;color:var(--muted);letter-spacing:.07em;text-transform:uppercase;margin-top:1px}
.bookcta{display:inline-flex;align-items:center;gap:7px;margin-top:13px;background:transparent;border:1px solid var(--accent);color:var(--accent);border-radius:11px;padding:9px 16px;font-size:13px;font-weight:700;text-decoration:none;transition:.15s}
.bookcta:hover{background:var(--accent);color:#15120E}
.chip{background:var(--surface);border:1px solid var(--border);color:var(--text);padding:9px 13px;
  border-radius:11px;font-size:13px;cursor:pointer;transition:.15s;font-weight:500}
.chip:hover{border-color:var(--accent);color:var(--accent)}
.msg{display:flex;gap:11px;margin:18px 0;animation:rise .35s ease}
.msg.me{flex-direction:row-reverse}
.av{width:30px;height:30px;border-radius:9px;flex:none;display:grid;place-items:center;font-size:14px}
.av.ai{background:var(--accent-soft);color:var(--accent)}
.av.me{background:var(--surface2);color:var(--muted)}
.bubble{padding:12px 15px;border-radius:14px;font-size:15px;line-height:1.55;max-width:80%;white-space:pre-wrap}
.bubble.ai{background:var(--surface);border:1px solid var(--border);border-top-left-radius:5px}
.bubble.me{background:var(--accent);color:#15120E;border-top-right-radius:5px;font-weight:500}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.dots span{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--muted);margin:0 2px;animation:blink 1.2s infinite}
.dots span:nth-child(2){animation-delay:.2s}.dots span:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,100%{opacity:.25}50%{opacity:1}}

/* input bar */
.bar{position:sticky;bottom:0;padding:12px 0 18px;background:linear-gradient(transparent,var(--bg) 28%)}
.field{display:flex;align-items:flex-end;gap:8px;background:var(--surface);border:1px solid var(--border);
  border-radius:16px;padding:8px 8px 8px 16px}
.field:focus-within{border-color:var(--accent)}
.field textarea{flex:1;background:transparent;border:0;color:var(--text);font-family:inherit;font-size:15px;
  resize:none;outline:none;max-height:130px;padding:8px 0;line-height:1.4}
.send{width:40px;height:40px;border-radius:12px;border:0;background:var(--accent);color:#15120E;
  display:grid;place-items:center;cursor:pointer;flex:none;transition:.15s}
.send:disabled{opacity:.4;cursor:default}
.hint{text-align:center;color:var(--muted);font-size:11px;margin-top:9px}
.mic{width:40px;height:40px;border-radius:12px;border:1px solid var(--border);background:var(--surface2);color:var(--muted);display:grid;place-items:center;cursor:pointer;flex:none;transition:.15s}
.mic:hover{color:var(--accent);border-color:var(--accent)}
.mic.on{background:var(--accent);color:#15120E;border-color:var(--accent);animation:pulse 1.2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,90,31,.5)}50%{box-shadow:0 0 0 7px rgba(255,90,31,0)}}
.bubble.ai{white-space:normal}
.speak{display:inline-flex;align-items:center;gap:5px;margin-top:9px;background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:8px;padding:5px 9px;cursor:pointer;font-family:inherit}
.speak:hover{color:var(--accent);border-color:var(--accent)}
.mdp{margin:0 0 8px;line-height:1.55}
.mdp:last-of-type{margin-bottom:0}
.mdul,.mdol{margin:4px 0 8px;padding-left:20px;line-height:1.5}
.mdul li,.mdol li{margin:3px 0}
.mdcode{background:var(--surface2);border-radius:5px;padding:1px 5px;font-size:.9em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}

/* form scheda */
.form{padding:24px 2px 30px}
.form h2{font-size:23px;font-weight:800;margin:0 0 4px}
.form .sub{color:var(--muted);font-size:14px;margin:0 0 24px}
.lab{font-size:13px;font-weight:600;color:var(--muted);margin:0 0 8px;display:block}
.grp{margin-bottom:20px}
.opts{display:flex;flex-wrap:wrap;gap:8px}
.opt{padding:10px 14px;border-radius:11px;border:1px solid var(--border);background:var(--surface);
  color:var(--text);font-size:13.5px;font-weight:500;cursor:pointer;transition:.15s}
.opt.on{background:var(--accent);color:#15120E;border-color:var(--accent)}
.step{display:flex;align-items:center;gap:14px}
.step button{width:42px;height:42px;border-radius:12px;border:1px solid var(--border);background:var(--surface);
  color:var(--text);font-size:20px;cursor:pointer}
.step .n{font-size:22px;font-weight:800;min-width:28px;text-align:center}
.ta{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:13px;color:var(--text);
  font-family:inherit;font-size:14.5px;padding:13px;resize:vertical;min-height:74px;outline:none}
.ta:focus{border-color:var(--accent)}
.txin{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:13px;color:var(--text);font-family:inherit;font-size:14.5px;padding:13px;outline:none}
.txin:focus{border-color:var(--accent)}
.cta{width:100%;padding:15px;border-radius:14px;border:0;background:var(--accent);color:#15120E;
  font-family:'Bricolage Grotesque';font-weight:700;font-size:16px;cursor:pointer;display:flex;
  align-items:center;justify-content:center;gap:9px;transition:.15s}
.cta:disabled{opacity:.5;cursor:default}

/* piano */
.plan{padding:20px 2px 30px;animation:rise .4s ease}
.plan .ph{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px}
.plan h2{font-size:24px;font-weight:800;margin:0}
.plan .over{color:var(--muted);font-size:14.5px;line-height:1.5;margin:0 0 22px}
.iconbtn{background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:10px;
  padding:9px;cursor:pointer;display:grid;place-items:center;flex:none}
.day{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px;margin-bottom:14px}
.day .dh{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:14px}
.day .dn{font-family:'Bricolage Grotesque';font-weight:700;font-size:17px}
.day .focus{font-size:12px;color:var(--accent);font-weight:600;background:var(--accent-soft);
  padding:4px 9px;border-radius:7px;white-space:nowrap}
.ex{display:grid;grid-template-columns:1fr auto;gap:6px 12px;padding:11px 0;border-top:1px solid var(--border)}
.ex .en{font-weight:600;font-size:14.5px}
.ex .sets{font-size:13px;color:var(--accent);font-weight:600;white-space:nowrap}
.ex .det{grid-column:1/-1;font-size:12.5px;color:var(--muted);line-height:1.45}
.finalnote{background:var(--surface2);border-radius:14px;padding:15px;font-size:13.5px;color:var(--text);
  line-height:1.55;margin-top:4px}
.finalnote b{color:var(--accent)}
.tweak{display:flex;gap:8px;margin-top:18px}
.tweak input{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:12px;color:var(--text);
  font-family:inherit;font-size:14px;padding:12px 14px;outline:none}
.tweak input:focus{border-color:var(--accent)}
.err{background:rgba(255,90,31,.1);border:1px solid var(--accent);color:var(--text);padding:12px 14px;
  border-radius:12px;font-size:13.5px;margin:10px 0}
.skel{height:120px;border-radius:16px;background:linear-gradient(90deg,var(--surface),var(--surface2),var(--surface));
  background-size:200% 100%;animation:sh 1.3s infinite;margin-bottom:14px}
@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* campi modificabili */
.ed{background:transparent;border:1px solid transparent;border-radius:7px;color:var(--text);font-family:inherit;outline:none;padding:3px 6px;transition:.15s}
.ed:hover{border-color:var(--border)}
.ed:focus{border-color:var(--accent);background:var(--bg)}
.ed.dn{font-family:'Bricolage Grotesque';font-weight:700;font-size:17px;flex:1;min-width:0}
.ed.focus{font-size:12px;color:var(--accent);font-weight:600;text-align:right;max-width:44%}
.warm{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted);margin-bottom:8px}
.warm .warmin{flex:1;font-size:13px;color:var(--muted)}
.ex2{padding:13px 0;border-top:1px solid var(--border)}
.exrow{display:flex;align-items:center;gap:4px}
.ed.en{font-weight:600;font-size:14.5px;flex:1;min-width:0}
.mini{width:30px;height:30px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--muted);display:grid;place-items:center;cursor:pointer;flex:none}
.mini:hover{color:var(--accent);border-color:var(--accent)}
.mini:disabled{opacity:.5;cursor:default}
.params{display:flex;gap:8px;margin:7px 0 2px;flex-wrap:wrap}
.params .p{display:flex;flex-direction:column;align-items:center}
.params .pin{width:64px;text-align:center;font-size:13.5px;font-weight:600;color:var(--accent);background:var(--surface2)}
.params label{font-size:9.5px;color:var(--muted);margin-top:3px;text-transform:uppercase;letter-spacing:.05em}
.notein{width:100%;font-size:12.5px;color:var(--muted);margin-top:6px}
.addex{display:flex;align-items:center;gap:6px;background:transparent;border:1px dashed var(--border);color:var(--muted);border-radius:10px;padding:9px;width:100%;justify-content:center;cursor:pointer;font-family:inherit;font-size:13px;margin-top:10px;font-weight:500}
.addex:hover{color:var(--accent);border-color:var(--accent)}
.spin{display:inline-flex;animation:rot 1s linear infinite}
@keyframes rot{to{transform:rotate(360deg)}}

/* libreria + extra funzioni */
.libbtn{display:inline-flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:11px;padding:9px 13px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:18px;font-family:inherit}
.libbtn:hover{border-color:var(--accent);color:var(--accent)}
.daystat{display:flex;gap:16px;font-size:11.5px;color:var(--muted);margin:0 0 12px 2px;font-weight:600;letter-spacing:.02em}
.daystat b{color:var(--accent)}
.barbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
.gbtn{display:flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:12px;padding:12px 14px;font-size:13.5px;font-weight:600;cursor:pointer;flex:1;justify-content:center;font-family:inherit}
.gbtn:hover{border-color:var(--accent);color:var(--accent)}
.gbtn:disabled{opacity:.5;cursor:default}
.prog{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-top:14px;font-size:13.5px;line-height:1.65;white-space:pre-wrap;animation:rise .35s ease}
.prog .pgh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-family:'Bricolage Grotesque';font-weight:700;font-size:15px;color:var(--accent)}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--accent);color:#15120E;padding:11px 18px;border-radius:12px;font-weight:700;font-size:13.5px;z-index:30;box-shadow:0 8px 24px rgba(0,0,0,.45);animation:rise .3s ease}
.libwrap{padding:22px 2px 30px;animation:rise .35s ease}
.libtop{display:flex;align-items:center;gap:12px;margin-bottom:22px}
.libtop h2{font-size:22px;font-weight:800;margin:0;font-family:'Bricolage Grotesque'}
.libcard{display:flex;align-items:center;gap:11px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 15px;margin-bottom:11px;cursor:pointer;transition:.15s}
.libcard:hover{border-color:var(--accent)}
.libcard .ci{flex:1;min-width:0}
.libcard .cn{font-weight:700;font-size:15px;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.libcard .cm{font-size:12px;color:var(--muted)}
.libcard .ctag{font-size:11px;color:var(--accent);font-weight:600;background:var(--accent-soft);padding:4px 8px;border-radius:6px;white-space:nowrap}
.libempty{text-align:center;color:var(--muted);padding:54px 20px;font-size:14px;line-height:1.6}
.dialog{position:fixed;inset:0;background:rgba(0,0,0,.55);display:grid;place-items:center;z-index:40;padding:20px}
.dcard{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:22px;width:100%;max-width:380px;animation:rise .25s ease}
.dcard h3{font-family:'Bricolage Grotesque';font-weight:700;font-size:18px;margin:0 0 16px}
.dcard input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:11px;color:var(--text);font-family:inherit;font-size:14.5px;padding:12px;outline:none;margin-bottom:11px}
.dcard input:focus{border-color:var(--accent)}
.drow{display:flex;gap:8px;margin-top:6px}
.dghost{flex:1;background:transparent;border:1px solid var(--border);color:var(--text);border-radius:11px;padding:12px;font-family:inherit;font-weight:600;cursor:pointer}
.dok{flex:1;background:var(--accent);color:#15120E;border:0;border-radius:11px;padding:12px;font-family:inherit;font-weight:700;cursor:pointer}
.chatclear{text-align:right;padding:2px 2px 0}
.chatclear button{background:transparent;border:0;color:var(--muted);font-size:12px;cursor:pointer;font-family:inherit;font-weight:600}
.chatclear button:hover{color:var(--accent)}

/* account / cloud */
.acct{display:flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:11px;padding:8px 11px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;max-width:170px}
.acct:hover{border-color:var(--accent)}
.acct .em{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:96px;color:var(--muted)}
.cloudtag{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--accent);background:var(--accent-soft);padding:4px 9px;border-radius:7px;margin-bottom:14px}
.authswitch{text-align:center;margin-top:14px;font-size:13px;color:var(--muted)}
.authswitch button{background:none;border:0;color:var(--accent);font-weight:700;cursor:pointer;font-family:inherit;font-size:13px}
.authmsg{font-size:12.5px;color:var(--muted);background:var(--surface2);border-radius:10px;padding:10px 12px;margin-bottom:12px;line-height:1.45}

/* ===== Ottimizzazione smartphone: testi più grandi e tocchi più comodi ===== */
@media (max-width:600px){
  .atlas{font-size:16px}
  .top{padding:14px 15px}
  .brand{font-size:18px}
  .brand .mark{width:32px;height:32px}
  .tabs{padding:4px}
  .tab{font-size:13.5px;padding:10px 12px}
  .acct{padding:10px;max-width:none}
  .acct .em{display:none}            /* su mobile solo icona, niente email lunga */
  .hero{margin:30px 0 26px}
  .hero h1{font-size:28px}
  .hero p{font-size:16px;line-height:1.55}
  .chip{font-size:15px;padding:12px 15px}
  .bubble{font-size:16.5px;line-height:1.6;max-width:86%}
  .av{width:34px;height:34px}
  .field{padding:9px 9px 9px 16px}
  .field textarea{font-size:16px}    /* >=16px evita lo zoom su iOS al focus */
  .send{width:46px;height:46px}
  .hint{font-size:12px}
  .form h2,.plan h2,.libtop h2{font-size:25px}
  .form .sub{font-size:15.5px}
  .lab{font-size:14px}
  .opt{font-size:15.5px;padding:12px 16px}
  .ta{font-size:16px;min-height:84px}
  .txin{font-size:16px;padding:14px}
  .step button{width:48px;height:48px;font-size:22px}
  .step .n{font-size:26px}
  .cta{font-size:17px;padding:17px}
  .libbtn{font-size:14.5px;padding:11px 14px}
  .over{font-size:15.5px}
  .day{padding:18px 16px}
  .ed{font-size:16px;padding:5px 7px}
  .ed.dn{font-size:18px}
  .ed.en{font-size:16.5px}
  .ed.focus{font-size:13px;max-width:46%}
  .daystat{font-size:13.5px;gap:18px}
  .warm,.warm .warmin{font-size:14.5px}
  .params{gap:10px}
  .params .pin{font-size:16px;width:70px}
  .params label{font-size:11px}
  .notein{font-size:14.5px}
  .mini{width:38px;height:38px}      /* tap target generosi */
  .iconbtn{padding:12px}
  .finalnote{font-size:15px;line-height:1.6}
  .gbtn{font-size:14.5px;padding:15px}
  .prog{font-size:15px;line-height:1.7}
  .tweak input{font-size:16px;padding:14px}
  .libcard{padding:16px}
  .libcard .cn{font-size:16.5px}
  .libcard .cm{font-size:13px}
  .libcard .ctag{font-size:12px}
  .dcard h3{font-size:20px}
  .dcard input{font-size:16px;padding:14px}
  .dghost,.dok{padding:14px;font-size:15px}
  .authmsg{font-size:13.5px}
  .cloudtag{font-size:12.5px}
  .credit{font-size:13px;margin-top:30px}
}
`;

// Le chiamate passano per /api/claude (serverless function di Vercel),
// così la chiave API resta sul server e non è mai esposta nel browser.
async function callClaude({ system, messages, max_tokens = 1024, tier = "quality" }) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, max_tokens, tier }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error || `Errore ${res.status}`);
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

// Chat in streaming: chiama l'endpoint Edge e riceve il testo a pezzi.
async function callClaudeStream({ system, messages, max_tokens = 1024, onText }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, max_tokens }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `Errore ${res.status}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += dec.decode(value, { stream: true });
    onText(full);
  }
  return full;
}

// --- Markdown leggero e sicuro (grassetto, corsivo, code, elenchi) ---
function mdInline(s) {
  const out = []; let rest = String(s); let k = 0;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/;
  let m;
  while ((m = rest.match(re))) {
    if (m.index > 0) out.push(rest.slice(0, m.index));
    if (m[2] !== undefined) out.push(<strong key={k++}>{m[2]}</strong>);
    else if (m[3] !== undefined) out.push(<em key={k++}>{m[3]}</em>);
    else if (m[4] !== undefined) out.push(<code key={k++} className="mdcode">{m[4]}</code>);
    rest = rest.slice(m.index + m[0].length);
  }
  if (rest) out.push(rest);
  return out;
}
function MD({ text }) {
  const lines = String(text).split("\n");
  const blocks = []; let list = null;
  const flush = () => { if (list) { blocks.push(list); list = null; } };
  lines.forEach((ln) => {
    const t = ln.trim();
    const ul = t.match(/^[-*]\s+(.*)/);
    const ol = t.match(/^\d+[.)]\s+(.*)/);
    if (ul) { if (!list || list.type !== "ul") { flush(); list = { type: "ul", items: [] }; } list.items.push(ul[1]); }
    else if (ol) { if (!list || list.type !== "ol") { flush(); list = { type: "ol", items: [] }; } list.items.push(ol[1]); }
    else { flush(); if (t) blocks.push({ type: "p", text: ln }); }
  });
  flush();
  return (
    <>
      {blocks.map((b, i) =>
        b.type === "ul" ? <ul key={i} className="mdul">{b.items.map((it, j) => <li key={j}>{mdInline(it)}</li>)}</ul>
        : b.type === "ol" ? <ol key={i} className="mdol">{b.items.map((it, j) => <li key={j}>{mdInline(it)}</li>)}</ol>
        : <p key={i} className="mdp">{mdInline(b.text)}</p>
      )}
    </>
  );
}

function speak(t) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(t).replace(/[*`#]/g, ""));
    u.lang = "it-IT";
    window.speechSynthesis.speak(u);
  } catch {}
}

function extractJSON(text) {
  const t = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("parse");
  return JSON.parse(t.slice(s, e + 1));
}

function planToText(plan) {
  let t = `${plan.titolo}\n${plan.panoramica}\n\n`;
  plan.giorni?.forEach((d) => {
    t += `${d.nome} — ${d.focus}\n`;
    if (d.riscaldamento) t += `Riscaldamento: ${d.riscaldamento}\n`;
    d.esercizi?.forEach((e) => { t += `• ${e.nome}: ${e.serie}x${e.ripetizioni}, rec ${e.recupero}${e.intensita ? " (" + e.intensita + ")" : ""}${e.note ? " — " + e.note : ""}\n`; });
    t += "\n";
  });
  if (plan.note) t += `Note: ${plan.note}`;
  return t;
}

function daySets(d) { return (d.esercizi || []).reduce((s, e) => s + (parseInt(e.serie) || 0), 0); }
function dayMinutes(d) {
  let sec = 300; // riscaldamento
  (d.esercizi || []).forEach((e) => {
    const sets = parseInt(e.serie) || 0;
    let rest = 60;
    const r = String(e.recupero || "").toLowerCase().replace(",", ".");
    const n = parseFloat(r);
    if (!isNaN(n)) rest = /min/.test(r) ? n * 60 : n;
    sec += sets * (40 + rest);
  });
  return Math.round(sec / 60);
}

function genPdf(plan, client) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 16, CW = W - M * 2;
  const accent = [255, 90, 31], dark = [26, 23, 18], muted = [122, 112, 102], light = [246, 243, 237], border = [226, 221, 213];
  let y = 0;

  function footer() {
    doc.setDrawColor(...border); doc.setLineWidth(0.2); doc.line(M, H - 14, W - M, H - 14);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...muted);
    doc.text("andrea-bertelli.vercel.app   ·   calendly.com/humanperformancelab-app/30min", M, H - 9);
    doc.text("Pag. " + doc.internal.getCurrentPageInfo().pageNumber, W - M, H - 9, { align: "right" });
  }

  function header() {
    doc.setFillColor(...accent); doc.rect(0, 0, W, 5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...dark);
    doc.text("ATLAS", M, 16);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...muted);
    doc.text("HUMAN PERFORMANCE LAB", M, 20.5);
    doc.setFontSize(9); doc.text(new Date().toLocaleDateString("it-IT"), W - M, 16, { align: "right" });
    y = 30;
  }

  function ensure(space) { if (y + space > H - 18) { footer(); doc.addPage(); header(); } }

  header();

  // Titolo
  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...dark);
  const tl = doc.splitTextToSize(plan.titolo || "Scheda di allenamento", CW);
  doc.text(tl, M, y); y += tl.length * 7.5 + 1;

  if (client && client.trim()) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...accent);
    doc.text("Cliente: ", M, y);
    const lw = doc.getTextWidth("Cliente: ");
    doc.setFont("helvetica", "normal"); doc.setTextColor(...dark);
    doc.text(client.trim(), M + lw, y);
    y += 6;
  }

  // Panoramica
  if (plan.panoramica) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(...muted);
    const ol = doc.splitTextToSize(plan.panoramica, CW);
    doc.text(ol, M, y); y += ol.length * 5 + 3;
  }
  doc.setDrawColor(...accent); doc.setLineWidth(0.9); doc.line(M, y, M + 18, y); y += 7;

  (plan.giorni || []).forEach((d) => {
    ensure(20);
    // Intestazione giorno
    doc.setFillColor(...light); doc.roundedRect(M, y, CW, 9, 1.5, 1.5, "F");
    doc.setFillColor(...accent); doc.rect(M, y, 1.6, 9, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...dark);
    doc.text(d.nome || "Giorno", M + 5, y + 6);
    if (d.focus) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...accent);
      doc.text(String(d.focus).toUpperCase(), W - M - 3, y + 6, { align: "right" });
    }
    y += 12.5;

    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...muted);
    doc.text(daySets(d) + " serie  ·  ~" + dayMinutes(d) + " min", M, y); y += 4.5;

    if (d.riscaldamento) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(...muted);
      const wl = doc.splitTextToSize("Riscaldamento: " + d.riscaldamento, CW);
      ensure(wl.length * 4.5 + 2);
      doc.text(wl, M, y); y += wl.length * 4.5 + 1.5;
    }
    y += 1.5;

    (d.esercizi || []).forEach((e) => {
      doc.setFontSize(9);
      const meta = [e.intensita, e.note].filter(Boolean).join("  ·  ");
      const ml = meta ? doc.splitTextToSize(meta, CW) : [];
      ensure(6 + ml.length * 4 + 3);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...dark);
      doc.text(e.nome || "Esercizio", M, y);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...accent);
      const sr = (e.serie || "") + " × " + (e.ripetizioni || "") + (e.recupero ? "   ·   rec " + e.recupero : "");
      doc.text(sr, W - M, y, { align: "right" });
      y += 4.6;
      if (meta) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...muted);
        doc.text(ml, M, y); y += ml.length * 4;
      }
      y += 1.6;
      doc.setDrawColor(...border); doc.setLineWidth(0.15); doc.line(M, y, W - M, y); y += 3.2;
    });
    y += 4;
  });

  // Note finali
  if (plan.note) {
    doc.setFontSize(9.5);
    const nl = doc.splitTextToSize(plan.note, CW - 10);
    const boxH = nl.length * 4.6 + 10;
    ensure(boxH + 2);
    doc.setFillColor(...light); doc.roundedRect(M, y, CW, boxH, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...accent);
    doc.text("NOTE", M + 5, y + 6.5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...dark);
    doc.text(nl, M + 5, y + 12); y += boxH + 4;
  }

  footer();
  doc.save((plan.titolo || "scheda").replace(/[^\w]+/g, "_") + ".pdf");
}

const CHAT_SYSTEM =
  "Sei Atlas, l'assistente AI di un preparatore atletico / personal trainer professionista. " +
  "Rispondi in italiano, con tono diretto e collegiale (parli a un collega esperto, non a un cliente). " +
  "Sei basato sull'evidenza: cita principi di fisiologia dell'esercizio, biomeccanica e scienze dell'allenamento quando utile, " +
  "e segnala quando un dato è incerto o controverso. Sii conciso e pratico: vai al punto, usa elenchi brevi quando aiutano. " +
  "Non sei un medico: per patologie, infortuni acuti o nutrizione clinica, ricorda di indirizzare a un professionista sanitario.";

const SUGGESTIONS = [
  "Differenza pratica tra RIR e RPE nel monitorare il carico?",
  "Come gestire un cliente con lombalgia non specifica?",
  "Quanto volume settimanale per ipertrofia di un intermedio?",
  "Periodizzazione lineare vs ondulata: quando scegliere?",
];

const GOALS = ["Ipertrofia", "Forza", "Dimagrimento", "Resistenza", "Generale"];
const LEVELS = ["Principiante", "Intermedio", "Avanzato"];
const EQUIP = ["Palestra completa", "Home gym", "Corpo libero"];

function Footer() {
  return (
    <div className="credit">
      <div>Un progetto di <a href="https://andrea-bertelli.vercel.app" target="_blank" rel="noopener noreferrer">Andrea Bertelli · Human Performance Lab</a></div>
      <a className="bookcta" href="https://calendly.com/humanperformancelab-app/30min" target="_blank" rel="noopener noreferrer"><CalendarCheck size={15} /> Prenota una consulenza</a>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("chat");
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() { await supabase.auth.signOut(); }

  return (
    <div className="atlas">
      <style>{CSS}</style>
      <header className="top">
        <div className="brand">
          <span className="mark"><Dumbbell size={17} strokeWidth={2.5} /></span>
          <span className="bwrap"><span className="disp">ATLAS</span><span className="bsub">Human Performance Lab</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <nav className="tabs">
            <button className={`tab ${tab === "chat" ? "on" : ""}`} onClick={() => setTab("chat")}>
              <MessageSquareText size={15} /> Coach
            </button>
            <button className={`tab ${tab === "scheda" ? "on" : ""}`} onClick={() => setTab("scheda")}>
              <Dumbbell size={15} /> Scheda
            </button>
          </nav>
          {supabaseEnabled && (
            user ? (
              <button className="acct" onClick={logout} title="Esci">
                <span className="em">{user.email}</span><LogOut size={15} />
              </button>
            ) : (
              <button className="acct" onClick={() => setAuthOpen(true)}><User size={15} /> Accedi</button>
            )
          )}
        </div>
      </header>
      <main className="wrap">
        {tab === "chat" ? <Chat /> : <SchedaBuilder user={user} />}
      </main>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}

/* ---------------- AUTENTICAZIONE ---------------- */
function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    if (!email.trim() || !pw || busy) return;
    setBusy(true); setMsg("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password: pw });
        if (error) throw error;
        setMsg("Registrazione avviata. Se richiesto, conferma l'email e poi accedi.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) throw error;
        onClose();
      }
    } catch (e) {
      setMsg(e?.message || "Operazione non riuscita.");
    } finally { setBusy(false); }
  }

  return (
    <div className="dialog" onClick={onClose}>
      <div className="dcard" onClick={(e) => e.stopPropagation()}>
        <h3>{mode === "login" ? "Accedi" : "Crea un account"}</h3>
        <div className="authmsg">Accedi per sincronizzare le tue schede su tutti i dispositivi. Senza login restano salvate solo su questo browser.</div>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
        {msg && <div className="authmsg" style={{ color: "var(--text)" }}>{msg}</div>}
        <div className="drow">
          <button className="dghost" onClick={onClose}>Annulla</button>
          <button className="dok" onClick={submit} disabled={busy}>{busy ? "…" : (mode === "login" ? "Accedi" : "Registrati")}</button>
        </div>
        <div className="authswitch">
          {mode === "login" ? "Non hai un account? " : "Hai già un account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(""); }}>
            {mode === "login" ? "Registrati" : "Accedi"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COACH (chat tecnico) ---------------- */
function Chat() {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  const taRef = useRef(null);
  const recRef = useRef(null);
  const speechOK = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send(q) {
    const content = (q ?? text).trim();
    if (!content || busy) return;
    const next = [...msgs, { role: "user", content }];
    setMsgs([...next, { role: "assistant", content: "" }]); // segnaposto per lo streaming
    setText(""); setBusy(true);
    if (taRef.current) taRef.current.style.height = "auto";
    const update = (full) => setMsgs((m) => { const c = m.slice(); c[c.length - 1] = { role: "assistant", content: full }; return c; });
    try {
      await callClaudeStream({ system: CHAT_SYSTEM, messages: next, onText: update });
    } catch (e) {
      // Fallback senza streaming (se l'endpoint Edge non è disponibile)
      try {
        const reply = await callClaude({ system: CHAT_SYSTEM, messages: next, tier: "fast" });
        update(reply || "…");
      } catch (e2) {
        update("⚠️ " + (e2?.message || e?.message || "Connessione non riuscita. Riprova tra un attimo."));
      }
    } finally { setBusy(false); }
  }

  function toggleMic() {
    if (!speechOK) return;
    if (listening) { try { recRef.current?.stop(); } catch {} return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "it-IT"; rec.interimResults = true; rec.continuous = false;
    let base = text ? text + " " : "";
    rec.onresult = (e) => {
      let s = "";
      for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      setText((base + s).trimStart());
      if (taRef.current) { taRef.current.style.height = "auto"; taRef.current.style.height = taRef.current.scrollHeight + "px"; }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  }

  return (
    <>
      <div className="scroll">
        {msgs.length > 0 && (
          <div className="chatclear"><button onClick={() => { setMsgs([]); try { window.speechSynthesis?.cancel(); } catch {} }}>＋ Nuova conversazione</button></div>
        )}
        {msgs.length === 0 && (
          <div className="hero">
            <h1 className="disp">Ciao 👋 Sono Atlas.</h1>
            <p>Il tuo assistente tecnico. Chiedimi di programmazione, biomeccanica, gestione clienti o scienze dell'allenamento.</p>
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
            <Footer />
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "me" : ""}`}>
            <div className={`av ${m.role === "user" ? "me" : "ai"}`}>
              {m.role === "user" ? "Tu" : <Sparkles size={15} />}
            </div>
            <div className={`bubble ${m.role === "user" ? "me" : "ai"}`}>
              {m.role === "user" ? m.content
                : m.content === "" ? <span className="dots"><span></span><span></span><span></span></span>
                : (<><MD text={m.content} />{!busy && (
                    <button className="speak" title="Leggi ad alta voce" onClick={() => speak(m.content)}><Volume2 size={14} /></button>
                  )}</>)}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="bar">
        <div className="field">
          {speechOK && (
            <button className={`mic ${listening ? "on" : ""}`} onClick={toggleMic} title="Detta col microfono"><Mic size={18} /></button>
          )}
          <textarea
            ref={taRef} value={text} rows={1} placeholder={listening ? "Sto ascoltando…" : "Scrivi o detta una domanda…"}
            onChange={(e) => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button className="send" disabled={!text.trim() || busy} onClick={() => send()}><Send size={18} /></button>
        </div>
        <div className="hint">Atlas può sbagliare. Non sostituisce parere medico.</div>
      </div>
    </>
  );
}

/* ---------------- SCHEDA (generatore) ---------------- */
function SchedaBuilder({ user }) {
  const [goal, setGoal] = useState("Ipertrofia");
  const [level, setLevel] = useState("Intermedio");
  const [days, setDays] = useState(3);
  const [equip, setEquip] = useState("Palestra completa");
  const [notes, setNotes] = useState("");
  const [client, setClient] = useState("");
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [tweak, setTweak] = useState("");
  const [copied, setCopied] = useState(false);
  const [swap, setSwap] = useState(null); // {di,ei} in sostituzione
  const [saved, setSaved] = useState([]);
  const [showLib, setShowLib] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [sName, setSName] = useState("");
  const [sClient, setSClient] = useState("");
  const [toast, setToast] = useState("");
  const [prog, setProg] = useState(null);
  const [progBusy, setProgBusy] = useState(false);

  const cloud = supabaseEnabled && !!user;

  // Carica le schede: dal cloud se loggato, altrimenti da localStorage.
  useEffect(() => {
    (async () => {
      if (cloud) {
        try {
          const { data } = await supabase.from("user_data").select("schede").eq("user_id", user.id).maybeSingle();
          setSaved(data?.schede || []);
        } catch { setSaved([]); }
      } else {
        try { const r = localStorage.getItem("atlas:schede"); setSaved(r ? JSON.parse(r) : []); } catch { setSaved([]); }
      }
    })();
  }, [cloud, user]);

  async function persist(list) {
    setSaved(list);
    if (cloud) {
      try { await supabase.from("user_data").upsert({ user_id: user.id, schede: list, updated_at: new Date().toISOString() }); } catch {}
    } else {
      try { localStorage.setItem("atlas:schede", JSON.stringify(list)); } catch {}
    }
  }
  function flash(m) { setToast(m); setTimeout(() => setToast(""), 1800); }

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const editTop = (f, v) => setPlan((p) => ({ ...p, [f]: v }));
  const editDay = (di, f, v) => setPlan((p) => { const c = clone(p); c.giorni[di][f] = v; return c; });
  const editEx = (di, ei, f, v) => setPlan((p) => { const c = clone(p); c.giorni[di].esercizi[ei][f] = v; return c; });
  const addEx = (di) => setPlan((p) => { const c = clone(p); c.giorni[di].esercizi.push({ nome: "Nuovo esercizio", serie: "3", ripetizioni: "10", recupero: "90s", intensita: "", note: "" }); return c; });
  const removeEx = (di, ei) => setPlan((p) => { const c = clone(p); c.giorni[di].esercizi.splice(ei, 1); return c; });

  async function swapEx(di, ei) {
    if (swap) return;
    const day = plan.giorni[di], ex = day.esercizi[ei];
    setSwap({ di, ei }); setErr("");
    try {
      const sys = "Sei Atlas. Proponi UN solo esercizio alternativo, coerente con lo stesso pattern motorio o gruppo muscolare. " +
        'Rispondi solo con JSON valido, senza altro: {"nome":string,"serie":string,"ripetizioni":string,"recupero":string,"intensita":string,"note":string}. Italiano.';
      const prompt = `Obiettivo: ${goal}. Livello: ${level}. Attrezzatura: ${equip}. Focus del giorno: ${day.focus || day.nome}. ` +
        `Sostituisci "${ex.nome}" con un'alternativa DIVERSA che alleni lo stesso schema/muscolo.`;
      const raw = await callClaude({ system: sys, messages: [{ role: "user", content: prompt }], max_tokens: 600, tier: "fast" });
      const nx = extractJSON(raw);
      setPlan((p) => { const c = clone(p); c.giorni[di].esercizi[ei] = nx; return c; });
    } catch (e) {
      setErr(e?.message ? "Errore: " + e.message : "Sostituzione non riuscita, riprova.");
    } finally { setSwap(null); }
  }

  const PLAN_SYSTEM =
    "Sei Atlas, assistente di un personal trainer. Generi schede di allenamento professionali, sicure e basate sull'evidenza. " +
    "Rispondi ESCLUSIVAMENTE con un oggetto JSON valido, senza testo prima o dopo, senza markdown. Schema: " +
    '{"titolo":string,"panoramica":string (1-2 frasi),"giorni":[{"nome":string,"focus":string (breve),"riscaldamento":string (breve, mirato),' +
    '"esercizi":[{"nome":string,"serie":string,"ripetizioni":string,"recupero":string,"intensita":string (es. "RIR 2" o "@RPE 8"),"note":string (cue tecnico, breve)}]}],' +
    '"note":string (consigli su progressione/recupero)}. ' +
    "Italiano. Max 6 esercizi per giorno. Sii conciso per stare entro i limiti.";

  function buildPrompt(extra) {
    let base = `Crea una scheda. Obiettivo: ${goal}. Livello: ${level}. Giorni/settimana: ${days}. Attrezzatura: ${equip}.`;
    if (notes.trim()) base += ` Note del trainer: ${notes.trim()}.`;
    if (extra) base += ` Modifica richiesta sulla scheda attuale: ${extra}.`;
    return base;
  }

  async function generate(extra) {
    setBusy(true); setErr("");
    try {
      const msgs = [{ role: "user", content: buildPrompt(extra) }];
      if (extra && plan) {
        msgs.unshift({ role: "assistant", content: JSON.stringify(plan) });
        msgs.unshift({ role: "user", content: buildPrompt() });
      }
      const raw = await callClaude({ system: PLAN_SYSTEM, messages: msgs, max_tokens: 8000 });
      setPlan(extractJSON(raw));
      setTweak("");
    } catch (e) {
      const m = e?.message || "";
      setErr(m && m !== "parse" ? "Errore: " + m : "Non sono riuscito a leggere la scheda. Riprova o cambia i parametri.");
    } finally { setBusy(false); }
  }

  function copyPlan() {
    if (!plan) return;
    navigator.clipboard?.writeText(planToText(plan));
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  }

  function downloadPlan() {
    if (!plan) return;
    const blob = new Blob([planToText(plan)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${(plan.titolo || "scheda").replace(/[^\w]+/g, "_")}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  function confirmSave() {
    const item = { id: Date.now().toString(), nome: sName.trim() || plan.titolo, cliente: sClient.trim(), goal, level, days, equip, notes, plan, createdAt: new Date().toLocaleDateString("it-IT") };
    persist([item, ...saved]); setDialog(false); setSName(""); setSClient(""); flash("Scheda salvata ✓");
  }

  function openSaved(it) {
    setPlan(it.plan); setGoal(it.goal || goal); setLevel(it.level || level);
    setDays(it.days || days); setEquip(it.equip || equip); setNotes(it.notes || "");
    setClient(it.cliente || "");
    setProg(null); setErr(""); setShowLib(false);
  }

  function deleteSaved(id, ev) { ev.stopPropagation(); persist(saved.filter((s) => s.id !== id)); }

  async function genProg() {
    if (progBusy || !plan) return;
    setProgBusy(true); setErr("");
    try {
      const sys = "Sei Atlas. Data una scheda, scrivi una progressione di 4 settimane (mesociclo). " +
        "Per ogni settimana indica come variare volume / intensità / carico (es. serie, RIR/RPE, %), e includi una settimana di scarico se opportuno. " +
        "Testo semplice in italiano, conciso: 1-2 righe per settimana. Niente markdown pesante.";
      const tot = plan.giorni?.reduce((a, d) => a + (d.esercizi?.length || 0), 0);
      const prompt = `Obiettivo: ${goal}. Livello: ${level}. Giorni/sett: ${days}. Scheda: "${plan.titolo}", ${tot} esercizi totali.`;
      const raw = await callClaude({ system: sys, messages: [{ role: "user", content: prompt }], max_tokens: 900, tier: "fast" });
      setProg(raw.trim());
    } catch (e) { setErr(e?.message ? "Errore: " + e.message : "Progressione non riuscita, riprova."); }
    finally { setProgBusy(false); }
  }

  // libreria
  if (showLib) {
    return (
      <div className="libwrap">
        <div className="libtop">
          <button className="iconbtn" onClick={() => setShowLib(false)}><ArrowLeft size={18} /></button>
          <h2>Le mie schede</h2>
        </div>
        {cloud && <div className="cloudtag"><Cloud size={13} /> Sincronizzate nel cloud</div>}
        {saved.length === 0 ? (
          <div className="libempty">Nessuna scheda salvata.<br />Genera una scheda e tocca il segnalibro per salvarla.</div>
        ) : saved.map((it) => (
          <div className="libcard" key={it.id} onClick={() => openSaved(it)}>
            <div className="ci">
              <div className="cn">{it.nome}</div>
              <div className="cm">{it.cliente ? it.cliente + " · " : ""}{it.createdAt}</div>
            </div>
            <span className="ctag">{it.goal}</span>
            <button className="mini" onClick={(e) => deleteSaved(it.id, e)} title="Elimina"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    );
  }

  // form
  if (!plan && !busy) {
    return (
      <div className="form">
        {saved.length > 0 && (
          <button className="libbtn" onClick={() => setShowLib(true)}><FolderOpen size={15} /> Le mie schede ({saved.length})</button>
        )}
        <h2 className="disp">Genera una scheda</h2>
        <p className="sub">Imposta i parametri, Atlas costruisce un programma strutturato in pochi secondi.</p>

        <div className="grp">
          <label className="lab">Cliente (opzionale)</label>
          <input className="txin" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome del cliente" />
        </div>

        <div className="grp">
          <label className="lab">Obiettivo</label>
          <div className="opts">{GOALS.map((g) => <button key={g} className={`opt ${goal === g ? "on" : ""}`} onClick={() => setGoal(g)}>{g}</button>)}</div>
        </div>
        <div className="grp">
          <label className="lab">Livello</label>
          <div className="opts">{LEVELS.map((l) => <button key={l} className={`opt ${level === l ? "on" : ""}`} onClick={() => setLevel(l)}>{l}</button>)}</div>
        </div>
        <div className="grp">
          <label className="lab">Giorni a settimana</label>
          <div className="step">
            <button onClick={() => setDays((d) => Math.max(1, d - 1))}>−</button>
            <span className="n disp">{days}</span>
            <button onClick={() => setDays((d) => Math.min(6, d + 1))}>+</button>
          </div>
        </div>
        <div className="grp">
          <label className="lab">Attrezzatura</label>
          <div className="opts">{EQUIP.map((e) => <button key={e} className={`opt ${equip === e ? "on" : ""}`} onClick={() => setEquip(e)}>{e}</button>)}</div>
        </div>
        <div className="grp">
          <label className="lab">Note (infortuni, preferenze, durata sessione…)</label>
          <textarea className="ta" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Es. spalla destra delicata, sessioni max 60 min, preferisce esercizi base…" />
        </div>
        {err && <div className="err">{err}</div>}
        <button className="cta" onClick={() => generate()}><Sparkles size={18} /> Genera scheda</button>
        <Footer />
      </div>
    );
  }

  // loading
  if (busy && !plan) {
    return (
      <div className="plan">
        <div style={{ color: "var(--muted)", marginBottom: 18, fontWeight: 600 }}>Atlas sta costruendo la scheda…</div>
        <div className="skel" /><div className="skel" /><div className="skel" />
      </div>
    );
  }

  // piano generato
  return (
    <div className="plan">
      <div className="ph">
        <div>
          <h2 className="disp">{plan.titolo}</h2>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="iconbtn" onClick={() => { setSName(plan.titolo); setSClient(client); setDialog(true); }} title="Salva"><Bookmark size={17} /></button>
          <button className="iconbtn" onClick={copyPlan} title="Copia">{copied ? <Check size={17} color="var(--accent)" /> : <Copy size={17} />}</button>
          <button className="iconbtn" onClick={downloadPlan} title="Scarica .txt"><Download size={17} /></button>
          <button className="iconbtn" onClick={() => setShowLib(true)} title="Libreria"><FolderOpen size={17} /></button>
          <button className="iconbtn" onClick={() => { setPlan(null); setErr(""); setProg(null); }} title="Nuova scheda"><Plus size={17} /></button>
        </div>
      </div>
      <p className="over">{plan.panoramica}</p>

      {plan.giorni?.map((d, i) => (
        <div className="day" key={i}>
          <div className="dh">
            <input className="ed dn" value={d.nome} onChange={(e) => editDay(i, "nome", e.target.value)} />
            <input className="ed focus" value={d.focus || ""} placeholder="focus" onChange={(e) => editDay(i, "focus", e.target.value)} />
          </div>
          {("riscaldamento" in d) && (
            <div className="warm">🔥<input className="ed warmin" value={d.riscaldamento || ""} placeholder="Riscaldamento…" onChange={(e) => editDay(i, "riscaldamento", e.target.value)} /></div>
          )}
          <div className="daystat"><span><b>{daySets(d)}</b> serie totali</span><span>≈ <b>{dayMinutes(d)}</b> min</span></div>
          {d.esercizi?.map((e, j) => (
            <div className="ex2" key={j}>
              <div className="exrow">
                <input className="ed en" value={e.nome} onChange={(ev) => editEx(i, j, "nome", ev.target.value)} />
                <button className="mini" disabled={!!swap} onClick={() => swapEx(i, j)} title="Alternativa AI">
                  {swap && swap.di === i && swap.ei === j ? <span className="spin"><RotateCw size={14} /></span> : <Shuffle size={14} />}
                </button>
                <button className="mini" onClick={() => removeEx(i, j)} title="Rimuovi"><X size={14} /></button>
              </div>
              <div className="params">
                <span className="p"><input className="ed pin" value={e.serie} onChange={(ev) => editEx(i, j, "serie", ev.target.value)} /><label>serie</label></span>
                <span className="p"><input className="ed pin" value={e.ripetizioni} onChange={(ev) => editEx(i, j, "ripetizioni", ev.target.value)} /><label>rip</label></span>
                <span className="p"><input className="ed pin" value={e.recupero} onChange={(ev) => editEx(i, j, "recupero", ev.target.value)} /><label>rec</label></span>
                <span className="p"><input className="ed pin" value={e.intensita || ""} placeholder="—" onChange={(ev) => editEx(i, j, "intensita", ev.target.value)} /><label>intensità</label></span>
              </div>
              <input className="ed notein" value={e.note || ""} placeholder="Cue tecnico…" onChange={(ev) => editEx(i, j, "note", ev.target.value)} />
            </div>
          ))}
          <button className="addex" onClick={() => addEx(i)}><Plus size={14} /> Aggiungi esercizio</button>
        </div>
      ))}

      {plan.note && <div className="finalnote"><b>Note di Atlas — </b>{plan.note}</div>}

      <div className="barbtns">
        <button className="gbtn" onClick={() => { try { genPdf(plan, client); } catch (e) { setErr("PDF non riuscito: " + (e?.message || "")); } }}><FileText size={15} /> Scarica PDF</button>
        <button className="gbtn" disabled={progBusy} onClick={genProg}>
          {progBusy ? <span className="spin"><RotateCw size={15} /></span> : <TrendingUp size={15} />} Progressione 4 settimane
        </button>
      </div>
      {prog && (
        <div className="prog">
          <div className="pgh"><span>Mesociclo · 4 settimane</span><button className="mini" onClick={() => setProg(null)}><X size={14} /></button></div>
          {prog}
        </div>
      )}

      {err && <div className="err">{err}</div>}
      <div className="tweak">
        <input
          value={tweak} placeholder="Chiedi una modifica… es. «più cardio» o «sostituisci lo squat»"
          onChange={(e) => setTweak(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && tweak.trim() && !busy) generate(tweak.trim()); }}
        />
        <button className="iconbtn" disabled={busy || !tweak.trim()} onClick={() => tweak.trim() && generate(tweak.trim())} style={{ background: "var(--accent)", color: "#15120E" }}>
          {busy ? <span className="spin"><RotateCw size={17} /></span> : <RotateCw size={17} />}
        </button>
      </div>

      {dialog && (
        <div className="dialog" onClick={() => setDialog(false)}>
          <div className="dcard" onClick={(e) => e.stopPropagation()}>
            <h3>Salva scheda</h3>
            <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Nome scheda" />
            <input value={sClient} onChange={(e) => setSClient(e.target.value)} placeholder="Cliente (opzionale)" />
            <div className="drow">
              <button className="dghost" onClick={() => setDialog(false)}>Annulla</button>
              <button className="dok" onClick={confirmSave}>Salva</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
