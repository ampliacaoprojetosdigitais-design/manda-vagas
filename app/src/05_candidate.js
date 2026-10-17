/* =====================================================================
   ÁREA DO CANDIDATO
   ===================================================================== */
const Cand = {
  profile(s) { return Repo.one("profiles", p => p.userId === s.id) || Repo.insert("profiles", { userId: s.id, city: s.city || "", uf: s.uf || "", city2: "", targetRoles: [], families: [], modalities: ["Presencial", "Híbrido", "Remoto"], levels: ["Estágio", "Assistente/Auxiliar", "Júnior"], semester: null, course: "", availability: "", salaryMin: null, minScore: 40 }); },
  resume(s) { return Repo.one("resumes", r => r.userId === s.id); },
  hasResume(s) { const r = Cand.resume(s); return !!(r && ((r.data.experiences || []).length || (r.data.skills || []).length)); },
  ev(s) { return Keywords.evidence(s.id, Cand.resume(s)?.data); },
  feedback(s) { const m = {}; Repo.find("job_feedback", f => f.userId === s.id).forEach(f => m[f.jobId] = f); return m; },
  curated(s) {
    const prof = Cand.profile(s), ev = Cand.ev(s), fb = Cand.feedback(s);
    return Repo.all("jobs").filter(j => !j.duplicateOf).map(job => ({ job, st: Match.jobStatus(job), m: Match.score(prof, ev, job), fb: fb[job.id] || null })).sort((a, b) => b.m.score - a.m.score || String(b.job.publishedAt).localeCompare(String(a.job.publishedAt)));
  },
  /* entrega: só vagas verificadas, não expiradas, acima da aderência mínima; consome o plano uma vez por vaga/mês */
  recommendations(s) {
    const prof = Cand.profile(s); const all = Cand.curated(s);
    const eligible = all.filter(x => ["ok", "stale"].includes(x.st.key) && x.m.score >= (prof.minScore || 0) && x.fb?.state !== "dispensada");
    let fresh = 0; const out = [];
    for (const x of eligible) {
      const already = !!Repo.one("usage_events", u => u.key === `${s.id}|${x.job.id}|${U.month()}`);
      const ok = Plans.deliver(s.id, x.job.id); if (ok && !already) fresh++;
      out.push({ ...x, locked: !ok });
    }
    if (fresh) notify(s.id, `${fresh} nova(s) vaga(s) compatível(is)`, "Entregues na sua área de vagas, com motivo da recomendação.", "ok", "cand.jobs");
    return out;
  },
  apps(s) { return Repo.find("applications", a => a.userId === s.id).sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt))); },
  saveVersion(s, data, label, changes = [], jobId = null, type = "base") { return Repo.insert("resume_versions", { userId: s.id, type, label, jobId, data: JSON.parse(JSON.stringify(data)), changes }); },
};

/* ---------------- Início ---------------- */
Views["cand.home"] = (s) => {
  const r = Cand.resume(s); const prof = Cand.profile(s); const has = Cand.hasResume(s);
  const reviewed = r && r.status === "revisado";
  const diag = r ? Resume.analyze(r.data) : null;
  const recs = has ? Cand.recommendations(s) : [];
  const apps = Cand.apps(s); const plan = Plans.of(s.id); const used = Plans.used(s.id);
  const sent = apps.filter(a => a.confirmed).length; const needs = apps.filter(a => ["Aguardando ação do candidato", "Envio tentado — sem confirmação"].includes(a.status)).length;
  const steps = [
    [!!(prof.targetRoles || []).length && !!prof.city, "Defina cidade e cargos-alvo", "Base para a busca", "cand.profile"],
    [has, "Monte o currículo-base", "Manual, colar texto ou .txt", "cand.resume"],
    [reviewed, "Revise o diagnóstico e marque como revisado", diag ? `Nota atual: ${diag.score}/100` : "Disponível depois do currículo", "cand.resume:diag"],
    [has && recs.length > 0, "Veja as vagas compatíveis", has ? `${recs.length} recomendadas` : "Liberado após o currículo", "cand.jobs"],
  ];
  const done = steps.filter(x => x[0]).length;
  return `${C.head("Início", `Olá, ${s.name.split(" ")[0]}`, "Primeiro o currículo, depois a curadoria, por último a entrega. Você está aqui:")}
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card stat"><span class="k">Nota do currículo</span><span class="v">${diag ? diag.score : "—"}</span><span class="s">${diag ? (diag.score >= 80 ? "Bom ponto de partida" : "Veja as sugestões") : "Sem currículo"}</span></div>
    <div class="card stat"><span class="k">Vagas entregues no mês</span><span class="v">${used}</span><span class="s">de ${plan.limit} no plano ${e(plan.name)}</span></div>
    <div class="card stat"><span class="k">Candidaturas confirmadas</span><span class="v">${sent}</span><span class="s">Só com confirmação real</span></div>
    <div class="card stat"><span class="k">Ações pendentes suas</span><span class="v">${needs}</span><span class="s">Login, teste ou envio sem confirmação</span></div>
  </div>
  <div class="grid g-main">
    <div class="card"><div class="card-head"><h2>Seu progresso</h2><span class="pill ${done === 4 ? "ok" : "info"}">${done} de 4</span></div>
      <div class="steps">${steps.map(([ok, t, sub, go], i) => `<div class="step ${ok ? "done" : ""}"><span class="n">${ok ? "✓" : i + 1}</span><div><b>${e(t)}</b><div class="small muted">${e(sub)}</div></div><button class="btn btn-sm ${ok ? "btn-ghost" : "btn-primary"}" data-go="${go}">${ok ? "Abrir" : "Fazer"}</button></div>`).join("")}</div>
    </div>
    <div class="card"><div class="card-head"><h2>Melhores vagas agora</h2><button class="btn btn-soft btn-sm" data-go="cand.jobs">Ver todas</button></div>
      ${!has ? C.empty("Currículo primeiro", "As vagas aparecem depois que o currículo-base tiver experiências ou competências.", `<button class="btn btn-primary btn-sm" data-go="cand.resume">Montar currículo</button>`) :
      recs.filter(x => !x.locked).slice(0, 3).map(x => `<div class="row" style="gap:12px;padding:10px 0;border-bottom:1px solid var(--line)">${C.score(x.m.score)}<div class="grow"><b>${e(x.job.title)}</b><div class="small muted">${e(x.job.company)} · ${e(x.job.city)} · ${e(x.job.modality)}</div><div style="margin-top:4px">${C.demoPill(x.job)}</div></div><button class="btn btn-ghost btn-sm" data-go="cand.job" data-id="${e(x.job.id)}">Detalhes</button></div>`).join("") || C.empty("Nenhuma vaga acima da sua aderência mínima", "Ajuste preferências ou a aderência mínima no perfil.")}
    </div>
  </div>
  ${apps.length ? `<div class="card" style="margin-top:16px"><div class="card-head"><h2>Próximas ações</h2><button class="btn btn-soft btn-sm" data-go="cand.apps">Candidaturas</button></div>${apps.filter(a => a.next).slice(0, 4).map(a => { const j = Repo.get("jobs", a.jobId); return `<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div><b>${e(j?.title || a.jobTitle || "Vaga")}</b><div class="small muted">${e(a.next)}</div></div>${C.pill(a.status, stateTone(a.status))}</div>`; }).join("") || '<p class="muted small">Sem ações pendentes.</p>'}</div>` : ""}`;
};

