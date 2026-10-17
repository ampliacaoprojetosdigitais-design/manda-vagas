/* =====================================================================
   PAINEL ADMINISTRATIVO
   ===================================================================== */
const Adm = {
  candidates() { return Repo.find("users", u => u.role === "candidate"); },
  dist(list, key, label = x => x) { const m = {}; list.forEach(u => { const k = u[key] ?? null; const kk = k === null || k === "" ? "Não informado" : label(k); m[kk] = (m[kk] || 0) + 1; }); return Object.entries(m).sort((a, b) => (a[0] === "Não informado") - (b[0] === "Não informado") || b[1] - a[1]); },
  bars(rows, total) { const max = Math.max(1, ...rows.map(r => r[1])); return `<div class="bars">${rows.map(([k, v]) => `<div class="bar-row"><span class="small">${e(k)}</span><div class="track"><div class="fill ${k === "Não informado" ? "missing" : ""}" style="width:${v / max * 100}%"></div></div><span class="small num" style="text-align:right">${v}</span></div>`).join("")}</div><p class="xs muted" style="margin-top:8px">Total: ${total}. “Não informado” aparece de propósito: não inferimos dados ausentes.</p>`; },
};

Views["admin.dashboard"] = () => {
  const us = Adm.candidates(); const n = us.length;
  const new30 = us.filter(u => U.daysBetween(u.createdAt, U.now()) <= 30).length;
  const act7 = us.filter(u => u.lastActiveAt && U.daysBetween(u.lastActiveAt, U.now()) <= 7).length;
  const withResume = us.filter(u => u.synthetic ? u.resumeComplete : !!Repo.one("resumes", r => r.userId === u.id)).length;
  const withApp = us.filter(u => u.synthetic ? u.appsCount > 0 : Repo.find("applications", a => a.userId === u.id).length > 0).length;
  const delivered = Repo.find("usage_events", x => x.month === U.month()).length;
  const jobs = Repo.all("jobs"); const active = jobs.filter(j => Match.jobStatus(j).key === "ok" || Match.jobStatus(j).key === "stale").length;
  const subs = Repo.all("subscriptions").filter(x => x.status === "ativa");
  const funnel = [["Cadastrados", n], ["Com currículo", withResume], ["Com candidatura registrada", withApp]];
  return `${C.head("Métricas", "Visão geral", "Contagens agregadas. Nenhum dado de currículo é exibido aqui.", Repo.data.demo ? C.pill("Inclui usuários demonstrativos", "demo") : "")}
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card stat"><span class="k">Usuários (candidatos)</span><span class="v num">${n}</span><span class="s">+${new30} nos últimos 30 dias</span></div>
    <div class="card stat"><span class="k">Ativos em 7 dias</span><span class="v num">${act7}</span><span class="s">${U.pct(act7, n)}% da base</span></div>
    <div class="card stat"><span class="k">Conversão para currículo</span><span class="v num">${U.pct(withResume, n)}%</span><span class="s">${withResume} de ${n}</span></div>
    <div class="card stat"><span class="k">Oportunidades entregues no mês</span><span class="v num">${delivered}</span><span class="s">${active} vagas ativas no catálogo</span></div>
  </div>
  <div class="grid g2">
    <div class="card"><h2 style="margin-bottom:12px">Funil</h2>${Adm.bars(funnel, n)}</div>
    <div class="card"><h2 style="margin-bottom:12px">Planos ativos</h2>${Adm.bars(Plans.list().map(p => [p.name, subs.filter(x => x.plan === p.key).length]), subs.length)}</div>
    <div class="card"><h2 style="margin-bottom:12px">Cidade / UF</h2>${Adm.bars(Adm.dist(us.map(u => ({ ...u, cu: u.city ? `${u.city}/${u.uf}` : null })), "cu").slice(0, 9), n)}</div>
    <div class="card"><h2 style="margin-bottom:12px">Área profissional</h2>${Adm.bars(Adm.dist(us, "area"), n)}</div>
    <div class="card"><h2 style="margin-bottom:12px">Origem de aquisição</h2>${Adm.bars(Adm.dist(us, "origin"), n)}</div>
    <div class="card"><h2 style="margin-bottom:12px">Faixa etária (informada pelo usuário)</h2>${Adm.bars(Adm.dist(us, "ageRange"), n)}</div>
  </div>`;
};

