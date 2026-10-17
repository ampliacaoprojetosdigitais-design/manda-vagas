// Servidor sem dependências: landing em /, app em /app/, protótipos em /prototipos/ e API de pagamentos em /api/.
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const asaas = require("./payments/asaas");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8", ".csv": "text/csv; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
const ALLOWED = ["site", "app/dist", "prototipos", "piloto"]; // pastas públicas; docs, dados e testes não são servidos
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" };

function send(res, status, body, type = "text/plain; charset=utf-8") { res.writeHead(status, { "Content-Type": type, ...SEC }); res.end(body); }
function json(res, status, obj) { res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...SEC }); res.end(JSON.stringify(obj)); }
function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => { let size = 0; const chunks = []; req.on("data", c => { size += c.length; if (size > limit) { reject(Object.assign(new Error("too large"), { status: 413 })); req.destroy(); } else chunks.push(c); }); req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8"))); req.on("error", reject); });
}

async function api(req, res, url, query) {
  try {
    if (url === "/api/config" && req.method === "GET") return json(res, 200, asaas.publicConfig());
    if (url === "/api/checkout" && req.method === "POST") { let body; try { body = JSON.parse(await readBody(req)); } catch (e) { return json(res, e.status || 400, { error: "Requisição inválida." }); } const r = await asaas.checkout(body); return json(res, r.status, r.body); }
    if (url === "/api/subscription" && req.method === "GET") { const r = await asaas.status(query.get("ref")); return json(res, r.status, r.body); }
    if (url === "/api/webhooks/asaas" && req.method === "POST") { const raw = await readBody(req, 200000); const r = asaas.webhook(req.headers, raw); return json(res, r.status, r.body); }
    return json(res, 404, { error: "Rota não encontrada." });
  } catch (e) { console.error("API", url, e.message); return json(res, e.status || 500, { error: "Erro interno." }); }
}

http.createServer((req, res) => {
  let url, query;
  try { const u = new URL(req.url, "http://x"); url = decodeURIComponent(u.pathname); query = u.searchParams; } catch { return send(res, 400, "Requisição inválida"); }
  if (url === "/health") return send(res, 200, "ok");
  if (url.startsWith("/api/")) return api(req, res, url, query);
  if (url === "/app") { res.writeHead(301, { Location: "/app/" }); return res.end(); }
  let rel = url.replace(/^\/+/, "");
  if (rel === "" || rel === "index.html") rel = "site/index.html";
  else if (rel.startsWith("assets/")) rel = "site/" + rel;
  else if (rel === "app/" || rel === "app/index.html") rel = "app/dist/index.html";
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(ROOT, rel));
  if (!ALLOWED.some(dir => file.startsWith(path.join(ROOT, dir) + path.sep))) return send(res, 404, "Não encontrado");
  fs.readFile(file, (err, data) => { if (err) return send(res, 404, "Não encontrado"); send(res, 200, data, TYPES[path.extname(file)] || "application/octet-stream"); });
}).listen(PORT, () => console.log(`Manda Vaga em http://localhost:${PORT} · pagamentos: ${asaas.publicConfig().payments ? "Asaas " + asaas.publicConfig().env : "não configurados"}`));
