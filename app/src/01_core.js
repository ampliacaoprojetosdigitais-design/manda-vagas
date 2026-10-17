"use strict";
/* =====================================================================
   CAMADA 0 — utilidades
   ===================================================================== */
const U = {
  uid(p = "id") { const r = (window.crypto && crypto.randomUUID) ? crypto.randomUUID().slice(0, 13) : Math.random().toString(36).slice(2, 15); return p + "_" + r.replace(/-/g, ""); },
  now() { return new Date().toISOString(); },
  today() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); },
  month(iso) { return (iso || U.now()).slice(0, 7); },
  daysAgo(n) { return new Date(Date.now() - n * 864e5).toISOString(); },
  daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); },
  esc(s) { return String(s ?? "").replace(/[&<>"'`]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" }[c])); },
  norm(s) { return String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); },
  fmtDate(s) { if (!s) return "—"; const d = new Date(String(s).length <= 10 ? s + "T12:00:00" : s); return isNaN(+d) ? "—" : d.toLocaleDateString("pt-BR"); },
  fmtDateTime(s) { if (!s) return "—"; const d = new Date(s); return isNaN(+d) ? "—" : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); },
  rel(s) { if (!s) return "—"; const d = U.daysBetween(s, U.now()); if (d <= 0) return "hoje"; if (d === 1) return "ontem"; if (d < 30) return `há ${d} dias`; return U.fmtDate(s); },
  money(v) { return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); },
  safeUrl(u) { try { const x = new URL(String(u || "").trim()); return ["http:", "https:"].includes(x.protocol) ? x.href : ""; } catch (e) { return ""; } },
  canonicalUrl(u) { try { const x = new URL(u); x.hash = ""; [...x.searchParams.keys()].forEach(k => { if (/^(utm_|fbclid|gclid|ref|refid|trk|trackingid|src|jobboardsource)/i.test(k)) x.searchParams.delete(k); }); x.hostname = x.hostname.toLowerCase().replace(/^www\./, ""); return x.toString().replace(/\/(\?|$)/, "$1").toLowerCase(); } catch (e) { return U.norm(u).trim(); } },
  words(s) { return U.norm(s).split(/[^a-z0-9]+/).filter(w => w.length > 2); },
  jaccard(a, b) { const A = new Set(U.words(a)), B = new Set(U.words(b)); if (!A.size || !B.size) return 0; let i = 0; A.forEach(x => { if (B.has(x)) i++; }); return i / (A.size + B.size - i); },
  initials(n) { return String(n || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase(); },
  clamp(n, a, b) { return Math.max(a, Math.min(b, n)); },
  slug(s) { return U.norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "arquivo"; },
  async hash(text) {
    try { const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)); return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join(""); }
    catch (e) { let h = 5381; for (const c of text) h = (h * 33) ^ c.charCodeAt(0); return "fallback_" + (h >>> 0).toString(16); }
  },
  pct(a, b) { return b ? Math.round(a / b * 100) : 0; },
};

/* =====================================================================
   CAMADA 1 — repositório de dados (contratos estáveis)
   O adaptador local guarda tudo no navegador. Um adaptador Supabase
   futuro implementa os mesmos métodos: all/get/find/insert/update/remove.
   ===================================================================== */
const COLLECTIONS = ["users", "profiles", "resumes", "resume_versions", "keyword_claims", "job_sources", "jobs", "job_feedback", "applications", "subscriptions", "usage_events", "content_drafts", "notifications", "notification_preferences", "audit_events", "privacy_requests", "settings"];
const DB_KEY = "mandavaga_saas_v1";

const LocalAdapter = {
  name: "Armazenamento local do navegador",
  ok: true,
  read() { try { const raw = localStorage.getItem(DB_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { this.ok = false; return null; } },
  write(data) { try { localStorage.setItem(DB_KEY, JSON.stringify(data)); return true; } catch (e) { this.ok = false; return false; } },
  clear() { try { localStorage.removeItem(DB_KEY); } catch (e) { } },
};

const Repo = {
  data: null,
  adapter: LocalAdapter,
  load() {
    const d = this.adapter.read();
    this.data = d && d.schema === 1 ? d : null;
    if (this.data) COLLECTIONS.forEach(c => { if (!Array.isArray(this.data[c])) this.data[c] = []; });
    return !!this.data;
  },
  init(seed) { this.data = Object.assign({ schema: 1, createdAt: U.now() }, seed); COLLECTIONS.forEach(c => { if (!Array.isArray(this.data[c])) this.data[c] = []; }); this.save(); },
  save() { this.adapter.write(this.data); },
  all(c) { return this.data[c]; },
  get(c, id) { return this.data[c].find(r => r.id === id) || null; },
  find(c, fn) { return this.data[c].filter(fn); },
  one(c, fn) { return this.data[c].find(fn) || null; },
  insert(c, rec) { const r = Object.assign({ id: U.uid(c.slice(0, 3)), createdAt: U.now() }, rec); this.data[c].push(r); this.save(); return r; },
  update(c, id, patch) { const r = this.get(c, id); if (!r) return null; Object.assign(r, patch, { updatedAt: U.now() }); this.save(); return r; },
  remove(c, fn) { const before = this.data[c].length; this.data[c] = this.data[c].filter(r => !fn(r)); this.save(); return before - this.data[c].length; },
  setting(key, def) { const s = this.one("settings", r => r.key === key); return s ? s.value : def; },
  setSetting(key, value) { const s = this.one("settings", r => r.key === key); if (s) { s.value = value; this.save(); } else this.insert("settings", { key, value }); },
};

/* =====================================================================
   CAMADA 2 — adaptadores de integração (todos desconectados nesta fase)
   Cada um responde { ok:false, reason } até ser configurado no servidor.
   ===================================================================== */
const Integrations = {
  list: [
    { key: "db", name: "Banco remoto e autenticação", example: "Supabase", phase: "Fase 11", detail: "Hoje: dados no navegador. Depois: RLS, bucket privado e URLs assinadas." },
    { key: "ai", name: "Provedor de IA (servidor)", example: "API de modelo de linguagem", phase: "Fase 11", detail: "Hoje: regras determinísticas. O usuário será avisado antes de enviar currículo a um provedor externo." },
    { key: "jobs", name: "Fontes autorizadas de vagas", example: "APIs e parceiros com termos de uso", phase: "Fase 11", detail: "Hoje: catálogo demonstrativo + vagas reais cadastradas à mão pelo admin." },
    { key: "email", name: "E-mail transacional", example: "Provedor de e-mail", phase: "Fase 11", detail: "Recuperação de senha, alertas de vagas e Central de Respostas." },
    { key: "whatsapp", name: "WhatsApp", example: "API oficial", phase: "Fase 11", detail: "Somente com consentimento separado." },
    { key: "payments", name: "Pagamentos", example: "Provedor + webhooks", phase: "Fase 11", detail: "Hoje: troca de plano simulada, sem cobrança." },
    { key: "files", name: "Leitura de PDF/DOCX", example: "Extração no servidor", phase: "Fase 11", detail: "Hoje: preenchimento manual, colar texto ou enviar .txt." },
    { key: "hosting", name: "Hospedagem, domínio e monitoramento", example: "Vercel ou Hostinger", phase: "Fase 11", detail: "Logs, alertas e backups." },
  ],
  call(key) { const i = this.list.find(x => x.key === key); return { ok: false, reason: `${i ? i.name : key}: integração ainda não conectada. Nada foi enviado.` }; },
};