Views["admin.users"] = () => {
  const q = U.norm(App.ui.userQ || ""); const list = Repo.all("users").filter(u => !q || U.norm(`${u.name} ${u.email} ${u.city}`).includes(q)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return `${C.head("Operação", "Usuários", "Dados de cadastro e uso. Currículo e candidaturas não aparecem para a equipe. Abrir um usuário gera registro de auditoria.")}
  <div class="card" style="margin-bottom:12px"><div class="field"><label for="us-q">Buscar por nome, e-mail ou cidade</label>${C.input("us-q", App.ui.userQ || "", 'data-input="userQ"')}</div></div>
  <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Cidade</th><th>Plano</th><th>Papel</th><th>Status</th><th>Cadastro</th><th></th></tr></thead><tbody>
  ${list.slice(0, 80).map(u => `<tr><td><b>${e(u.name)}</b>${u.synthetic ? " " + C.pill("demo", "demo") : u.demoAccount ? " " + C.pill("conta demo", "demo") : ""}<div class="xs muted">${e(u.email)}</div></td><td class="small">${e(u.city ? u.city + "/" + u.uf : "Não informado")}</td><td class="small">${u.role === "candidate" ? e(Plans.of(u.id).name) : "—"}</td><td>${C.pill(u.role === "admin" ? "Admin" : "Candidato", u.role === "admin" ? "info" : "")}</td><td>${C.pill(u.status, u.status === "ativo" ? "ok" : "bad")}</td><td class="small num">${U.fmtDate(u.createdAt)}</td><td><button class="btn btn-ghost btn-sm" data-act="viewUser" data-id="${e(u.id)}">Abrir</button></td></tr>`).join("")}
  </tbody></table></div>${list.length > 80 ? `<p class="small muted">Mostrando 80 de ${list.length}. Refine a busca.</p>` : ""}`;
};

Views["admin.sources"] = () => {
  const src = Repo.all("job_sources");
  return `${C.head("Operação", "Fontes de vagas", "Só usamos fontes autorizadas ou anúncios públicos cadastrados à mão, com link individual. Sincronização automática depende de integração.", `<button class="btn btn-primary" data-act="newSource">+ Fonte</button>`)}
  ${C.notice("<b>Próxima fase: descoberta diária.</b> As fontes marcadas como “planejada” formam as quatro camadas (agregadores, ATS, sites oficiais, consultorias e canais públicos). Quando conectadas, um robô agendado busca vagas novas todo dia, deduplica e marca as encerradas. Nesta fase o catálogo é demonstrativo + cadastro manual.", "info")}<div style="height:12px"></div>
  <div class="table-wrap"><table><thead><tr><th>Fonte</th><th>Tipo</th><th>Autorização e termos</th><th>Vagas</th><th>Última sincronização</th><th></th></tr></thead><tbody>
  ${src.map(x => `<tr><td><b>${e(x.name)}</b>${x.url ? `<div class="xs mono muted">${e(x.url)}</div>` : ""}</td><td>${C.pill(x.type)}${x.planned ? `<div style="margin-top:4px">${C.pill("Planejada", "warn")}</div>` : ""}</td><td class="small">${x.authorized ? C.pill("Autorizada", "ok") : C.pill("Sem autorização de API", "warn")}<div class="xs muted" style="margin-top:4px">${e(x.terms)}</div></td><td class="num">${Repo.find("jobs", j => j.sourceId === x.id).length}</td><td class="small">${x.lastSync ? U.fmtDateTime(x.lastSync) : "Nunca"}</td><td><div class="row" style="gap:4px"><button class="btn btn-ghost btn-sm" data-act="syncSource" data-id="${e(x.id)}">Sincronizar</button><button class="btn btn-ghost btn-sm" data-act="editSource" data-id="${e(x.id)}">Editar</button></div></td></tr>`).join("")}
  </tbody></table></div>`;
};

Views["admin.jobs"] = () => {
  const f = App.ui.admJobF || "todas"; const q = U.norm(App.ui.admJobQ || "");
  const all = Repo.all("jobs").slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const by = { todas: () => true, ativas: j => ["ok", "stale"].includes(Match.jobStatus(j).key), nao: j => Match.jobStatus(j).key === "unverified", exp: j => Match.jobStatus(j).key === "expired", dup: j => !!j.duplicateOf, reais: j => !j.isDemo };
  const list = all.filter(by[f]).filter(j => !q || U.norm(`${j.title} ${j.company} ${j.city}`).includes(q));
  const cnt = k => all.filter(by[k]).length;
  return `${C.head("Operação", "Vagas", "Cada vaga apresentada como real precisa de link individual, fonte e data de verificação. Duplicatas não contam como novas oportunidades.", `<button class="btn btn-ghost" data-act="importPilot">Importar lote-piloto real</button><button class="btn btn-ghost" data-act="importJobs">Importar JSON</button><button class="btn btn-primary" data-act="newJob">+ Vaga</button>`)}
  <div class="row-between" style="margin-bottom:12px">${C.tabs(f, [["todas", `Todas (${cnt("todas")})`], ["ativas", `Ativas (${cnt("ativas")})`], ["nao", `Não verificadas (${cnt("nao")})`], ["exp", `Expiradas (${cnt("exp")})`], ["dup", `Duplicatas (${cnt("dup")})`], ["reais", `Reais (${cnt("reais")})`]], "admJobF")}<div style="min-width:220px">${C.input("aj-q", App.ui.admJobQ || "", 'placeholder="Buscar" aria-label="Buscar vagas" data-input="admJobQ"')}</div></div>
  <div class="table-wrap"><table><thead><tr><th>Vaga</th><th>Local</th><th>Fonte</th><th>Status</th><th>Verificação</th><th></th></tr></thead><tbody>
  ${list.map(j => { const st = Match.jobStatus(j); const dup = j.duplicateOf ? Repo.get("jobs", j.duplicateOf) : null; return `<tr><td><b>${e(j.title)}</b><div class="xs muted">${e(j.company)} · ${e(j.level)}</div>${dup ? `<div class="xs" style="color:var(--warn)">Duplicata de: ${e(dup.title)} (${e(dup.id)})</div>` : ""}</td><td class="small">${e(j.city)}/${e(j.uf)}<div class="xs muted">${e(j.modality)}</div></td><td class="small">${C.demoPill(j)}<div class="xs muted" style="margin-top:3px">${e(j.source)}</div>${j.url ? `<a class="xs" href="${e(j.url)}" target="_blank" rel="noopener noreferrer">link ↗</a>` : ""}</td><td>${C.pill(st.label, st.cls)}</td><td class="small num">${U.fmtDate(j.lastCheckedAt)}</td><td><div class="row" style="gap:4px;justify-content:flex-end"><button class="btn btn-soft btn-sm" data-act="verifyJob" data-id="${e(j.id)}">Verificada hoje</button><button class="btn btn-ghost btn-sm" data-act="expireJob" data-id="${e(j.id)}">${j.status === "expired" ? "Reativar" : "Expirar"}</button><button class="btn btn-ghost btn-sm" data-act="editJob" data-id="${e(j.id)}">Editar</button></div></td></tr>`; }).join("") || `<tr><td colspan="6">${C.empty("Nenhuma vaga neste filtro", "")}</td></tr>`}
  </tbody></table></div>`;
};

function JobForm(j = {}) {
  return `<form class="stack" id="job-form" novalidate><div class="form-grid">
    <div class="full">${C.field("jb-title", "Cargo anunciado *", C.input("jb-title", j.title || "", "required"))}</div>
    ${C.field("jb-company", "Empresa *", C.input("jb-company", j.company || "", "required"))}
    ${C.field("jb-source", "Fonte", C.select("jb-source", Repo.all("job_sources").map(s => [s.id, s.name]), j.sourceId || "src_manual"))}
    ${C.field("jb-city", "Cidade *", C.input("jb-city", j.city || "São Paulo"))}
    ${C.field("jb-uf", "UF", C.input("jb-uf", j.uf || "SP", 'maxlength="2"'))}
    ${C.field("jb-mod", "Modalidade", C.select("jb-mod", ["Presencial", "Híbrido", "Remoto", "Não informada"], j.modality || "Não informada"))}
    ${C.field("jb-level", "Nível", C.select("jb-level", ["Jovem aprendiz", "Estágio", "Assistente/Auxiliar", "Júnior", "Pleno"], j.level || "Estágio"))}
    ${C.field("jb-fam", "Área", C.select("jb-fam", FAMILIES.map(f => [f.key, f.name]), j.family || "juridico"))}
    ${C.field("jb-salmin", "Salário mínimo (R$)", C.input("jb-salmin", j.salaryMin || "", 'type="number" min="0" step="50"'), "Vazio = a combinar.")}
    ${C.field("jb-salmax", "Salário máximo (R$)", C.input("jb-salmax", j.salaryMax || "", 'type="number" min="0" step="50"'))}
    ${C.field("jb-size", "Porte da empresa", C.select("jb-size", COMPANY_SIZES, j.companySize || "Não informado"))}
    ${C.field("jb-minsem", "Semestre mínimo (estágio)", C.input("jb-minsem", j.minSemester || "", 'type="number" min="1" max="12"'))}
    <div class="full">${C.field("jb-url", "Link individual do anúncio *", C.input("jb-url", j.url || "", 'type="url" placeholder="https://..."'), "Página de busca ou lista geral não vale como link individual.")}</div>
    ${C.field("jb-pub", "Publicação", C.input("jb-pub", j.publishedAt || "", 'type="date"'))}
    ${C.field("jb-deadline", "Prazo", C.input("jb-deadline", j.deadline || "", 'type="date"'))}
    <div class="full">${C.field("jb-req", "Requisitos (um por linha)", C.textarea("jb-req", (j.requirements || []).join("\n"), 'rows="3"'))}</div>
    <div class="full">${C.field("jb-nice", "Desejáveis (um por linha)", C.textarea("jb-nice", (j.niceToHave || []).join("\n"), 'rows="2"'))}</div>
    <div class="full">${C.field("jb-desc", "Resumo com suas palavras", C.textarea("jb-desc", j.description || "", 'rows="3"'), "Não copie o anúncio inteiro. Resuma e mantenha o link.")}</div>
    <label class="check full"><input type="checkbox" id="jb-verified" ${j.lastCheckedAt ? "checked" : ""}> Conferi o anúncio hoje: o link abre a vaga específica e as inscrições estão abertas.</label>
  </div></form>`;
}

Views["admin.editorial"] = () => {
  const drafts = Repo.all("content_drafts").slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const eligible = Repo.all("jobs").filter(j => !j.duplicateOf && Match.jobStatus(j).key === "ok");
  const tone = { "Rascunho": "", "Em revisão": "warn", "Aprovado": "ok", "Publicado manualmente": "info", "Rejeitado": "bad" };
  return `${C.head("Operação", "Editorial", "Transforme vagas verificadas em pautas e carrosséis. Só a equipe vê esta área. Toda publicação passa por revisão humana.")}
  <div class="grid g-main"><div class="card"><div class="card-head"><h2>Rascunhos</h2><span class="pill">${drafts.length}</span></div>
    ${drafts.length ? drafts.map(d => `<div class="sunken stack-sm" style="margin-bottom:10px"><div class="row-between"><b>${e(d.title)}</b>${C.pill(d.status, tone[d.status])}</div><div class="xs muted">${e(d.channel)} · ${d.jobIds.length} vaga(s) · criado ${U.rel(d.createdAt)}${d.reviewer ? " · revisado por " + e(d.reviewer) : ""}</div><div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-act="openDraft" data-id="${e(d.id)}">Abrir e revisar</button></div></div>`).join("") : C.empty("Nenhum rascunho", "Escolha vagas verificadas ao lado.")}
  </div>
  <div class="card stack"><h2>Nova pauta</h2><p class="small muted">Somente vagas verificadas nos últimos 14 dias e sem duplicatas.</p>
    <div class="stack-sm" style="max-height:300px;overflow:auto">${eligible.map(j => `<label class="check"><input type="checkbox" name="ed-job" value="${e(j.id)}"> <span><b>${e(j.title)}</b> <span class="muted small">· ${e(j.company)} · ${e(j.city)}</span> ${j.isDemo ? C.pill("demo", "demo") : ""}</span></label>`).join("") || '<p class="small muted">Nenhuma vaga elegível.</p>'}</div>
    ${C.field("ed-channel", "Canal", C.select("ed-channel", ["Carrossel Instagram", "Post LinkedIn", "Newsletter"], "Carrossel Instagram"))}
    <button class="btn btn-primary" data-act="newDraft">Gerar rascunho</button>
    ${C.notice("O rascunho resume com palavras próprias, cita a fonte e guarda link e data de verificação. Não copia o anúncio.", "info")}
  </div></div>`;
};
function draftFromJobs(jobs, channel) {
  const slides = [`Vagas da semana em ${[...new Set(jobs.map(j => j.city))].join(", ")}`];
  jobs.forEach(j => slides.push(`${j.title}\n${j.company} · ${j.city} · ${j.modality}\nO que pedem: ${(j.requirements || []).slice(0, 2).join("; ")}\nVerificada em ${U.fmtDate(j.lastCheckedAt)}`));
  slides.push("Antes de se candidatar: ajuste o currículo para cada vaga, sem inventar experiência.\nLinks e datas na legenda.");
  const caption = `Separamos ${jobs.length} vaga(s) verificada(s) para quem está começando na área jurídica.\n\n${jobs.map(j => `• ${j.title} — ${j.company} (${j.city})\n  Fonte: ${j.source}${j.url ? " · " + j.url : " · vaga demonstrativa"}\n  Verificada em ${U.fmtDate(j.lastCheckedAt)}`).join("\n")}\n\nO Manda Vaga não representa as empresas. Confira sempre o anúncio original.`;
  return { title: `${channel}: ${jobs.length} vaga(s) — ${U.fmtDate(U.now())}`, channel, jobIds: jobs.map(j => j.id), slides, caption, sources: jobs.map(j => ({ id: j.id, source: j.source, url: j.url, checked: j.lastCheckedAt })), status: "Rascunho", notes: "", reviewer: "" };
}

Views["admin.plans"] = () => {
  const plans = Plans.list(); const subs = Repo.all("subscriptions");
  const ev = Repo.all("usage_events").slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const byUser = {}; ev.filter(x => x.month === U.month()).forEach(x => byUser[x.userId] = (byUser[x.userId] || 0) + 1);
  const near = Object.entries(byUser).map(([uid, n]) => ({ u: Repo.get("users", uid), n, p: Plans.of(uid) })).filter(x => x.u && x.n / x.p.limit >= .8);
  return `${C.head("Gestão", "Planos, limites e uso", "Limites valem por oportunidade única por mês. A chave de idempotência usuário+vaga+mês impede contagem dupla.")}
  ${C.notice("Pagamentos reais não estão conectados: assinaturas são simuladas.", "warn", "!")}
  <form class="card stack" style="margin-top:14px" data-form="plans" novalidate><h2>Configuração dos planos</h2>
    <div class="table-wrap"><table><thead><tr><th>Plano</th><th>Preço (R$)</th><th>Oportunidades/mês</th><th class="num">Assinantes</th></tr></thead><tbody>${plans.map((p, i) => `<tr><td><b>${e(p.name)}</b></td><td><input class="input" style="max-width:120px" name="pl-price-${i}" aria-label="Preço ${e(p.name)}" type="number" step="0.1" min="0" value="${p.price}"></td><td><input class="input" style="max-width:120px" name="pl-limit-${i}" aria-label="Limite ${e(p.name)}" type="number" min="1" value="${p.limit}"></td><td class="num">${subs.filter(s => s.plan === p.key && s.status === "ativa").length}</td></tr>`).join("")}</tbody></table></div>
    <div><button class="btn btn-primary" type="submit">Salvar planos</button></div></form>
  <div class="grid g2" style="margin-top:16px"><div class="card"><h2 style="margin-bottom:10px">Perto do limite (≥ 80%)</h2>${near.map(x => `<div class="row-between small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>${e(x.u.name)} · ${e(x.p.name)}</span><span class="num">${x.n}/${x.p.limit}</span></div>`).join("") || '<p class="small muted">Ninguém.</p>'}</div>
  <div class="card"><h2 style="margin-bottom:10px">Eventos de uso recentes</h2>${ev.slice(0, 10).map(x => `<div class="row-between xs" style="padding:5px 0;border-bottom:1px solid var(--line)"><span class="mono">${e(x.key)}</span><span class="muted">${U.fmtDate(x.createdAt)}</span></div>`).join("")}</div></div>`;
};

Views["admin.privacy"] = () => {
  const reqs = Repo.all("privacy_requests").slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const au = Repo.all("audit_events").slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 60);
  return `${C.head("Gestão", "Privacidade e auditoria", "Pedidos dos titulares de dados e registro de ações sensíveis.")}
  <div class="card" style="margin-bottom:16px"><h2 style="margin-bottom:10px">Pedidos de titulares</h2>
  <div class="table-wrap"><table><thead><tr><th>Usuário</th><th>Tipo</th><th>Detalhe</th><th>Status</th><th>Aberto</th><th></th></tr></thead><tbody>${reqs.map(r => `<tr><td>${e(r.userName)}</td><td>${e(r.type)}</td><td class="small">${e(r.note)}</td><td>${C.pill(r.status, r.status === "concluída" ? "ok" : "warn")}</td><td class="small">${U.fmtDate(r.createdAt)}</td><td>${r.status !== "concluída" ? `<button class="btn btn-soft btn-sm" data-act="resolvePrivacy" data-id="${e(r.id)}">Concluir</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="6">${C.empty("Nenhum pedido", "")}</td></tr>`}</tbody></table></div></div>
  <div class="card"><h2 style="margin-bottom:10px">Auditoria</h2><div class="table-wrap"><table><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Alvo</th><th>Detalhe</th></tr></thead><tbody>${au.map(a => `<tr><td class="small num">${U.fmtDateTime(a.createdAt)}</td><td class="small">${e(a.actorName)} <span class="muted xs">(${e(a.role)})</span></td><td class="small"><b>${e(a.action)}</b></td><td class="xs mono">${e(a.target)}</td><td class="small">${e(a.detail)}</td></tr>`).join("")}</tbody></table></div></div>`;
};

Views["admin.settings"] = () => {
  const w = Match.weights();
  return `${C.head("Gestão", "Configurações", "Pesos da aderência, integrações e dados de demonstração.")}
  <div class="grid g2"><form class="card stack" data-form="weights" novalidate><h2>Pesos da aderência</h2><p class="small muted">A pontuação é uma média ponderada destas dimensões. Mudanças valem para todos imediatamente.</p>
    ${Object.keys(DIM_LABEL).map(k => `<div class="dim" style="grid-template-columns:130px minmax(0,1fr) 40px"><label for="w-${k}" class="small">${DIM_LABEL[k]}</label><input type="range" id="w-${k}" name="w-${k}" min="0" max="60" step="5" value="${w[k]}" data-change="weightLabel"><span class="num small" id="wl-${k}" style="text-align:right">${w[k]}</span></div>`).join("")}
    <div class="row"><button class="btn btn-primary" type="submit">Salvar pesos</button><button class="btn btn-ghost" type="button" data-act="resetWeights">Restaurar padrão</button></div></form>
  <div class="card stack"><h2>Integrações</h2>${Integrations.list.map(i => `<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--line);align-items:flex-start"><div class="grow"><b class="small">${e(i.name)}</b><div class="xs muted">${e(i.detail)}</div></div>${C.pill("Não conectado", "warn")}</div>`).join("")}<p class="xs muted">Os adaptadores seguem os mesmos contratos do modo local. Conectar exige configuração no servidor, sem reescrever telas.</p></div>
  <div class="card stack"><h2>Dados de demonstração</h2><p class="small muted">Restaura usuários, vagas e cenários sintéticos: positivo (Camila), incompleto (Rafael), duplicata, vaga expirada, vaga não verificada, verificação antiga e usuário perto do limite do plano.</p><button class="btn btn-danger" data-act="resetDemo">Restaurar dados de demonstração</button></div>
  <div class="card stack"><h2>Backup do banco local</h2><p class="small muted">Exporta todas as coleções em JSON, no formato que o futuro banco remoto vai receber.</p><button class="btn btn-ghost" data-act="exportDb">Exportar banco local</button></div></div>`;
};