/* ---------------- Perfil e preferências ---------------- */
Views["cand.profile"] = (s) => {
  const p = Cand.profile(s); const pref = Repo.one("notification_preferences", x => x.userId === s.id) || {};
  return `${C.head("Perfil", "Perfil e preferências de busca", "Esses dados orientam a curadoria. Nada aqui entra no currículo sem você escrever.")}
  <form class="grid g-main" data-form="profile" novalidate>
    <div class="card stack"><h2>Dados e localização</h2>
      <div class="form-grid">
        ${C.field("pf-name", "Nome", C.input("pf-name", s.name, "required"))}
        ${C.field("pf-email", "E-mail", C.input("pf-email", s.email, 'type="email" required'))}
        ${C.field("pf-city", "Cidade principal", C.input("pf-city", p.city))}
        ${C.field("pf-uf", "UF", C.input("pf-uf", p.uf, 'maxlength="2"'))}
        ${C.field("pf-city2", "Cidade secundária (opcional)", C.input("pf-city2", p.city2))}
        ${C.field("pf-avail", "Disponibilidade", C.input("pf-avail", p.availability, 'placeholder="Ex.: manhã e tarde"'))}
        ${C.field("pf-course", "Curso atual (se estudante)", C.input("pf-course", p.course))}
        ${C.field("pf-sem", "Semestre atual", C.input("pf-sem", p.semester || "", 'type="number" min="1" max="12"'), "Usado para checar vagas de estágio com semestre mínimo.")}
        ${C.field("pf-stage", "Momento de carreira", C.select("pf-stage", [["", "Prefiro não informar"], "Primeiro emprego", "Em formação (estágio)", "Recolocação", "Transição de carreira", "Profissional experiente"], p.careerStage || ""))}
        ${C.field("pf-age", "Faixa etária (opcional)", C.select("pf-age", [["", "Prefiro não informar"], "16–17", "18–24", "25–34", "35–44", "45+"], s.ageRange || ""), "Só usada de forma agregada. Não afeta a pontuação.")}
        ${C.field("pf-salary", "Salário mínimo desejado (opcional)", C.input("pf-salary", p.salaryMin || "", 'type="number" min="0" step="100"'), "No piloto, todas as faixas são aceitas.")}
      </div></div>
    <div class="card stack"><h2>O que você procura</h2>
      ${C.field("pf-roles", "Cargos-alvo", C.textarea("pf-roles", (p.targetRoles || []).join("\n"), 'rows="4" placeholder="Um por linha"'), "Um por linha. Ex.: Estágio em Direito")}
      <div class="field"><span class="label">Famílias de cargo</span>${C.checks("pf-fam", FAMILIES.map(f => f.name), FAMILIES.filter(f => (p.families || []).includes(f.key)).map(f => f.name))}</div>
      <div class="field"><span class="label">Modalidade</span>${C.checks("pf-mod", ["Presencial", "Híbrido", "Remoto"], p.modalities)}</div>
      <div class="field"><span class="label">Nível</span>${C.checks("pf-lvl", ["Jovem aprendiz", "Estágio", "Assistente/Auxiliar", "Júnior", "Pleno"], p.levels)}</div>
      ${C.field("pf-min", `Aderência mínima para receber vagas: ${p.minScore || 40}%`, `<input type="range" id="pf-min" name="pf-min" min="0" max="90" step="5" value="${p.minScore || 40}" data-change="rangeLabel">`)}
    </div>
    <div class="card stack"><h2>Notificações e consentimentos</h2>
      <label class="check"><input type="checkbox" name="np-inapp" ${pref.inApp !== false ? "checked" : ""}> Avisos dentro do Manda Vaga</label>
      <label class="check"><input type="checkbox" name="np-email" ${pref.email ? "checked" : ""}> Alertas por e-mail <span class="pill warn">integração não conectada</span></label>
      <label class="check"><input type="checkbox" name="np-wa" ${pref.whatsapp ? "checked" : ""}> Alertas por WhatsApp <span class="pill warn">integração não conectada</span></label>
      <label class="check"><input type="checkbox" name="cs-mkt" ${s.consents?.marketing ? "checked" : ""}> Aceito receber novidades e ofertas (separado dos alertas de vagas)</label>
      <p class="small muted">Seu consentimento fica registrado agora. Nenhuma mensagem externa é enviada enquanto a integração não estiver ativa.</p>
    </div>
    <div class="row"><button class="btn btn-primary" type="submit">Salvar perfil</button></div>
  </form>`;
};

/* ---------------- Currículo ---------------- */
Views["cand.resume"] = (s) => {
  const tab = App.ui.resumeTab || "editor";
  const r = Cand.resume(s);
  const tabs = C.tabs(tab, [["editor", "Editor"], ["import", "Importar"], ["diag", "Diagnóstico e sugestões"], ["keywords", "Palavras-chave"], ["versions", "Versões e exportação"]], "resumeTab");
  const status = r ? (r.status === "revisado" ? C.pill("Revisado por você", "ok") : C.pill("Rascunho", "warn")) : C.pill("Sem currículo", "bad");
  let body = "";
  if (tab === "editor") body = ResumeViews.editor(s, r);
  if (tab === "import") body = ResumeViews.importer(s, r);
  if (tab === "diag") body = r ? ResumeViews.diag(s, r) : C.empty("Sem currículo", "Preencha no Editor ou importe um texto.", `<button class="btn btn-primary btn-sm" data-act="resumeTab" data-v="editor">Abrir editor</button>`);
  if (tab === "keywords") body = r ? ResumeViews.keywords(s, r) : C.empty("Sem currículo", "As palavras-chave saem do que está escrito no currículo.");
  if (tab === "versions") body = ResumeViews.versions(s, r);
  return `${C.head("Etapa 1", "Currículo inteligente e flexível", "Tudo que entra aqui vem de você. As sugestões mostram antes, depois e o motivo, e só valem se você aceitar.", status)}
  <div class="row" style="margin-bottom:16px">${tabs}</div>${body}`;
};

