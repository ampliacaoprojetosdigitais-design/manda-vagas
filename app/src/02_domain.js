/* =====================================================================
   CAMADA 3 — domínio: regras de currículo, palavras-chave, aderência,
   curadoria, limites e estados. Nada aqui toca a interface.
   ===================================================================== */

const FAMILIES = [
  { key: "juridico", name: "Estágio e rotinas em Direito", group: 1 },
  { key: "processual", name: "Acompanhamento processual e controladoria", group: 2 },
  { key: "cartorio", name: "Cartório e serviços extrajudiciais", group: 3 },
  { key: "adm", name: "Administrativo jurídico e Legal Ops", group: 4 },
  { key: "mkt", name: "Marketing e comunicação jurídica", group: 5 },
  { key: "digital", name: "Sistemas jurídicos e produtos digitais", group: 6 },
  { key: "atendimento", name: "Atendimento e relacionamento", group: 0 },
];

// termo, sinônimos (normalizados na busca), tipo, famílias
const TAXONOMY = [
  ["Direito do Trabalho", ["direito do trabalho", "trabalhista", "clt", "relacoes de trabalho"], "área", ["juridico"]],
  ["Processo do Trabalho", ["processo do trabalho", "reclamacao trabalhista"], "área", ["juridico", "processual"]],
  ["Direito Civil", ["direito civil", "civel", "contencioso civel"], "área", ["juridico"]],
  ["Contencioso", ["contencioso"], "área", ["juridico", "processual"]],
  ["Pesquisa de jurisprudência", ["jurisprudencia", "pesquisa juridica", "doutrina"], "tarefa", ["juridico"]],
  ["Elaboração de peças", ["peticao", "peticoes", "pecas processuais", "minuta"], "tarefa", ["juridico"]],
  ["Acompanhamento processual", ["acompanhamento processual", "andamento processual", "andamentos processuais", "acompanhamento de processos", "acompanhar processos"], "tarefa", ["processual"]],
  ["Controle de prazos", ["controle de prazos", "prazos processuais", "gestao de prazos", "prazos", "agenda de prazos"], "tarefa", ["processual", "adm"]],
  ["Controladoria jurídica", ["controladoria juridica", "controladoria"], "área", ["processual"]],
  ["Publicações jurídicas", ["publicacoes", "diario oficial", "intimacoes"], "tarefa", ["processual"]],
  ["Tribunais e fóruns", ["tribunal", "tribunais", "forum", "foruns", "protocolo judicial"], "área", ["processual", "juridico"]],
  ["Sistemas de tribunais (PJe, e-SAJ)", ["pje", "e-saj", "esaj", "projudi", "eproc"], "ferramenta", ["processual"]],
  ["Software jurídico (CPJ, Projuris, Astrea)", ["cpj", "projuris", "astrea", "legal one", "software juridico"], "ferramenta", ["processual", "digital"]],
  ["Pauta de audiências", ["audiencia", "audiencias", "pauta"], "tarefa", ["processual"]],
  ["Relatórios", ["relatorio", "relatorios"], "tarefa", ["processual", "adm", "mkt"]],
  ["Registro civil e notas", ["registro civil", "tabelionato", "notas", "escritura", "cartorio"], "área", ["cartorio"]],
  ["Serviços extrajudiciais", ["extrajudicial", "extrajudiciais"], "área", ["cartorio"]],
  ["Protocolo de documentos", ["protocolo", "protocolar"], "tarefa", ["cartorio", "adm"]],
  ["Atendimento ao público", ["atendimento ao publico", "atendimento a clientes", "atendimento ao cliente", "atendimento", "atender clientes", "atender o publico"], "competência", ["cartorio", "atendimento", "adm"]],
  ["Gestão documental", ["gestao documental", "organizacao de documentos", "organizacao documental", "arquivo", "arquivamento", "documentos"], "tarefa", ["adm", "cartorio"]],
  ["Contratos", ["contrato", "contratos", "aditivo", "aditivos"], "área", ["adm", "juridico"]],
  ["Atas e documentos formais", ["ata", "atas", "documentos formais", "oficio", "oficios"], "tarefa", ["adm", "cartorio"]],
  ["Cadastros", ["cadastro", "cadastros"], "tarefa", ["adm", "cartorio", "atendimento"]],
  ["Planilhas e controles", ["planilha", "planilhas", "controle de dados", "indicadores"], "tarefa", ["adm", "processual"]],
  ["Excel", ["excel"], "ferramenta", ["adm", "processual", "mkt"]],
  ["Pacote Office", ["pacote office", "word", "powerpoint", "office"], "ferramenta", ["adm", "processual", "cartorio"]],
  ["Google Workspace", ["google workspace", "google drive", "planilhas google"], "ferramenta", ["adm", "digital"]],
  ["Legal Operations", ["legal operations", "legal ops", "operacoes juridicas"], "área", ["adm", "digital"]],
  ["Gestão de projetos", ["gestao de projetos", "projetos", "cronograma", "cronogramas"], "competência", ["adm", "digital", "mkt"]],
  ["Scrum e métodos ágeis", ["scrum", "agil", "ageis", "kanban"], "competência", ["digital", "adm"]],
  ["Marketing jurídico", ["marketing juridico", "provimento 205", "publicidade na advocacia"], "área", ["mkt"]],
  ["Comunicação e conteúdo", ["comunicacao", "conteudo", "redacao", "textos", "copywriting"], "competência", ["mkt"]],
  ["Redes sociais", ["redes sociais", "instagram", "linkedin", "social media"], "competência", ["mkt"]],
  ["Google Analytics", ["google analytics", "ga4"], "ferramenta", ["mkt"]],
  ["Meta Ads", ["meta ads", "facebook ads", "trafego pago"], "ferramenta", ["mkt"]],
  ["CRM", ["crm", "funil de vendas", "pipeline comercial"], "ferramenta", ["mkt", "atendimento"]],
  ["Relacionamento com clientes", ["relacionamento com clientes", "relacionamento", "fidelizacao", "pos-venda"], "competência", ["atendimento", "mkt"]],
  ["Negociação", ["negociacao", "negociar"], "competência", ["atendimento"]],
  ["Vendas e propostas", ["vendas", "proposta comercial", "propostas comerciais", "prospeccao"], "competência", ["atendimento", "mkt"]],
  ["Design (Canva, Photoshop)", ["canva", "photoshop", "illustrator", "indesign", "design"], "ferramenta", ["mkt"]],
  ["WordPress e sites", ["wordpress", "site", "sites", "landing page"], "ferramenta", ["mkt", "digital"]],
  ["Produtos digitais", ["produto digital", "produtos digitais", "prototipo", "prototipagem", "aplicativo", "aplicativos"], "área", ["digital"]],
  ["Ferramentas de IA", ["inteligencia artificial", "ferramentas de ia", "chatgpt", "claude", "gemini"], "ferramenta", ["digital", "mkt"]],
  ["Automação", ["automacao", "automacoes", "no-code", "zapier", "make.com"], "competência", ["digital"]],
  ["LegalTech", ["legaltech", "lawtech", "tecnologia juridica"], "área", ["digital"]],
  ["Articulação com órgãos públicos", ["orgaos publicos", "prefeitura", "prefeituras", "poder publico", "governo"], "competência", ["adm", "atendimento"]],
  ["Inglês", ["ingles", "english"], "competência", []],
  ["LGPD", ["lgpd", "protecao de dados"], "área", ["adm", "digital", "juridico"]],
].map(([term, aliases, type, fam]) => ({ term, aliases: aliases.map(U.norm), type, fam }));

