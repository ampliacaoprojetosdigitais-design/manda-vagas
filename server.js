// Servidor estático sem dependências: landing em /, app em /app/, protótipos em /prototipos/.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8", ".csv": "text/csv; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
const ALLOWED = ["site", "app/dist", "prototipos", "piloto"]; // pastas públicas; docs e testes não são servidos

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" });
  res.end(body);
}

http.createServer((req, res) => {
  let url;
  try { url = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch { return send(res, 400, "Requisição inválida"); }
  if (url === "/health") return send(res, 200, "ok");
  if (url === "/app") { res.writeHead(301, { Location: "/app/" }); return res.end(); }
  let rel = url.replace(/^\/+/, "");
  if (rel === "" || rel === "index.html") rel = "site/index.html";
  else if (rel.startsWith("assets/")) rel = "site/" + rel;
  else if (rel === "app/" || rel === "app/index.html") rel = "app/dist/index.html";
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(ROOT, rel));
  if (!ALLOWED.some(dir => file.startsWith(path.join(ROOT, dir) + path.sep))) return send(res, 404, "Não encontrado");
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, "Não encontrado");
    send(res, 200, data, TYPES[path.extname(file)] || "application/octet-stream");
  });
}).listen(PORT, () => console.log(`Manda Vaga em http://localhost:${PORT}`));