const ResumeViews = {
  editor(s, r) {
    const d = App.ui.resumeDraft || (r ? r.data : Resume.empty());
    const exps = d.experiences;
    const edus = d.education;
    return `<form class="stack-lg" data-form="resume" novalidate>
      ${!r ? C.notice("Comece preenchendo os campos ou use a aba <b>Importar</b> para colar o texto do seu currículo.", "info") : ""}
      <div class="card stack"><h2>Apresentação</h2>
        ${C.field("rs-headline", "Título profissional", C.input("rs-headline", d.headline, 'placeholder="Ex.: Estudante de Direito | Rotinas administrativas"'))}
        ${C.field("rs-summary", "Resumo profissional", C.textarea("rs-summary", d.summary, 'rows="5"'), "Entre 200 e 750 caracteres. Fale do que você fez, não de adjetivos.")}
      </div>
      <div class="card stack"><div class="card-head" style="margin:0"><h2>Experiência profissional</h2><button type="button" class="btn btn-soft btn-sm" data-act="addExp">+ Experiência</button></div>
        ${exps.length ? exps.map((x, i) => `<fieldset class="sunken stack" style="margin:0" data-exp="${e(x.id)}"><legend class="small muted" style="padding:0 4px">Experiência ${i + 1}</legend>
          <div class="form-grid">${C.field(`ex-org-${i}`, "Empresa / organização", C.input(`ex-org-${i}`, x.org))}${C.field(`ex-role-${i}`, "Cargo", C.input(`ex-role-${i}`, x.role))}${C.field(`ex-start-${i}`, "Início (ano)", C.input(`ex-start-${i}`, x.start, 'inputmode="numeric" placeholder="2022"'))}${C.field(`ex-end-${i}`, "Fim (ano ou “atual”)", C.input(`ex-end-${i}`, x.end, 'placeholder="atual"'))}</div>
          ${C.field(`ex-act-${i}`, "Atividades (uma por linha)", C.textarea(`ex-act-${i}`, (x.activities || []).join("\n"), 'rows="4"'))}
          <div><button type="button" class="btn btn-danger btn-sm" data-act="rmExp" data-i="${i}">Remover experiência</button></div></fieldset>`).join("") : `<p class="muted small">Nenhuma experiência. Trabalhos informais, voluntariado e projetos também contam.</p>`}
      </div>
      <div class="card stack"><div class="card-head" style="margin:0"><h2>Formação</h2><button type="button" class="btn btn-soft btn-sm" data-act="addEdu">+ Formação</button></div>
        ${edus.map((x, i) => `<div class="form-grid sunken" data-edu="${e(x.id)}">${C.field(`ed-course-${i}`, "Curso", C.input(`ed-course-${i}`, x.course))}${C.field(`ed-inst-${i}`, "Instituição", C.input(`ed-inst-${i}`, x.institution))}${C.field(`ed-status-${i}`, "Situação", C.select(`ed-status-${i}`, ["em andamento", "concluído", "trancado"], x.status))}${C.field(`ed-end-${i}`, "Conclusão (ano)", C.input(`ed-end-${i}`, x.end))}<div class="full"><button type="button" class="btn btn-danger btn-sm" data-act="rmEdu" data-i="${i}">Remover</button></div></div>`).join("") || '<p class="muted small">Nenhuma formação.</p>'}
      </div>
      <div class="grid g2">
        <div class="card stack"><h2>Competências e ferramentas</h2>${C.field("rs-skills", "Uma por linha", C.textarea("rs-skills", (d.skills || []).join("\n"), 'rows="7"'))}</div>
        <div class="card stack"><h2>Cursos, certificações e idiomas</h2>${C.field("rs-certs", "Cursos e certificações (um por linha)", C.textarea("rs-certs", (d.certifications || []).join("\n"), 'rows="3"'))}${C.field("rs-langs", "Idiomas (ex.: Inglês — Intermediário)", C.textarea("rs-langs", (d.languages || []).map(l => `${l.lang} — ${l.level}`).join("\n"), 'rows="2"'))}</div>
      </div>
      <div class="card stack">${C.field("rs-extra", "Informações adicionais", C.textarea("rs-extra", d.extra, 'rows="2"'))}</div>
      <div class="row"><button class="btn btn-primary" type="submit">Salvar currículo</button>${r ? `<button type="button" class="btn btn-soft" data-act="resumeTab" data-v="diag">Ver diagnóstico →</button>` : ""}</div>
    </form>`;
  },
  importer(s, r) {
    return `<div class="grid g-main"><div class="card stack"><h2>Colar o texto do currículo</h2>
      <p class="small muted">Cole o texto completo. Separamos as seções pelos títulos (Resumo, Experiência, Formação, Competências, Idiomas) e você confere antes de aplicar.</p>
      ${C.field("imp-text", "Texto do currículo", C.textarea("imp-text", App.ui.importText || "", 'rows="14" placeholder="RESUMO PROFISSIONAL&#10;...&#10;&#10;EXPERIÊNCIA PROFISSIONAL&#10;Empresa — Cargo | 2022–Atual&#10;• atividade"'))}
      <div class="row"><button class="btn btn-primary" data-act="parseImport">Separar seções e conferir</button><label class="btn btn-ghost" for="imp-file">Enviar arquivo</label><input type="file" id="imp-file" accept=".txt,.pdf,.docx,.doc,text/plain" class="hidden" data-change="importFile"></div>
    </div><div class="stack">
      ${C.notice("Arquivos <b>.txt</b> são lidos aqui mesmo. PDF e DOCX precisam de extração no servidor, que ainda não está conectada: abra o arquivo, copie o texto e cole ao lado.", "warn", "!")}
      ${C.notice("A importação nunca acrescenta informação. Campos que não forem reconhecidos ficam marcados como “a confirmar”.", "info")}
      ${r ? C.notice("Você já tem um currículo. Aplicar a importação cria uma nova versão; a anterior continua no histórico.", "info") : ""}
    </div></div>`;
  },
  diag(s, r) {
    const a = Resume.analyze(r.data); const dismissed = r.dismissed || [];
    const sugg = Resume.suggestions(r.data).filter(x => !dismissed.includes(x.id));
    const icon = { pass: ["✓", "ok"], warn: ["!", "warn"], fail: ["✕", "bad"], info: ["i", "info"] };
    return `<div class="grid g-main"><div class="stack">
      <div class="card"><div class="card-head"><h2>Sugestões para revisar</h2><span class="pill ${sugg.length ? "warn" : "ok"}">${sugg.length} pendente(s)</span></div>
        ${sugg.length ? sugg.map(x => `<div class="sunken stack-sm" style="margin-bottom:10px"><div class="row-between"><b>${e(x.label)}</b><span class="small muted">Sugestão editorial</span></div>
          <div class="grid g2" style="gap:8px"><div><div class="xs muted">ANTES</div><div class="small" style="background:var(--bad-bg);padding:8px;border-radius:8px">${e(x.before)}</div></div><div><div class="xs muted">DEPOIS</div><div class="small" style="background:var(--ok-bg);padding:8px;border-radius:8px">${e(x.after)}</div></div></div>
          <div class="small"><b>Motivo:</b> ${e(x.reason)}</div>
          <div class="row"><button class="btn btn-primary btn-sm" data-act="acceptSugg" data-id="${e(x.id)}">Aceitar</button><button class="btn btn-ghost btn-sm" data-act="rejectSugg" data-id="${e(x.id)}">Manter como está</button></div></div>`).join("") : C.empty("Nada pendente", "Todas as sugestões foram revisadas.")}
      </div>
      <div class="card"><h2 style="margin-bottom:10px">Diagnóstico</h2>${a.items.map(i => `<div class="row" style="align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)"><span class="pill ${icon[i.status][1]}" style="min-width:26px;justify-content:center" aria-label="${i.status}">${icon[i.status][0]}</span><div class="grow"><b class="small">${e(i.label)}</b><div class="small muted">${e(i.detail)}</div></div></div>`).join("")}</div>
    </div>
    <div class="stack"><div class="card stack" style="text-align:center;justify-items:center"><div class="score" style="--p:${a.score};width:96px;height:96px;font-size:26px"><span>${a.score}</span></div><b>Nota de clareza e estrutura</b><p class="small muted">Mede organização e legibilidade. Não é chance de contratação.</p>
      ${r.status === "revisado" ? C.pill("Você marcou como revisado", "ok") : `<button class="btn btn-primary" data-act="markReviewed">Marcar currículo como revisado</button>`}</div>
      ${C.notice("Sugestões editoriais mudam a forma, nunca os fatos. Datas, empresas e competências só mudam se você editar.", "info")}
    </div></div>`;
  },
  keywords(s, r) {
    const ev = Cand.ev(s); const fams = Keywords.families(ev); const filt = App.ui.kwFilter || "relevantes";
    const prof = Cand.profile(s);
    const relevantTerms = new Set(); Repo.all("jobs").filter(j => !j.duplicateOf && (prof.families || []).includes(j.family)).forEach(j => Keywords.jobTerms(j).forEach(t => relevantTerms.add(t.term)));
    let rows = Object.values(ev);
    if (filt === "relevantes") rows = rows.filter(t => t.state !== "ausente" || relevantTerms.has(t.term));
    else if (filt !== "todas") rows = rows.filter(t => t.state === filt);
    const order = { sustentado: 0, confirmar: 1, ausente: 2 }; rows.sort((a, b) => order[a.state] - order[b.state] || a.term.localeCompare(b.term));
    const pillFor = st => st === "sustentado" ? C.pill("Sustentado", "ok") : st === "confirmar" ? C.pill("Precisa de confirmação", "warn") : C.pill("Ausente", "");
    const counts = { sustentado: 0, confirmar: 0, ausente: 0 }; Object.values(ev).forEach(t => counts[t.state]++);
    return `<div class="grid g-main"><div class="card"><div class="card-head"><h2>Palavras-chave e evidências</h2>${C.tabs(filt, [["relevantes", "Relevantes"], ["sustentado", `Sustentadas (${counts.sustentado})`], ["confirmar", `A confirmar (${counts.confirmar})`], ["ausente", "Ausentes"], ["todas", "Todas"]], "kwFilter")}</div>
      <div class="table-wrap"><table><thead><tr><th>Termo</th><th>Tipo</th><th>Estado</th><th>Evidência</th><th></th></tr></thead><tbody>
      ${rows.map(t => `<tr><td><b>${e(t.term)}</b></td><td class="small">${e(t.type)}</td><td>${pillFor(t.state)}</td><td class="small">${t.evidence ? `<span class="muted">${e(t.origin)}:</span> “${e(String(t.evidence).slice(0, 110))}”` : `<span class="muted">${relevantTerms.has(t.term) ? "Aparece nas vagas da sua área." : "—"}</span>`}</td><td>${t.state !== "sustentado" ? `<button class="btn btn-soft btn-sm" data-act="claimTerm" data-term="${e(t.term)}">Tenho essa experiência</button>` : t.origin === "Declarado por você" ? `<button class="btn btn-ghost btn-sm" data-act="unclaimTerm" data-term="${e(t.term)}">Remover</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="5">${C.empty("Nada neste filtro", "")}</td></tr>`}
      </tbody></table></div>
      <p class="small muted" style="margin-top:10px">Só termos <b>sustentados</b> entram como competência no currículo e na pontuação. “Ausente” aparece como lacuna de desenvolvimento, nunca como qualificação.</p></div>
      <div class="card"><h2 style="margin-bottom:12px">Famílias de cargo compatíveis</h2><div class="bars">${fams.map(f => `<div class="bar-row"><span class="small">${e(f.name)}</span><div class="track"><div class="fill" style="width:${f.pct}%"></div></div><span class="small num" style="text-align:right">${f.pct}%</span></div>`).join("")}</div>
      <p class="small muted" style="margin-top:12px">Percentual de termos da família que seu currículo já sustenta. Use para escolher cargos-alvo no perfil.</p></div></div>`;
  },
  versions(s, r) {
    const vers = Repo.find("resume_versions", v => v.userId === s.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return `<div class="grid g-main"><div class="card"><div class="card-head"><h2>Histórico de versões</h2><span class="pill">${vers.length}</span></div>
      ${vers.length ? `<div class="table-wrap"><table><thead><tr><th>Versão</th><th>Tipo</th><th>Data</th><th></th></tr></thead><tbody>${vers.map(v => { const j = v.jobId ? Repo.get("jobs", v.jobId) : null; return `<tr><td><b>${e(v.label)}</b>${v.changes?.length ? `<div class="xs muted">${v.changes.length} alteração(ões) registrada(s)</div>` : ""}</td><td>${v.type === "vaga" ? C.pill("Para vaga: " + (j ? j.title : "removida"), "info") : C.pill("Base")}</td><td class="small num">${U.fmtDateTime(v.createdAt)}</td><td><div class="row" style="gap:4px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-act="viewVersion" data-id="${e(v.id)}">Ver</button><button class="btn btn-ghost btn-sm" data-act="diffVersion" data-id="${e(v.id)}">Comparar</button>${v.type === "base" ? `<button class="btn btn-ghost btn-sm" data-act="restoreVersion" data-id="${e(v.id)}">Restaurar</button>` : ""}</div></td></tr>`; }).join("")}</tbody></table></div>` : C.empty("Sem versões", "Cada vez que você salva, aceita uma sugestão ou gera um currículo para uma vaga, uma versão é guardada aqui.")}</div>
      <div class="card stack"><h2>Exportar currículo atual</h2>${r ? `<p class="small muted">Texto simples, legível por sistemas de recrutamento. A ordem das seções é mantida.</p><button class="btn btn-primary" data-act="exportResume" data-v="txt">Exportar .txt</button><button class="btn btn-ghost" data-act="exportResume" data-v="html">Exportar .html (imprimível)</button><p class="small muted">PDF e DOCX: abra o .html no navegador e use “Imprimir → Salvar como PDF”. A geração direta entra com a integração de arquivos.</p>` : '<p class="muted small">Monte o currículo primeiro.</p>'}</div></div>`;
  },
};

/* ---------------- Vagas (Etapas 2 e 3) ---------------- */
Views["cand.jobs"] = (s) => {
  if (!Cand.hasResume(s)) return `${C.head("Etapa 2", "Vagas para você")}${C.empty("O currículo vem primeiro", "A curadoria usa o que o seu currículo sustenta. Preencha experiências ou competências para liberar as vagas.", `<button class="btn btn-primary" data-go="cand.resume">Montar currículo</button>`)}`;
  const tab = App.ui.jobsTab || "rec"; const f = App.ui.jobFilter || {};
  const prof = Cand.profile(s); const plan = Plans.of(s.id);
  const recs = Cand.recommendations(s); const used = Plans.used(s.id);
  const fb = Cand.feedback(s);
  let list;
  if (tab === "rec") list = recs;
  else if (tab === "saved") list = Cand.curated(s).filter(x => fb[x.job.id]?.state === "salva");
  else if (tab === "dismissed") list = Cand.curated(s).filter(x => fb[x.job.id]?.state === "dispensada");
  else list = Cand.curated(s);
  const q = U.norm(f.q || "");
  list = list.filter(x => (!q || U.norm(`${x.job.title} ${x.job.company} ${x.job.description}`).includes(q)) && (!f.city || x.job.city === f.city) && (!f.mod || x.job.modality === f.mod) && (!f.lvl || x.job.level === f.lvl) && (!f.fam || x.job.family === f.fam) && (!f.size || (x.job.companySize || "Não informado") === f.size) && (!f.stage || careerStage(x.job.level) === f.stage) && (!f.sal || (f.sal === "informado" ? !!(x.job.salaryMin || x.job.salaryMax) : (x.job.salaryMax || x.job.salaryMin || 0) >= +f.sal)));
  const cities = [...new Set(Repo.all("jobs").map(j => j.city))].sort();
  const locked = list.filter(x => x.locked).length;
  return `${C.head("Etapas 2 e 3", "Vagas para você", `Ordenadas por aderência, com o motivo de cada recomendação. Aderência mínima: <b>${prof.minScore}%</b> · <button class="btn-link" data-go="cand.profile">ajustar</button>`, `<div class="stack-sm" style="min-width:220px"><div class="row-between small"><span>Plano ${e(plan.name)}</span><span class="num">${used}/${plan.limit} no mês</span></div>${C.meter(used, plan.limit, "", true)}</div>`)}
  <div class="row-between" style="margin-bottom:12px">${C.tabs(tab, [["rec", `Recomendadas (${recs.filter(x => !x.locked).length})`], ["saved", "Salvas"], ["dismissed", "Dispensadas"], ["all", "Explorar catálogo"]], "jobsTab")}</div>
  <details class="card filters" style="margin-bottom:14px" ${App.ui.filtersOpen || Object.values(f).some(Boolean) ? "open" : ""}><summary class="row-between" data-act="toggleFilters"><b>Filtros</b><span class="small muted">${Object.values(f).filter(Boolean).length ? Object.values(f).filter(Boolean).length + " ativo(s)" : "cidade, modalidade, nível, área, salário, porte, momento de carreira"}</span></summary><div class="row" style="align-items:end;margin-top:12px">
    <div class="field grow" style="min-width:180px"><label for="jf-q">Buscar</label>${C.input("jf-q", f.q || "", 'placeholder="Cargo, empresa, palavra" data-input="jobFilter"')}</div>
    <div class="field"><label for="jf-city">Cidade</label>${C.select("jf-city", [["", "Todas"], ...cities], f.city, 'data-change="jobFilter"')}</div>
    <div class="field"><label for="jf-mod">Modalidade</label>${C.select("jf-mod", [["", "Todas"], "Presencial", "Híbrido", "Remoto", "Não informada"], f.mod, 'data-change="jobFilter"')}</div>
    <div class="field"><label for="jf-lvl">Nível</label>${C.select("jf-lvl", [["", "Todos"], "Jovem aprendiz", "Estágio", "Assistente/Auxiliar", "Júnior", "Pleno"], f.lvl, 'data-change="jobFilter"')}</div>
    <div class="field"><label for="jf-fam">Área</label>${C.select("jf-fam", [["", "Todas"], ...FAMILIES.map(x => [x.key, x.name])], f.fam, 'data-change="jobFilter"')}</div>
    <div class="field"><label for="jf-sal">Salário</label>${C.select("jf-sal", [["", "Qualquer"], ["informado", "Só com salário informado"], ["1500", "A partir de R$ 1.500"], ["2500", "A partir de R$ 2.500"], ["4000", "A partir de R$ 4.000"]], f.sal, 'data-change="jobFilter"')}</div>
    <div class="field"><label for="jf-size">Porte da empresa</label>${C.select("jf-size", [["", "Todos"], ...COMPANY_SIZES], f.size, 'data-change="jobFilter"')}</div>
    <div class="field"><label for="jf-stage">Momento de carreira</label>${C.select("jf-stage", [["", "Todos"], ...CAREER_STAGES], f.stage, 'data-change="jobFilter"')}</div>
    <button class="btn btn-ghost" data-act="clearJobFilter">Limpar</button></div></details>
  ${tab === "all" ? C.notice("O catálogo mostra também vagas abaixo da sua aderência mínima, expiradas e não verificadas, sempre sinalizadas. Elas não contam no seu plano.", "info") : ""}
  ${locked ? C.notice(`${locked} vaga(s) compatível(is) ficaram fora porque o limite do plano foi atingido este mês. <button class="btn-link" data-go="cand.plan">Ver planos</button>`, "warn", "!") : ""}
  <div class="card" style="margin-top:12px">${list.length ? list.map(x => JobCard(s, x, fb)).join("") : C.empty(tab === "rec" ? "Nenhuma vaga acima da sua aderência mínima" : "Nada aqui", tab === "rec" ? "Ajuste filtros, preferências ou reduza a aderência mínima no perfil." : "")}</div>`;
};
function JobCard(s, x, fb) {
  const j = x.job, m = x.m, st = x.st, f = fb[j.id];
  const app = Repo.one("applications", a => a.userId === s.id && a.jobId === j.id);
  if (x.locked) return `<div class="job" style="opacity:.6">${C.score(m.score)}<div><div class="job-title">Vaga compatível bloqueada</div><div class="job-meta">Limite mensal do plano atingido. Faça upgrade para ver.</div></div><button class="btn btn-soft btn-sm" data-go="cand.plan">Planos</button></div>`;
  return `<article class="job">${C.score(m.score)}<div class="stack-sm" style="min-width:0">
    <div class="job-title">${e(j.title)}</div>
    <div class="job-meta">${e(j.company)} · ${e(j.city)}${j.uf ? "/" + e(j.uf) : ""} · ${e(j.modality)} · ${e(j.level)}${j.publishedAt ? " · publicada " + U.rel(j.publishedAt) : ""}</div>
    <div class="job-meta"><b class="num" style="color:var(--ink)">${e(salaryText(j))}</b> · Empresa ${e((j.companySize || "Não informado").toLowerCase())}</div>
    <div class="chips">${C.demoPill(j)}${C.pill(st.label, st.cls)}${f?.state === "salva" ? C.pill("Salva", "lime") : ""}${app ? C.pill(app.status, stateTone(app.status)) : ""}</div>
    ${m.matched.length ? `<div class="small"><b>Combina:</b> ${m.matched.slice(0, 6).map(e).join(", ")}</div>` : ""}
    ${m.missingRequired.length ? `<div class="small" style="color:var(--bad)"><b>Requisito não atendido:</b> ${m.missingRequired.map(e).join(", ")}</div>` : ""}
    ${m.notes.map(n => `<div class="small" style="color:var(--bad)"><b>Atenção:</b> ${e(n)}</div>`).join("")}
    ${m.gaps.length ? `<div class="small muted"><b>Lacunas:</b> ${m.gaps.slice(0, 5).map(e).join(", ")}</div>` : ""}
  </div><div class="job-actions">
    <button class="btn btn-primary btn-sm" data-go="cand.job" data-id="${e(j.id)}">Ver motivo</button>
    ${f?.state === "salva" ? `<button class="btn btn-ghost btn-sm" data-act="unsaveJob" data-id="${e(j.id)}">Remover dos salvos</button>` : `<button class="btn btn-soft btn-sm" data-act="saveJob" data-id="${e(j.id)}">Salvar</button>`}
    ${f?.state === "dispensada" ? `<button class="btn btn-ghost btn-sm" data-act="undismissJob" data-id="${e(j.id)}">Desfazer</button>` : `<button class="btn btn-ghost btn-sm" data-act="dismissJob" data-id="${e(j.id)}">Dispensar</button>`}
  </div></article>`;
}

Views["cand.job"] = (s, { id }) => {
  const j = Repo.get("jobs", id); if (!j) return C.empty("Vaga não encontrada", "Ela pode ter sido removida.", `<button class="btn btn-primary" data-go="cand.jobs">Voltar</button>`);
  const prof = Cand.profile(s); const ev = Cand.ev(s); const m = Match.score(prof, ev, j); const st = Match.jobStatus(j); const w = Match.weights();
  const app = Repo.one("applications", a => a.userId === s.id && a.jobId === j.id);
  const versions = Repo.find("resume_versions", v => v.userId === s.id && v.jobId === j.id);
  const canApply = !["expired", "dup"].includes(st.key);
  return `<button class="btn-link small" data-go="cand.jobs">← Vagas</button>
  <div class="page-head" style="margin-top:10px"><div class="row" style="gap:16px">${C.score(m.score)}<div><div class="eyebrow">${e(FAMILIES.find(f => f.key === j.family)?.name || "")}</div><h1 style="margin-top:4px">${e(j.title)}</h1><p class="muted">${e(j.company)} · ${e(j.city)}/${e(j.uf)} · ${e(j.modality)} · ${e(j.level)}</p></div></div>
    <div class="chips">${C.demoPill(j)}${C.pill(st.label, st.cls)}${app ? C.pill(app.status, stateTone(app.status)) : ""}</div></div>
  ${j.isDemo ? C.notice("Vaga fictícia do catálogo de demonstração. Não existe anúncio real para abrir nem candidatura possível fora daqui.", "demo", "◆") : ""}
  ${st.key === "expired" ? C.notice("Esta vaga está expirada ou indisponível.", "bad", "✕") : st.key === "unverified" ? C.notice("Anúncio ainda não verificado pela equipe. Confira no link original antes de agir.", "warn", "!") : ""}
  <div class="grid g-main" style="margin-top:14px"><div class="stack">
    <div class="card"><h2 style="margin-bottom:12px">Por que recomendamos</h2><div class="stack-sm">${Object.keys(DIM_LABEL).map(k => `<div class="dim"><span>${DIM_LABEL[k]} <span class="muted xs">(peso ${w[k]})</span></span>${C.meter(Math.round(m.dims[k] * 100), 100)}<span class="num small" style="text-align:right">${Math.round(m.dims[k] * 100)}%</span></div>`).join("")}</div>
      <p class="small muted" style="margin-top:12px">Pontuação = média ponderada das dimensões. É determinística: mesmo currículo e mesma vaga dão sempre o mesmo número. Não é previsão de contratação.</p></div>
    <div class="card stack"><h2>Requisitos e lacunas</h2>
      <div><div class="label">Combina com seu currículo</div><div class="chips" style="margin-top:6px">${m.matched.map(t => `<span class="chip ok">${e(t)}</span>`).join("") || '<span class="small muted">Nenhum termo identificado.</span>'}</div></div>
      ${m.toConfirm.length ? `<div><div class="label">Precisa de confirmação</div><div class="chips" style="margin-top:6px">${m.toConfirm.map(t => `<span class="chip warn">${e(t)}</span>`).join("")}</div></div>` : ""}
      <div><div class="label">Lacunas</div><div class="chips" style="margin-top:6px">${m.gaps.map(t => `<span class="chip">${e(t)}</span>`).join("") || '<span class="small muted">Nenhuma lacuna nos termos reconhecidos.</span>'}</div></div>
      ${m.missingRequired.length ? C.notice(`<b>Requisitos obrigatórios não atendidos:</b> ${m.missingRequired.map(e).join(", ")}`, "bad", "✕") : ""}
      ${m.notes.map(n => C.notice(e(n), "bad", "✕")).join("")}
      <div class="divider"></div>
      <div><div class="label">Requisitos do anúncio</div><ul class="small" style="margin:6px 0 0 18px;padding:0">${(j.requirements || []).map(x => `<li>${e(x)}</li>`).join("")}</ul></div>
      ${(j.niceToHave || []).length ? `<div><div class="label">Desejáveis</div><ul class="small" style="margin:6px 0 0 18px;padding:0">${j.niceToHave.map(x => `<li>${e(x)}</li>`).join("")}</ul></div>` : ""}
      ${j.description ? `<div><div class="label">Resumo</div><p class="small" style="margin-top:4px">${e(j.description)}</p></div>` : ""}
    </div></div>
    <div class="stack"><div class="card stack"><h2>O que fazer</h2>
      ${j.url ? `<a class="btn btn-primary" href="${e(j.url)}" target="_blank" rel="noopener noreferrer">Abrir anúncio original ↗</a>` : `<button class="btn btn-primary" disabled title="Vaga fictícia">Sem anúncio real (demonstração)</button>`}
      <button class="btn btn-soft" data-act="tailorResume" data-id="${e(j.id)}">Gerar currículo para esta vaga</button>
      ${app ? `<button class="btn btn-ghost" data-act="openApp" data-id="${e(app.id)}">Ver candidatura</button>` : `<button class="btn btn-ghost" data-act="newApp" data-id="${e(j.id)}" ${canApply ? "" : "disabled"}>Registrar que vou me candidatar</button>`}
      <p class="small muted">O Manda Vaga não envia candidaturas. Você se candidata no site original e registra aqui o que aconteceu.</p></div>
      <div class="card stack-sm"><h3>Condições</h3><div class="small">Salário: <b>${e(salaryText(j))}</b></div><div class="small">Porte da empresa: ${e(j.companySize || "Não informado")}</div><div class="small">Momento de carreira: ${e(careerStage(j.level))}</div></div>
      <div class="card stack-sm"><h3>Fonte e verificação</h3><div class="small">Fonte: <b>${e(j.source)}</b></div><div class="small">Publicação: ${U.fmtDate(j.publishedAt)}</div><div class="small">Prazo: ${U.fmtDate(j.deadline)}</div><div class="small">Última verificação: ${U.fmtDate(j.lastCheckedAt)}</div>${j.url ? `<div class="xs mono muted" style="word-break:break-all">${e(j.url)}</div>` : ""}</div>
      ${versions.length ? `<div class="card stack-sm"><h3>Currículos gerados para esta vaga</h3>${versions.map(v => `<div class="row-between small"><span>${U.fmtDateTime(v.createdAt)}</span><button class="btn btn-ghost btn-sm" data-act="viewVersion" data-id="${e(v.id)}">Ver</button></div>`).join("")}</div>` : ""}
    </div></div>`;
};

/* ---------------- Candidaturas ---------------- */
Views["cand.apps"] = (s) => {
  const apps = Cand.apps(s);
  return `${C.head("Etapa 3", "Candidaturas", "Preparar, tentar e enviar são estados diferentes. Só entra como enviada a candidatura com confirmação do portal ou protocolo.")}
  ${apps.length ? `<div class="cols">${APP_COLUMNS.map(col => { const items = apps.filter(a => col.states.includes(a.status)); return `<section class="col"><h3><span>${e(col.name)}</span><span class="pill">${items.length}</span></h3>${items.map(a => { const j = Repo.get("jobs", a.jobId); return `<button class="app-card" data-act="openApp" data-id="${e(a.id)}"><b class="small">${e(j?.title || a.jobTitle || "Vaga removida")}</b><span class="xs muted">${e(j?.company || a.jobCompany || "")}</span>${C.pill(a.status, stateTone(a.status))}${a.next ? `<span class="xs">→ ${e(a.next)}</span>` : ""}${a.interview?.date ? `<span class="xs"><b>Entrevista:</b> ${U.fmtDate(a.interview.date)} ${e(a.interview.time || "")}</span>` : ""}</button>`; }).join("") || '<p class="xs muted" style="padding:6px">Vazio</p>'}</section>`; }).join("")}</div>` : C.empty("Nenhuma candidatura registrada", "Abra uma vaga e use “Registrar que vou me candidatar”.", `<button class="btn btn-primary" data-go="cand.jobs">Ver vagas</button>`)}
  ${C.notice("A Central de Respostas (relacionar e-mails de recrutadores às vagas e sugerir respostas) entra quando o e-mail for conectado. Hoje, registre respostas e entrevistas manualmente.", "info")}`;
};
function AppModal(s, a) {
  const j = Repo.get("jobs", a.jobId); const vers = Repo.find("resume_versions", v => v.userId === s.id && (v.jobId === a.jobId || v.type === "base"));
  return `<div class="row-between"><div><b>${e(j?.title || a.jobTitle || "Vaga removida")}</b><div class="small muted">${e(j?.company || "")}${j?.url ? ` · <a href="${e(j.url)}" target="_blank" rel="noopener noreferrer">anúncio ↗</a>` : ""}</div></div>${a.confirmed ? C.pill("Envio confirmado", "ok") : C.pill("Não enviada", "")}</div>
  <div class="form-grid">
    ${C.field("ap-status", "Status", C.select("ap-status", APP_STATES, a.status, 'data-change="apStatus"'))}
    ${C.field("ap-version", "Currículo usado", C.select("ap-version", [["", "Não definido"], ...vers.map(v => [v.id, v.label + " · " + U.fmtDate(v.createdAt)])], a.resumeVersionId || ""))}
    <div class="full">${C.field("ap-next", "Próxima ação", C.input("ap-next", a.next))}</div>
    <div class="full">${C.field("ap-evidence", "Protocolo ou evidência do envio", C.input("ap-evidence", a.evidence, 'placeholder="Número de protocolo, mensagem de confirmação ou e-mail recebido"'))}</div>
  </div>
  <div id="ap-proof" class="${NEEDS_PROOF.includes(a.status) && !a.confirmed ? "" : "hidden"} notice warn"><span class="ic">!</span><div class="stack-sm"><b>Confirmação obrigatória</b><label class="check"><input type="checkbox" id="ap-proof-ok"> O portal mostrou confirmação de envio ou forneceu protocolo. Só marque se isso aconteceu.</label><span class="small">Preencha a evidência acima.</span></div></div>
  <div id="ap-int" class="${a.status === "Entrevista agendada" ? "" : "hidden"} form-grid sunken">${C.field("ap-int-date", "Data da entrevista", C.input("ap-int-date", a.interview?.date || "", 'type="date"'))}${C.field("ap-int-time", "Horário", C.input("ap-int-time", a.interview?.time || "", 'type="time"'))}<div class="full">${C.field("ap-int-place", "Local ou link", C.input("ap-int-place", a.interview?.place || ""))}</div></div>
  ${C.field("ap-notes", "Observações", C.textarea("ap-notes", a.notes, 'rows="3"'))}
  <div><div class="label" style="margin-bottom:8px">Histórico</div><div class="timeline">${(a.history || []).slice().reverse().map(h => `<div class="t"><b>${e(h.status)}</b> <span class="muted xs">${U.fmtDateTime(h.at)}</span>${h.note ? `<div class="xs muted">${e(h.note)}</div>` : ""}</div>`).join("")}</div></div>`;
}

/* ---------------- Notificações ---------------- */
Views["cand.notifications"] = (s) => {
  const list = Repo.find("notifications", n => n.userId === s.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return `${C.head("Conta", "Notificações", "Avisos dentro do Manda Vaga. E-mail e WhatsApp só depois da integração e do seu consentimento.", list.some(n => !n.read) ? `<button class="btn btn-ghost btn-sm" data-act="readAll">Marcar todas como lidas</button>` : "")}
  <div class="card">${list.length ? list.map(n => `<div class="row" style="gap:12px;padding:12px 0;border-bottom:1px solid var(--line);align-items:flex-start">${n.read ? `<span class="dot" style="color:var(--line-strong);margin-top:7px"></span>` : `<span class="dot" style="color:var(--green);margin-top:7px" aria-label="não lida"></span>`}<div class="grow"><b>${e(n.title)}</b><div class="small muted">${e(n.body)}</div><div class="xs muted">${U.fmtDateTime(n.createdAt)}</div></div>${n.link ? `<button class="btn btn-ghost btn-sm" data-act="openNotif" data-id="${e(n.id)}">Abrir</button>` : ""}</div>`).join("") : C.empty("Sem notificações", "")}</div>`;
};

/* ---------------- Plano ---------------- */
Views["cand.plan"] = (s) => {
  const cur = Plans.of(s.id); const used = Plans.used(s.id);
  const hist = Repo.find("usage_events", u => u.userId === s.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);
  return `${C.head("Conta", "Plano e consumo", "Uma oportunidade única é uma vaga diferente entregue a você no mês. Rever a mesma vaga ou vagas duplicadas não consomem de novo.")}
  ${C.notice("Pagamento real ainda não conectado: a troca de plano é simulada e não gera cobrança.", "warn", "!")}
  <div class="grid g-main" style="margin-top:14px"><div class="plans" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr))">${Plans.list().map(p => `<div class="plan ${p.key === cur.key ? "featured" : ""}"><div class="row-between"><b>${e(p.name)}</b>${p.key === cur.key ? C.pill("Atual", "ok") : ""}</div><div class="price num">${U.money(p.price)}<small>/mês</small></div><p class="small muted">Até ${p.limit} oportunidades únicas/mês</p>${p.key === cur.key ? "" : `<button class="btn btn-primary btn-sm" data-act="changePlan" data-v="${e(p.key)}">Mudar para ${e(p.name)}</button>`}</div>`).join("")}</div>
  <div class="card stack"><h2>Este mês</h2><div class="stat"><span class="v num">${used}<span class="muted" style="font-size:16px"> / ${cur.limit}</span></span></div>${C.meter(used, cur.limit, "", true)}<h3 style="margin-top:8px">Últimas entregas</h3>${hist.map(h => { const j = Repo.get("jobs", h.jobId); return `<div class="row-between small"><span>${e(j ? j.title : "Vaga")}</span><span class="muted num">${U.fmtDate(h.createdAt)}</span></div>`; }).join("") || '<p class="small muted">Nada ainda.</p>'}</div></div>`;
};

/* ---------------- Privacidade ---------------- */
Views["cand.privacy"] = (s) => {
  const reqs = Repo.find("privacy_requests", r => r.userId === s.id);
  return `${C.head("Conta", "Privacidade e seus dados", "Seu currículo e suas candidaturas são privados. A equipe administrativa vê apenas dados de cadastro e uso agregado, e cada acesso fica registrado.")}
  <div class="grid g3">
    <div class="card stack"><h2>Exportar meus dados</h2><p class="small muted">Arquivo JSON com perfil, currículo, versões, vagas salvas, candidaturas e consentimentos.</p><button class="btn btn-primary" data-act="exportMyData">Exportar</button></div>
    <div class="card stack"><h2>Pedir correção</h2><p class="small muted">Descreva o que está errado. A equipe responde pela área administrativa.</p>${C.textarea("pv-fix", "", 'rows="3" placeholder="Ex.: minha cidade está errada"')}<button class="btn btn-ghost" data-act="requestFix">Enviar pedido</button></div>
    <div class="card stack"><h2>Excluir conta</h2><p class="small muted">Apaga perfil, currículo, versões, candidaturas e notificações deste navegador. Não pode ser desfeito.</p><button class="btn btn-danger" data-act="deleteAccount">Excluir minha conta</button></div>
  </div>
  <div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">Uso de IA externa</h2><p class="small">Nesta fase nenhum dado seu é enviado a provedor de IA: diagnóstico, palavras-chave e pontuação rodam com regras locais. Quando a integração existir, você será avisado antes de cada envio.</p></div>
  ${reqs.length ? `<div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">Seus pedidos</h2>${reqs.map(r => `<div class="row-between small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>${e(r.type)}: ${e(r.note)}</span>${C.pill(r.status, r.status === "concluída" ? "ok" : "warn")}</div>`).join("")}</div>` : ""}`;
};