function termIn(text, t) {
  const n = " " + U.norm(text).replace(/[^a-z0-9@.+-]+/g, " ") + " ";
  return t.aliases.some(a => n.includes(" " + a.replace(/[^a-z0-9@.+-]+/g, " ") + " "));
}

const COMPANY_SIZES = ["Micro (até 9)", "Pequena (10–49)", "Média (50–249)", "Grande (250+)", "Não informado"];
const CAREER_STAGES = ["Primeiro emprego", "Em formação (estágio)", "Início de carreira", "Profissional experiente"];
const SOURCE_TYPES = ["Agregador / API de vagas", "ATS (sistema de recrutamento)", "Site oficial (Trabalhe Conosco)", "Consultoria / RH", "Canal público (CIEE, SINE, PAT)", "Portal de emprego", "Manual", "Sintético"];
function careerStage(level) { return { "Jovem aprendiz": "Primeiro emprego", "Estágio": "Em formação (estágio)", "Assistente/Auxiliar": "Início de carreira", "Júnior": "Início de carreira", "Pleno": "Profissional experiente" }[level] || "Início de carreira"; }
function salaryText(j) { if (!j.salaryMin && !j.salaryMax) return "Salário a combinar"; if (j.salaryMin && j.salaryMax && j.salaryMin !== j.salaryMax) return `${U.money(j.salaryMin)} a ${U.money(j.salaryMax)}`; return U.money(j.salaryMin || j.salaryMax); }

