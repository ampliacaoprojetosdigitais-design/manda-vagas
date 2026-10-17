// API Asaas simulada para testes locais (não faz cobrança real)
const http = require("http");
const calls = [];
http.createServer((req, res) => {
  let body = ""; req.on("data", c => body += c); req.on("end", () => {
    const j = (s, o) => { res.writeHead(s, { "Content-Type": "application/json" }); res.end(JSON.stringify(o)); };
    if (req.url === "/__calls") return j(200, calls);
    if (req.headers["access_token"] !== "chave_teste") return j(401, { errors: [{ description: "token inválido" }] });
    const b = body ? JSON.parse(body) : {}; calls.push({ m: req.method, u: req.url, b });
    if (req.method === "POST" && req.url === "/v3/customers") return b.cpfCnpj ? j(200, { id: "cus_teste1" }) : j(400, { errors: [{ description: "cpfCnpj obrigatório" }] });
    if (req.method === "POST" && req.url === "/v3/subscriptions") return j(200, { id: "sub_teste1", value: b.value, cycle: b.cycle });
    if (req.method === "GET" && req.url === "/v3/subscriptions/sub_teste1/payments") return j(200, { data: [{ id: "pay_1", invoiceUrl: "https://sandbox.asaas.com/i/teste123" }] });
    if (req.method === "GET" && req.url === "/__calls") return j(200, calls);
    j(404, {});
  });
}).listen(4010);
