// Integração Asaas (servidor). A chave da API fica só em variável de ambiente.
// Documentação: https://docs.asaas.com  ·  Sandbox: https://api-sandbox.asaas.com/v3  ·  Produção: https://api.asaas.com/v3
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Preços definidos no servidor: o navegador nunca decide quanto cobrar.
const PLANS = {
  inicial: { name: "Inicial", value: 19.9 },
  plus: { name: "Plus", value: 29.9 },
  max: { name: "Max", value: 59.9 },
};
const ACTIVE_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
const OVERDUE_EVENTS = new Set(["PAYMENT_OVERDUE"]);
const CANCEL_EVENTS = new Set(["PAYMENT_DELETED", "PAYMENT_REFUNDED", "PAYMENT_CHARGEBACK_REQUESTED", "SUBSCRIPTION_DELETED", "SUBSCRIPTION_INACTIVATED"]);

function cfg() {
  const env = (process.env.ASAAS_ENV || "sandbox").toLowerCase() === "production" ? "production" : "sandbox";
  return {
    key: process.env.ASAAS_API_KEY || "",
    env,
    base: process.env.ASAAS_BASE_URL || (env === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3"),
    webhookToken: process.env.ASAAS_WEBHOOK_TOKEN || "",
    billingType: process.env.ASAAS_BILLING_TYPE || "UNDEFINED", // cliente escolhe Pix, boleto ou cartão na página da Asaas
    store: process.env.PAYMENTS_STORE || path.join(__dirname, "..", "data", "payments.json"),
  };
}

// ---------- armazenamento simples (fase de transição até o banco remoto) ----------
function load() { try { return JSON.parse(fs.readFileSync(cfg().store, "utf8")); } catch { return { subscriptions: {}, events: {} }; } }
function save(db) { const f = cfg().store; fs.mkdirSync(path.dirname(f), { recursive: true }); const tmp = f + ".tmp"; fs.writeFileSync(tmp, JSON.stringify(db, null, 2)); fs.renameSync(tmp, f); }

async function asaas(method, route, body) {
  const c = cfg();
  const res = await fetch(c.base + route, { method, headers: { "Content-Type": "application/json", "access_token": c.key, "User-Agent": "MandaVaga/0.3 (Node.js)" }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text(); let data = {}; try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) { const msg = (data.errors && data.errors.map(e => e.description).join("; ")) || `Asaas respondeu ${res.status}`; const err = new Error(msg); err.status = res.status; throw err; }
  return data;
}

const onlyDigits = s => String(s || "").replace(/\D/g, "");
function validCpfCnpj(v) { const d = onlyDigits(v); return d.length === 11 || d.length === 14; }
function today() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }

// ---------- casos de uso ----------
async function checkout(input) {
  const c = cfg();
  if (!c.key) return { status: 503, body: { error: "Pagamentos ainda não configurados no servidor." } };
  const plan = PLANS[input.plan]; if (!plan) return { status: 400, body: { error: "Plano inválido." } };
  const name = String(input.name || "").trim().slice(0, 120); const email = String(input.email || "").trim().slice(0, 160);
  const ref = String(input.ref || ""); if (!/^[a-f0-9]{32}$/.test(ref)) return { status: 400, body: { error: "Referência inválida." } };
  if (name.length < 3 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { status: 400, body: { error: "Nome ou e-mail inválido." } };
  if (!validCpfCnpj(input.cpfCnpj)) return { status: 400, body: { error: "Informe um CPF ou CNPJ válido." } };
  const db = load(); const existing = db.subscriptions[ref];
  try {
    const customerId = existing?.customerId || (await asaas("POST", "/customers", { name, email, cpfCnpj: onlyDigits(input.cpfCnpj), mobilePhone: onlyDigits(input.phone) || undefined, externalReference: ref, notificationDisabled: false })).id;
    const sub = await asaas("POST", "/subscriptions", { customer: customerId, billingType: c.billingType, value: plan.value, nextDueDate: today(), cycle: "MONTHLY", description: `Manda Vaga — Plano ${plan.name}`, externalReference: ref });
    let invoiceUrl = "";
    try { const pays = await asaas("GET", `/subscriptions/${encodeURIComponent(sub.id)}/payments`); invoiceUrl = pays?.data?.[0]?.invoiceUrl || ""; } catch { /* a cobrança pode demorar alguns segundos para existir */ }
    db.subscriptions[ref] = { ref, plan: input.plan, customerId, subscriptionId: sub.id, status: "PENDING", invoiceUrl, env: c.env, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    save(db);
    return { status: 200, body: { subscriptionId: sub.id, invoiceUrl, status: "PENDING" } };
  } catch (err) {
    return { status: err.status && err.status < 500 ? 400 : 502, body: { error: "Não foi possível criar a cobrança: " + err.message } };
  }
}

async function status(ref) {
  const db = load(); const s = db.subscriptions[String(ref || "")];
  if (!s) return { status: 404, body: { error: "Assinatura não encontrada." } };
  // se ainda não temos o link da primeira cobrança, tenta buscar de novo
  if (!s.invoiceUrl && cfg().key) { try { const pays = await asaas("GET", `/subscriptions/${encodeURIComponent(s.subscriptionId)}/payments`); s.invoiceUrl = pays?.data?.[0]?.invoiceUrl || ""; save(db); } catch { } }
  return { status: 200, body: { status: s.status, plan: s.plan, invoiceUrl: s.invoiceUrl, updatedAt: s.updatedAt } };
}

function safeEqual(a, b) { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); }

function webhook(headers, raw) {
  const c = cfg();
  if (!c.webhookToken || !safeEqual(headers["asaas-access-token"] || "", c.webhookToken)) return { status: 401, body: { error: "Token inválido." } };
  let ev; try { ev = JSON.parse(raw); } catch { return { status: 400, body: { error: "JSON inválido." } }; }
  const db = load();
  if (ev.id && db.events[ev.id]) return { status: 200, body: { ok: true, duplicate: true } }; // idempotência
  const pay = ev.payment || {}; const subObj = ev.subscription || {};
  const subscriptionId = pay.subscription || subObj.id || "";
  const ref = pay.externalReference || subObj.externalReference || Object.values(db.subscriptions).find(s => s.subscriptionId === subscriptionId)?.ref;
  const rec = ref && db.subscriptions[ref];
  if (rec) {
    if (ACTIVE_EVENTS.has(ev.event)) rec.status = "ACTIVE";
    else if (OVERDUE_EVENTS.has(ev.event)) rec.status = "OVERDUE";
    else if (CANCEL_EVENTS.has(ev.event)) rec.status = "CANCELED";
    if (pay.invoiceUrl) rec.invoiceUrl = pay.invoiceUrl;
    rec.lastEvent = ev.event; rec.updatedAt = new Date().toISOString();
  }
  if (ev.id) db.events[ev.id] = { event: ev.event, ref: ref || null, at: new Date().toISOString() };
  save(db);
  return { status: 200, body: { ok: true } };
}

function publicConfig() { const c = cfg(); return { payments: !!c.key, env: c.env, plans: PLANS }; }

module.exports = { checkout, status, webhook, publicConfig, PLANS, _cfg: cfg };