/* ---------------- currículo: estrutura e texto ---------------- */
const Resume = {
  empty() { return { headline: "", summary: "", experiences: [], education: [], skills: [], certifications: [], languages: [], extra: "" }; },
  segments(d) {
    const s = [];
    if (d.summary) s.push({ where: "Resumo", text: d.summary, backed: false });
    if (d.headline) s.push({ where: "Título", text: d.headline, backed: false });
    (d.experiences || []).forEach(e => { s.push({ where: `${e.role} — ${e.org}`, text: e.role, backed: true }); (e.activities || []).forEach(a => s.push({ where: `${e.role} — ${e.org}`, text: a, backed: true })); });
    (d.education || []).forEach(e => s.push({ where: "Formação", text: `${e.course} ${e.institution}`, backed: true }));
    (d.skills || []).forEach(k => s.push({ where: "Competências", text: k, backed: true }));
    (d.certifications || []).forEach(k => s.push({ where: "Certificações", text: k, backed: true }));
    (d.languages || []).forEach(l => s.push({ where: "Idiomas", text: `${l.lang} ${l.level}`, backed: true }));
    if (d.extra) s.push({ where: "Informações adicionais", text: d.extra, backed: false });
    return s;
  },
  toText(d, user, opts = {}) {
    const L = [];
    L.push((user?.name || "").toUpperCase());
    const contact = [user?.city ? `${user.city}${user.uf ? " – " + user.uf : ""}` : "", user?.email || ""].filter(Boolean).join(" | ");
    if (contact) L.push(contact);
    if (opts.objective || d.headline) L.push((opts.objective || d.headline).toUpperCase());
    const sec = (t, body) => { if (body && body.trim()) { L.push("", t, body.trim()); } };
    sec("RESUMO PROFISSIONAL", d.summary);
    if ((d.experiences || []).length) { L.push("", "EXPERIÊNCIA PROFISSIONAL"); d.experiences.forEach(e => { L.push(`${e.org} — ${e.role} | ${Resume.period(e)}`); (e.activities || []).forEach(a => L.push("• " + a)); }); }
    if ((d.education || []).length) { L.push("", "FORMAÇÃO"); d.education.forEach(e => L.push(`• ${e.course} — ${e.institution}${e.status ? " (" + e.status + ")" : ""}${e.end ? ", " + e.end : ""}`)); }
    if ((d.certifications || []).length) sec("CERTIFICAÇÕES E CURSOS", d.certifications.map(c => "• " + c).join("\n"));
    if ((d.skills || []).length) sec("COMPETÊNCIAS", d.skills.join(" • "));
    if ((d.languages || []).length) sec("IDIOMAS", d.languages.map(l => `${l.lang} — ${l.level}`).join("\n"));
    sec("INFORMAÇÕES ADICIONAIS", d.extra);
    return L.join("\n");
  },
  toHTML(d, user, opts = {}) {
    const e = U.esc;
    const exp = (d.experiences || []).map(x => `<h3>${e(x.org)} — ${e(x.role)} <small>${e(Resume.period(x))}</small></h3><ul>${(x.activities || []).map(a => `<li>${e(a)}</li>`).join("")}</ul>`).join("");
    const edu = (d.education || []).map(x => `<li>${e(x.course)} — ${e(x.institution)}${x.status ? " (" + e(x.status) + ")" : ""}${x.end ? ", " + e(x.end) : ""}</li>`).join("");
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Currículo — ${e(user?.name)}</title><style>body{font:15px/1.5 Arial,sans-serif;max-width:760px;margin:32px auto;padding:0 16px;color:#111}h1{margin:0}h2{font-size:14px;letter-spacing:.08em;border-bottom:1px solid #999;padding-bottom:3px;margin-top:22px}h3{font-size:15px;margin:12px 0 4px}small{font-weight:400;color:#555}ul{margin:4px 0 8px 18px;padding:0}</style></head><body><h1>${e(user?.name)}</h1><p>${e([user?.city, user?.uf].filter(Boolean).join(" – "))}${user?.email ? " | " + e(user.email) : ""}</p>${(opts.objective || d.headline) ? `<p><b>${e(opts.objective || d.headline)}</b></p>` : ""}${d.summary ? `<h2>RESUMO PROFISSIONAL</h2><p>${e(d.summary)}</p>` : ""}${exp ? `<h2>EXPERIÊNCIA PROFISSIONAL</h2>${exp}` : ""}${edu ? `<h2>FORMAÇÃO</h2><ul>${edu}</ul>` : ""}${(d.certifications || []).length ? `<h2>CERTIFICAÇÕES E CURSOS</h2><ul>${d.certifications.map(c => `<li>${e(c)}</li>`).join("")}</ul>` : ""}${(d.skills || []).length ? `<h2>COMPETÊNCIAS</h2><p>${d.skills.map(e).join(" • ")}</p>` : ""}${(d.languages || []).length ? `<h2>IDIOMAS</h2><p>${d.languages.map(l => e(l.lang + " — " + l.level)).join("<br>")}</p>` : ""}${d.extra ? `<h2>INFORMAÇÕES ADICIONAIS</h2><p>${e(d.extra)}</p>` : ""}</body></html>`;
  },
  period(e) { return `${e.start || "?"}–${e.end || "atual"}`; },
  year(v) { const m = String(v || "").match(/(19|20)\d{2}/); return m ? +m[0] : null; },
  isCurrent(v) { return !v || /atual|presente|hoje|current/i.test(v); },

  /* Importação de texto colado ou .txt: heurística por títulos de seção */
  parseText(raw) {
    const d = Resume.empty();
    const lines = String(raw || "").replace(/\r/g, "").split("\n").map(l => l.trim());
    const H = [["summary", /^(resumo|perfil|sobre|objetivo)/i], ["experiences", /^(experi[eê]ncia|hist[oó]rico profissional|atua[cç][aã]o)/i], ["education", /^(forma[cç][aã]o|escolaridade|educa[cç][aã]o)/i], ["skills", /^(compet[eê]ncias|habilidades|conhecimentos|skills)/i], ["certifications", /^(certifica|cursos)/i], ["languages", /^(idiomas|l[ií]nguas)/i], ["extra", /^(informa[cç][oõ]es adicionais|outras informa)/i]];
    let sec = "header", cur = null; const summary = [], extra = [];
    for (const line of lines) {
      if (!line) continue;
      const h = H.find(([, re]) => re.test(line) && line.length < 60);
      if (h) { sec = h[0]; cur = null; continue; }
      const bullet = /^[•\-–*·]\s*/.test(line); const clean = line.replace(/^[•\-–*·]\s*/, "");
      if (sec === "summary") summary.push(clean);
      else if (sec === "experiences") {
        const yr = clean.match(/((?:19|20)\d{2})\s*(?:[–—-]|a|até)\s*((?:19|20)\d{2}|atual|presente)?/i);
        if (!bullet && (yr || /[—|]/.test(clean))) {
          const head = clean.replace(/\|?\s*((?:19|20)\d{2}).*$/, "").trim();
          const parts = head.split(/\s+[—–-]\s+|\s*\|\s*/).filter(Boolean);
          cur = { id: U.uid("exp"), org: parts[0] || head, role: parts[1] || "Cargo a confirmar", start: yr ? yr[1] : "", end: yr && yr[2] && !/atual|presente/i.test(yr[2]) ? yr[2] : (yr ? "atual" : ""), activities: [] };
          d.experiences.push(cur);
        } else if (cur) cur.activities.push(clean);
        else extra.push(clean);
      }
      else if (sec === "education") { const parts = clean.split(/\s+[—–-]\s+/); const yr = clean.match(/(19|20)\d{2}/); d.education.push({ id: U.uid("edu"), course: parts[0], institution: (parts[1] || "").replace(/,?\s*(19|20)\d{2}.*$/, "").trim() || "Instituição a confirmar", status: /andamento|cursando/i.test(clean) ? "em andamento" : "concluído", end: yr ? yr[0] : "" }); }
      else if (sec === "skills") clean.split(/\s*[•;,]\s*/).filter(Boolean).forEach(s => d.skills.push(s));
      else if (sec === "certifications") d.certifications.push(clean);
      else if (sec === "languages") { const [lang, level] = clean.split(/\s*[—–:-]\s*/); d.languages.push({ lang, level: level || "nível a confirmar" }); }
      else if (sec === "extra") extra.push(clean);
    }
    d.summary = summary.join(" ");
    d.extra = extra.join(" ");
    d.skills = [...new Set(d.skills)];
    return d;
  },

  /* Diagnóstico explicável — cada item diz o porquê */
  analyze(d) {
    const items = [];
    const add = (id, label, status, detail) => items.push({ id, label, status, detail });
    const missing = [["summary", "resumo"], ["experiences", "experiência"], ["education", "formação"], ["skills", "competências"]].filter(([k]) => !(Array.isArray(d[k]) ? d[k].length : (d[k] || "").trim()));
    add("sections", "Seções essenciais", missing.length ? "fail" : "pass", missing.length ? `Faltam: ${missing.map(m => m[1]).join(", ")}.` : "Resumo, experiência, formação e competências presentes.");
    const sl = (d.summary || "").length;
    add("summary", "Tamanho do resumo", sl === 0 ? "fail" : sl < 200 ? "warn" : sl > 750 ? "warn" : "pass", sl === 0 ? "Sem resumo." : sl < 200 ? `${sl} caracteres. Um resumo entre 200 e 750 caracteres explica melhor quem você é.` : sl > 750 ? `${sl} caracteres. Recrutadores leem os primeiros segundos; tente até 750.` : `${sl} caracteres: bom tamanho.`);
    const badDates = (d.experiences || []).filter(e => { const s = Resume.year(e.start), f = Resume.isCurrent(e.end) ? new Date().getFullYear() : Resume.year(e.end); return !s || !f || f < s || s > new Date().getFullYear(); });
    add("dates", "Datas das experiências", (d.experiences || []).length === 0 ? "warn" : badDates.length ? "fail" : "pass", badDates.length ? `Verifique: ${badDates.map(e => e.org).join(", ")} (início ausente ou fim antes do início).` : "Todas as experiências têm período coerente.");
    const thin = (d.experiences || []).filter(e => (e.activities || []).length < 2);
    add("activities", "Atividades por experiência", (d.experiences || []).length === 0 ? "warn" : thin.length ? "warn" : "pass", thin.length ? `Com menos de 2 atividades: ${thin.map(e => e.org).join(", ")}.` : "Cada experiência descreve ao menos 2 atividades.");
    const weak = []; (d.experiences || []).forEach(e => (e.activities || []).forEach(a => { if (/^(respons[aá]vel (por|pela|pelo)|fui respons|eu )/i.test(a)) weak.push(a); }));
    add("verbs", "Atividades começam pela ação", weak.length ? "warn" : "pass", weak.length ? `${weak.length} atividade(s) começam com “Responsável por” ou “Eu”. Começar pela ação deixa a leitura mais rápida.` : "Atividades começam pela ação.");
    const years = (d.experiences || []).map(e => Resume.year(e.start)).filter(Boolean);
    const first = years.length ? Math.min(...years) : null; const span = first ? new Date().getFullYear() - first : 0;
    const claims = [...String((d.summary || "") + " " + (d.headline || "")).matchAll(/mais de\s+(\d{1,2})\s+anos/gi)].map(m => +m[1]);
    const over = claims.filter(n => !first || n > span);
    add("integrity", "Tempo de experiência declarado", over.length ? "fail" : "pass", over.length ? `O texto diz “mais de ${over[0]} anos”, mas a experiência mais antiga registrada é de ${first || "—"} (cerca de ${span} anos). Ajuste o texto ou inclua a experiência que comprova.` : claims.length ? "O tempo declarado é compatível com as datas." : "Nenhuma afirmação de tempo sem data.");
    const nums = []; (d.experiences || []).forEach(e => (e.activities || []).forEach(a => { if (/\d+\s?%|\bR\$\s?\d|\b\d{2,}\b(?!\s*(?:19|20)\d{2})/.test(a)) nums.push(a); }));
    add("numbers", "Resultados numéricos", nums.length ? "info" : "pass", nums.length ? `${nums.length} atividade(s) citam números. Mantenha só os que você consegue comprovar numa entrevista.` : "Nenhum número a comprovar.");
    const sk = d.skills || []; const dup = sk.filter((s, i) => sk.findIndex(x => U.norm(x) === U.norm(s)) !== i);
    add("skills", "Lista de competências", sk.length === 0 ? "fail" : dup.length ? "warn" : sk.length < 5 ? "warn" : sk.length > 25 ? "warn" : "pass", sk.length === 0 ? "Sem competências." : dup.length ? `Repetidas: ${[...new Set(dup)].join(", ")}.` : sk.length < 5 ? `${sk.length} competências. Entre 5 e 25 dá contexto sem poluir.` : sk.length > 25 ? `${sk.length} competências. Acima de 25 parece lista de palavras-chave.` : `${sk.length} competências.`);
    const all = Resume.toText(d, {});
    const freq = {}; U.words(all).filter(w => w.length > 5).forEach(w => freq[w] = (freq[w] || 0) + 1);
    const rep = Object.entries(freq).filter(([, n]) => n > 6).map(([w]) => w);
    add("repetition", "Repetição de palavras", rep.length ? "warn" : "pass", rep.length ? `Muito repetidas: ${rep.slice(0, 5).join(", ")}. Repetição artificial é penalizada por recrutadores.` : "Sem repetição excessiva.");
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(all);
    add("ats", "Legível por sistemas de recrutamento", emoji ? "warn" : "pass", emoji ? "Há emojis ou símbolos especiais; alguns sistemas não leem." : "Texto simples, sem tabelas, imagens ou emojis.");
    const scoreable = items.filter(i => i.status !== "info");
    const score = Math.round(scoreable.reduce((s, i) => s + (i.status === "pass" ? 1 : i.status === "warn" ? .5 : 0), 0) / scoreable.length * 100);
    return { items, score };
  },

  /* Sugestões editoriais: sempre antes/depois/motivo, nunca criam fatos */
  suggestions(d) {
    const out = [];
    const push = (path, label, before, after, reason) => { if (before !== after) out.push({ id: path + ":" + U.norm(before).slice(0, 40), path, label, before, after, reason }); };
    const first = Math.min(...(d.experiences || []).map(e => Resume.year(e.start)).filter(Boolean));
    if (isFinite(first) && d.summary) {
      const span = new Date().getFullYear() - first;
      const fixed = d.summary.replace(/(com\s+)?mais de\s+(\d{1,2})\s+anos de experi[eê]ncia(\s+profissional)?/gi, (m, com, n) => +n > span ? `${com || ""}experiência profissional desde ${first}` : m);
      push("summary", "Resumo", d.summary, fixed, `Integridade: a afirmação de tempo não fecha com as datas (experiência mais antiga: ${first}).`);
    }
    if (d.summary && /\s{2,}|\s+[,.]/.test(d.summary)) push("summary", "Resumo", d.summary, d.summary.replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1"), "Espaços e pontuação.");
    (d.experiences || []).forEach((e, ei) => {
      (e.activities || []).forEach((a, ai) => {
        let n = a.replace(/^(eu\s+)?(fui\s+)?respons[aá]vel\s+(por|pela|pelo)\s+/i, "");
        if (n !== a) { n = n.charAt(0).toUpperCase() + n.slice(1); push(`experiences.${ei}.activities.${ai}`, `${e.org}: atividade`, a, n, "Começar pela ação deixa a atividade mais direta. O conteúdo não muda."); }
        else if (/[a-zà-ú]$/.test(a.trim()) === false && /\.$/.test(a.trim())) push(`experiences.${ei}.activities.${ai}`, `${e.org}: atividade`, a, a.trim().replace(/\.$/, ""), "Itens de lista não precisam de ponto final; deixa o padrão uniforme.");
      });
      if (e.end && /^(atual|presente|hoje)$/i.test(e.end) && e.end !== "atual") push(`experiences.${ei}.end`, `${e.org}: período`, e.end, "atual", "Padronizar o período.");
    });
    const sk = d.skills || [];
    const dedup = sk.filter((s, i) => sk.findIndex(x => U.norm(x) === U.norm(s)) === i);
    if (dedup.length !== sk.length) push("skills", "Competências", sk.join(" • "), dedup.join(" • "), "Remover competências repetidas.");
    return out;
  },
  applySuggestion(d, s) {
    const c = JSON.parse(JSON.stringify(d));
    if (s.path === "summary") c.summary = s.after;
    else if (s.path === "skills") c.skills = s.after.split(" • ").filter(Boolean);
    else { const p = s.path.split("."); let o = c; for (let i = 0; i < p.length - 1; i++) o = o[isNaN(p[i]) ? p[i] : +p[i]]; o[isNaN(p.at(-1)) ? p.at(-1) : +p.at(-1)] = s.after; }
    return c;
  },
  /* Versão direcionada: só reordena e destaca o que já existe */
  tailor(d, job) {
    const c = JSON.parse(JSON.stringify(d));
    const jt = Keywords.jobTerms(job).map(t => t.term);
    const rel = text => TAXONOMY.filter(t => jt.includes(t.term) && termIn(text, t)).length;
    const changes = [];
    const beforeSkills = c.skills.join(" • ");
    c.skills = [...c.skills].sort((a, b) => rel(b) - rel(a));
    if (c.skills.join(" • ") !== beforeSkills) changes.push({ field: "Competências", before: beforeSkills, after: c.skills.join(" • "), reason: "Competências ligadas aos requisitos da vaga vêm primeiro." });
    c.experiences.forEach(e => { const b = e.activities.join(" | "); e.activities = [...e.activities].sort((x, y) => rel(y) - rel(x)); if (e.activities.join(" | ") !== b) changes.push({ field: `${e.org}: atividades`, before: b, after: e.activities.join(" | "), reason: "Atividades relacionadas à vaga vêm primeiro dentro da mesma experiência." }); });
    changes.push({ field: "Objetivo", before: c.headline || "(vazio)", after: `${job.title}`, reason: "Título alinhado ao cargo anunciado. Nenhuma experiência, data ou competência foi criada." });
    return { data: c, objective: job.title, changes };
  },
  diffLines(a, b) {
    const A = a.split("\n"), B = b.split("\n"), n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out = []; let i = 0, j = 0;
    while (i < n && j < m) { if (A[i] === B[j]) { out.push(["=", A[i]]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) out.push(["-", A[i++]]); else out.push(["+", B[j++]]); }
    while (i < n) out.push(["-", A[i++]]); while (j < m) out.push(["+", B[j++]]);
    return out;
  },
};

/* ---------------- motor de palavras-chave ---------------- */
const Keywords = {
  jobTerms(job) { const text = `${job.title} ${job.description || ""} ${(job.requirements || []).join(" ")} ${(job.niceToHave || []).join(" ")}`; return TAXONOMY.filter(t => termIn(text, t)); },
  requiredTerms(job) { const text = `${(job.requirements || []).join(" ")}`; return TAXONOMY.filter(t => termIn(text, t)); },
  evidence(userId, d) {
    const segs = Resume.segments(d || Resume.empty());
    const claims = Repo.find("keyword_claims", c => c.userId === userId);
    const map = {};
    TAXONOMY.forEach(t => {
      const backed = segs.find(s => s.backed && termIn(s.text, t));
      const loose = segs.find(s => !s.backed && termIn(s.text, t));
      const claim = claims.find(c => c.term === t.term);
      let state = "ausente", ev = null, origin = null;
      if (backed) { state = "sustentado"; ev = backed.text; origin = backed.where; }
      else if (claim && claim.confirmed && claim.evidence) { state = "sustentado"; ev = claim.evidence; origin = "Declarado por você"; }
      else if (claim || loose) { state = "confirmar"; ev = claim ? (claim.evidence || "Você indicou ter essa competência, falta descrever onde a usou.") : loose.text; origin = claim ? "Declarado por você" : loose.where + " (sem experiência que comprove)"; }
      map[t.term] = { ...t, state, evidence: ev, origin };
    });
    return map;
  },
  families(ev) {
    return FAMILIES.map(f => { const terms = TAXONOMY.filter(t => t.fam.includes(f.key)); const ok = terms.filter(t => ev[t.term].state === "sustentado"); return { ...f, total: terms.length, matched: ok.map(t => t.term), pct: U.pct(ok.length, terms.length) }; }).sort((a, b) => b.pct - a.pct);
  },
};

/* ---------------- curadoria e aderência ---------------- */
const DEFAULT_WEIGHTS = { skills: 40, role: 20, location: 15, modality: 10, level: 10, recency: 5 };
const DIM_LABEL = { skills: "Competências", role: "Cargo-alvo", location: "Localização", modality: "Modalidade", level: "Nível e requisitos", recency: "Recência" };
const Match = {
  weights() { return Object.assign({}, DEFAULT_WEIGHTS, Repo.setting("weights", {})); },
  jobStatus(job) {
    if (job.duplicateOf) return { key: "dup", label: "Duplicata", cls: "" };
    if (job.status === "expired" || (job.deadline && job.deadline < U.today())) return { key: "expired", label: "Expirada / indisponível", cls: "bad" };
    if (!job.lastCheckedAt) return { key: "unverified", label: "Não verificada", cls: "warn" };
    if (U.daysBetween(job.lastCheckedAt, U.now()) > 14) return { key: "stale", label: `Verificada há ${U.daysBetween(job.lastCheckedAt, U.now())} dias`, cls: "warn" };
    return { key: "ok", label: `Verificada em ${U.fmtDate(job.lastCheckedAt)}`, cls: "ok" };
  },
  score(profile, ev, job) {
    const w = Match.weights(); const dims = {}; const notes = [];
    const jt = Keywords.jobTerms(job); const req = Keywords.requiredTerms(job);
    const sust = jt.filter(t => ev[t.term]?.state === "sustentado");
    const confirm = jt.filter(t => ev[t.term]?.state === "confirmar");
    dims.skills = jt.length ? (sust.length + confirm.length * .3) / Math.max(jt.length, 4) : .4; // mínimo de 4 termos evita nota alta em anúncio vago
    const roles = (profile.targetRoles || []).map(U.norm);
    const titleSim = Math.max(0, ...roles.map(r => U.jaccard(r, job.title)));
    const famHit = (profile.families || []).includes(job.family);
    dims.role = Math.min(1, Math.max(titleSim * 1.6, famHit ? .7 : 0));
    const city = U.norm(job.city), uf = U.norm(job.uf);
    dims.location = job.modality === "Remoto" ? 1 : city === U.norm(profile.city) ? 1 : (profile.city2 && city === U.norm(profile.city2)) ? .8 : uf && uf === U.norm(profile.uf) ? .45 : 0;
    const mods = profile.modalities || [];
    dims.modality = !job.modality || job.modality === "Não informada" ? .5 : mods.includes(job.modality) ? 1 : 0;
    let lvl = (profile.levels || []).includes(job.level) ? 1 : .4;
    if (job.minSemester && profile.semester && profile.semester < job.minSemester) { lvl = 0; notes.push(`Exige a partir do ${job.minSemester}º semestre; você está no ${profile.semester}º.`); }
    if (job.maxSemester && profile.semester && profile.semester > job.maxSemester) { lvl = 0; notes.push(`Aceita até o ${job.maxSemester}º semestre.`); }
    dims.level = lvl;
    const age = job.publishedAt ? U.daysBetween(job.publishedAt, U.now()) : 60;
    dims.recency = age <= 7 ? 1 : age <= 30 ? .6 : .2;
    if (profile.salaryMin && (job.salaryMax || job.salaryMin) && (job.salaryMax || job.salaryMin) < profile.salaryMin) notes.push(`Salário informado (${salaryText(job)}) abaixo do mínimo que você indicou. No piloto, a vaga continua aparecendo.`);
    const total = Object.values(w).reduce((a, b) => a + b, 0) || 1;
    const score = Math.round(Object.entries(w).reduce((s, [k, v]) => s + v * (dims[k] || 0), 0) / total * 100);
    const missingReq = req.filter(t => ev[t.term]?.state !== "sustentado");
    return { score, dims, matched: sust.map(t => t.term), toConfirm: confirm.map(t => t.term), gaps: jt.filter(t => ev[t.term]?.state === "ausente").map(t => t.term), missingRequired: missingReq.map(t => t.term), notes, blocking: lvl === 0 };
  },
  /* Deduplicação por URL canônica, identificador da fonte e similaridade */
  findDuplicate(job, list) {
    const canon = job.url ? U.canonicalUrl(job.url) : "";
    return list.find(o => o.id !== job.id && !o.duplicateOf && ((canon && o.url && U.canonicalUrl(o.url) === canon) || (job.sourceId && job.externalId && o.sourceId === job.sourceId && o.externalId === job.externalId) || (U.norm(o.company) === U.norm(job.company) && U.norm(o.city) === U.norm(job.city) && U.jaccard(o.title, job.title) >= .85))) || null;
  },
  dedupeAll() { const jobs = Repo.all("jobs"); jobs.forEach(j => j.duplicateOf = null); jobs.forEach(j => { const d = Match.findDuplicate(j, jobs.filter(x => x.createdAt <= j.createdAt && x.id !== j.id)); if (d) j.duplicateOf = d.id; }); Repo.save(); },
};

/* ---------------- planos e consumo ---------------- */
const PLANS_DEFAULT = [
  { key: "gratis", name: "Grátis", price: 0, limit: 0 },
  { key: "inicial", name: "Inicial", price: 19.9, limit: 100 },
  { key: "plus", name: "Plus", price: 29.9, limit: 200 },
  { key: "max", name: "Max", price: 39.9, limit: 500, features: ["envio", "respostas"] },
];
const Plans = {
  list() { const saved = Repo.setting("plans", PLANS_DEFAULT); return PLANS_DEFAULT.map(d => ({ ...d, ...(saved.find(x => x.key === d.key) || {}), features: d.features || [] })); },
  pitch(p) {
    if (!p.limit) return "Currículo revisado e pronto para recrutadores e sistemas de IA. Sem vagas.";
    const base = `Até ${p.limit} vagas por mês, entregues de uma vez, escolhidas pelo seu currículo`;
    return (p.features || []).includes("envio") ? base + ", com envio facilitado para as empresas e Central de Respostas." : base + ".";
  },
  has(userId, feature) { return (Plans.of(userId).features || []).includes(feature); },
  of(userId) { const s = Repo.one("subscriptions", x => x.userId === userId && x.status === "ativa"); const p = Plans.list().find(p => p.key === (s?.plan || "gratis")) || Plans.list()[0]; return { ...p, sub: s }; },
  used(userId, month = U.month()) { return new Set(Repo.find("usage_events", e => e.userId === userId && e.type === "oportunidade_entregue" && e.month === month).map(e => e.jobId)).size; },
  deliver(userId, jobId) {
    const month = U.month(); const key = `${userId}|${jobId}|${month}`;
    if (Repo.one("usage_events", e => e.key === key)) return true;                // idempotente: já contada
    const p = Plans.of(userId); if (Plans.used(userId) >= p.limit) return false;   // limite atingido
    Repo.insert("usage_events", { userId, jobId, type: "oportunidade_entregue", month, key }); return true;
  },
};

/* ---------------- candidaturas: estados do PRD §19 ---------------- */
const APP_STATES = ["Vaga encontrada", "Em verificação", "Selecionada", "Preparando currículo", "Pronta para revisão", "Aguardando ação do candidato", "Envio tentado — sem confirmação", "Candidatura enviada — confirmada", "Aguardando resposta", "Resposta recebida", "Entrevista agendada", "Processo encerrado", "Vaga expirada/indisponível", "Descartada"];
const NEEDS_PROOF = ["Candidatura enviada — confirmada", "Aguardando resposta", "Resposta recebida", "Entrevista agendada"];
const APP_COLUMNS = [
  { name: "Preparação", states: ["Vaga encontrada", "Em verificação", "Selecionada", "Preparando currículo", "Pronta para revisão"] },
  { name: "Sua ação", states: ["Aguardando ação do candidato", "Envio tentado — sem confirmação"] },
  { name: "Enviadas", states: ["Candidatura enviada — confirmada", "Aguardando resposta", "Resposta recebida", "Entrevista agendada"] },
  { name: "Encerradas", states: ["Processo encerrado", "Vaga expirada/indisponível", "Descartada"] },
];
function stateTone(s) { if (NEEDS_PROOF.includes(s)) return "ok"; if (["Aguardando ação do candidato", "Envio tentado — sem confirmação"].includes(s)) return "warn"; if (["Vaga expirada/indisponível", "Descartada", "Processo encerrado"].includes(s)) return ""; return "info"; }

function audit(action, target, detail) { const s = App.session(); Repo.insert("audit_events", { actorId: s?.id || null, actorName: s?.name || "sistema", role: s?.role || "-", action, target: target || "", detail: detail || "" }); }
function notify(userId, title, body, kind = "info", link = "") { const pref = Repo.one("notification_preferences", p => p.userId === userId); if (pref && pref.inApp === false) return; Repo.insert("notifications", { userId, title, body, kind, link, read: false }); }
