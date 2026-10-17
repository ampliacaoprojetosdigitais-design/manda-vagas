/* =====================================================================
   AÇÕES, FORMULÁRIOS E INICIALIZAÇÃO
   ===================================================================== */
const passHash = p => U.hash("mv-demo-salt:" + p); // protótipo local; produção usa autenticação no servidor
const val = (id) => (document.getElementById(id)?.value ?? "").trim();
const lines = (t) => String(t || "").split("\n").map(x => x.trim()).filter(Boolean);
const me = () => App.session();

function startSession(u) { Repo.data.session = u.id; u.lastActiveAt = U.now(); Repo.save(); audit("Login", u.id, u.role); App.route = { page: u.role === "admin" ? "admin.dashboard" : "cand.home", params: {} }; applyTheme(); App.render(); }
function applyTheme() { const s = me(); const t = s ? Repo.setting("theme_" + s.id, "system") : "system"; if (t === "system") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", t); }

function collectResume(form) {
  const d = Resume.empty();
  d.headline = val("rs-headline"); d.summary = val("rs-summary");
  form.querySelectorAll("[data-exp]").forEach((fs, i) => d.experiences.push({ id: fs.dataset.exp, org: val(`ex-org-${i}`), role: val(`ex-role-${i}`), start: val(`ex-start-${i}`), end: val(`ex-end-${i}`), activities: lines(val(`ex-act-${i}`)) }));
  form.querySelectorAll("[data-edu]").forEach((fs, i) => d.education.push({ id: fs.dataset.edu, course: val(`ed-course-${i}`), institution: val(`ed-inst-${i}`), status: val(`ed-status-${i}`), end: val(`ed-end-${i}`) }));
  d.skills = lines(val("rs-skills")); d.certifications = lines(val("rs-certs"));
  d.languages = lines(val("rs-langs")).map(l => { const [lang, level] = l.split(/\s*[—–:-]\s*/); return { lang, level: level || "nível a confirmar" }; });
  d.extra = val("rs-extra");
  return d;
}
function sectionChanges(a, b) {
  const out = []; const T = x => JSON.stringify(x);
  [["headline", "Título"], ["summary", "Resumo"], ["experiences", "Experiências"], ["education", "Formação"], ["skills", "Competências"], ["certifications", "Cursos"], ["languages", "Idiomas"], ["extra", "Informações adicionais"]].forEach(([k, l]) => { if (T(a?.[k] ?? "") !== T(b[k] ?? "")) out.push({ field: l, before: "", after: "", reason: "Edição manual" }); });
  return out;
}
function saveResumeData(s, data, label, changes, extra = {}) {
  let r = Cand.resume(s);
  if (r) Repo.update("resumes", r.id, Object.assign({ data, status: "rascunho" }, extra));
  else r = Repo.insert("resumes", Object.assign({ userId: s.id, sourceType: "manual", status: "rascunho", data, dismissed: [] }, extra));
  Cand.saveVersion(s, data, label, changes);
  return r;
}

const Actions = {
  openMenu() { App.openMenu(); }, closeMenu() { App.closeMenu(); },
  logout() { const s = me(); audit("Logout", s?.id); Repo.data.session = null; Repo.save(); App.ui = {}; document.documentElement.removeAttribute("data-theme"); App.go("landing"); },
  theme() { const s = me(); const cur = Repo.setting("theme_" + s.id, "system"); const next = { system: "light", light: "dark", dark: "system" }[cur]; Repo.setSetting("theme_" + s.id, next); applyTheme(); App.render(); },
  demoInfo() { App.modal({ title: "Modo demonstração", body: `<p>Este ambiente roda com <b>dados sintéticos</b> (marcados em roxo) e guarda tudo neste navegador. Vagas demonstrativas são fictícias e não têm anúncio real.</p><p class="small muted">Integrações externas (banco remoto, IA, fontes de vagas, e-mail, WhatsApp, pagamentos) aparecem como “não conectadas” e nunca simulam sucesso.</p>`, actions: [{ key: "ok", label: "Entendi", cls: "btn-primary" }], onAction: () => true }); },
  async demoLogin(el) { const map = { candidate: "camila@demo.mandavaga", new: "rafael@demo.mandavaga", admin: "admin@demo.mandavaga" }; const u = Repo.one("users", x => x.email === map[el.dataset.v]); if (u) startSession(u); else App.toast("Conta demo não encontrada. Restaure os dados de demonstração.", true); },

  resumeTab(el) { App.ui.resumeTab = el.dataset.v; App.render(); },
  kwFilter(el) { App.ui.kwFilter = el.dataset.v; App.render(); },
  jobsTab(el) { App.ui.jobsTab = el.dataset.v; App.render(); },
  admJobF(el) { App.ui.admJobF = el.dataset.v; App.render(); },
  clearJobFilter() { App.ui.jobFilter = {}; App.render(); },
  toggleFilters(el, ev) { ev.preventDefault(); App.ui.filtersOpen = !el.closest("details").open; el.closest("details").open = App.ui.filtersOpen; },

  addExp() { const f = document.querySelector('[data-form="resume"]'); const d = collectResume(f); d.experiences.push({ id: U.uid("exp"), org: "", role: "", start: "", end: "", activities: [] }); App.ui.resumeDraft = d; App.render(); },
  rmExp(el) { const f = document.querySelector('[data-form="resume"]'); const d = collectResume(f); d.experiences.splice(+el.dataset.i, 1); App.ui.resumeDraft = d; App.render(); },
  addEdu() { const f = document.querySelector('[data-form="resume"]'); const d = collectResume(f); d.education.push({ id: U.uid("edu"), course: "", institution: "", status: "em andamento", end: "" }); App.ui.resumeDraft = d; App.render(); },
  rmEdu(el) { const f = document.querySelector('[data-form="resume"]'); const d = collectResume(f); d.education.splice(+el.dataset.i, 1); App.ui.resumeDraft = d; App.render(); },

  parseImport() {
    const text = val("imp-text"); App.ui.importText = text;
    if (text.length < 40) return App.toast("Cole o texto completo do currículo (pelo menos algumas linhas).", true);
    const d = Resume.parseText(text);
    const s = me();
    App.modal({ title: "Confira antes de aplicar", wide: true, body: `${C.notice("Separamos as seções automaticamente. Itens marcados “a confirmar” precisam da sua revisão no Editor.", "warn", "!")}<div class="grid g2"><div class="stack-sm"><b>Reconhecido</b><div class="small">Experiências: <b>${d.experiences.length}</b> · Formações: <b>${d.education.length}</b> · Competências: <b>${d.skills.length}</b> · Idiomas: <b>${d.languages.length}</b></div><div class="small">Resumo: ${d.summary ? `${d.summary.length} caracteres` : "não encontrado"}</div></div><div></div></div><pre class="preview-text">${e(Resume.toText(d, s))}</pre>`, actions: [{ key: "cancel", label: "Cancelar" }, { key: "ok", label: "Aplicar como meu currículo", cls: "btn-primary" }], onAction: k => { if (k !== "ok") return true; saveResumeData(s, d, "Importado de texto", [{ field: "Currículo", before: "", after: "", reason: "Importação de texto colado" }], { sourceType: "texto", originalText: text }); App.ui.importText = ""; App.ui.resumeDraft = null; App.ui.resumeTab = "editor"; App.toast("Currículo importado. Confira no Editor."); App.render(); return true; } });
  },
  acceptSugg(el) { const s = me(); const r = Cand.resume(s); const sg = Resume.suggestions(r.data).find(x => x.id === el.dataset.id); if (!sg) return App.render(); const d = Resume.applySuggestion(r.data, sg); Repo.update("resumes", r.id, { data: d }); Cand.saveVersion(s, d, "Sugestão aceita: " + sg.label, [{ field: sg.label, before: sg.before, after: sg.after, reason: sg.reason }]); App.toast("Sugestão aplicada e registrada no histórico."); App.render(); },
  rejectSugg(el) { const s = me(); const r = Cand.resume(s); Repo.update("resumes", r.id, { dismissed: [...(r.dismissed || []), el.dataset.id] }); App.toast("Mantido como está."); App.render(); },
  markReviewed() { const s = me(); const r = Cand.resume(s); const a = Resume.analyze(r.data); const fails = a.items.filter(i => i.status === "fail"); if (fails.some(f => f.id === "integrity")) return App.toast("Corrija a afirmação de tempo de experiência antes de marcar como revisado.", true); Repo.update("resumes", r.id, { status: "revisado", reviewedAt: U.now() }); App.toast("Currículo marcado como revisado."); App.render(); },
  claimTerm(el) {
    const s = me(); const term = el.dataset.term; const cl = Repo.one("keyword_claims", c => c.userId === s.id && c.term === term);
    App.modal({ title: `“${term}”: onde você usou?`, body: `<p class="small muted">Só entra como competência se você descrever onde usou. Sem descrição, fica como “precisa de confirmação” e não conta na pontuação.</p>${C.field("kc-ev", "Onde e como você usou", C.textarea("kc-ev", cl?.evidence || "", 'rows="3" placeholder="Ex.: na Contábil Bela Vista, controlava prazos de clientes no CPJ"'))}<label class="check"><input type="checkbox" id="kc-true"> Confirmo que é verdade e consigo explicar numa entrevista.</label><label class="check"><input type="checkbox" id="kc-add"> Adicionar “${e(term)}” às competências do currículo.</label>`, actions: [{ key: "cancel", label: "Cancelar" }, { key: "ok", label: "Salvar", cls: "btn-primary" }], onAction: k => {
      if (k !== "ok") return true; const ev = val("kc-ev"); const ok = document.getElementById("kc-true").checked;
      if (!ok) { App.toast("Marque a confirmação para registrar.", true); return false; }
      const rec = { userId: s.id, term, evidence: ev, confirmed: !!ev };
      if (cl) Repo.update("keyword_claims", cl.id, rec); else Repo.insert("keyword_claims", rec);
      if (ev && document.getElementById("kc-add").checked) { const r = Cand.resume(s); if (r && !r.data.skills.some(x => U.norm(x) === U.norm(term))) { const d = JSON.parse(JSON.stringify(r.data)); d.skills.push(term); Repo.update("resumes", r.id, { data: d }); Cand.saveVersion(s, d, "Competência declarada: " + term, [{ field: "Competências", before: "", after: term, reason: "Declarada por você com evidência: " + ev }]); } }
      App.toast(ev ? "Registrado como sustentado por declaração sua." : "Registrado como “precisa de confirmação”."); App.render(); return true;
    } });
  },
  unclaimTerm(el) { const s = me(); Repo.remove("keyword_claims", c => c.userId === s.id && c.term === el.dataset.term); App.toast("Declaração removida."); App.render(); },
  viewVersion(el) { const s = me(); const v = Repo.get("resume_versions", el.dataset.id); if (!v || v.userId !== s.id) return; const j = v.jobId ? Repo.get("jobs", v.jobId) : null; const text = Resume.toText(v.data, s, { objective: j?.title }); App.modal({ title: v.label, wide: true, body: `${v.changes?.length ? `<div class="sunken stack-sm"><b class="small">Alterações registradas</b>${v.changes.map(c => `<div class="small"><b>${e(c.field)}</b>: ${e(c.reason)}</div>`).join("")}</div>` : ""}<pre class="preview-text">${e(text)}</pre>`, actions: [{ key: "txt", label: "Exportar .txt" }, { key: "close", label: "Fechar", cls: "btn-primary" }], onAction: k => { if (k === "txt") { App.exportText("Exportar versão", `curriculo-${U.slug(v.label)}.txt`, text); return false; } return true; } }); },
  diffVersion(el) { const s = me(); const v = Repo.get("resume_versions", el.dataset.id); const r = Cand.resume(s); if (!v || !r) return; const d = Resume.diffLines(Resume.toText(v.data, s), Resume.toText(r.data, s)); App.modal({ title: "Comparar com o currículo atual", wide: true, body: `<p class="small muted"><span class="chip bad">riscado</span> só na versão “${e(v.label)}” · <span class="chip ok">verde</span> só no atual</p><div class="diff">${d.map(([t, l]) => `<div class="${t === "+" ? "add" : t === "-" ? "del" : ""}">${t === "=" ? "  " : t + " "}${e(l) || "&nbsp;"}</div>`).join("")}</div>`, actions: [{ key: "close", label: "Fechar", cls: "btn-primary" }], onAction: () => true }); },
  restoreVersion(el) { const s = me(); const v = Repo.get("resume_versions", el.dataset.id); App.confirm("Restaurar esta versão?", `O currículo atual será substituído por “${e(v.label)}”. A versão atual continua no histórico.`, "Restaurar", () => { saveResumeData(s, JSON.parse(JSON.stringify(v.data)), "Restaurada: " + v.label, [{ field: "Currículo", before: "", after: "", reason: "Restauração de versão" }]); App.toast("Versão restaurada."); App.render(); }); },
  exportResume(el) { const s = me(); const r = Cand.resume(s); if (el.dataset.v === "html") App.exportText("Exportar currículo (.html)", `curriculo-${U.slug(s.name)}.html`, Resume.toHTML(r.data, s), "text/html;charset=utf-8"); else App.exportText("Exportar currículo (.txt)", `curriculo-${U.slug(s.name)}.txt`, Resume.toText(r.data, s)); },

  saveJob(el) { setFeedback(el.dataset.id, "salva"); App.toast("Vaga salva."); },
  unsaveJob(el) { setFeedback(el.dataset.id, null); App.toast("Removida dos salvos."); },
  dismissJob(el) { const id = el.dataset.id; App.modal({ title: "Dispensar vaga", body: `${C.field("ds-reason", "Motivo (opcional, ajuda a curadoria)", C.select("ds-reason", ["", "Fora da minha área", "Local ou modalidade", "Requisitos que não tenho", "Salário", "Já me candidatei por fora", "Outro"], ""))}`, actions: [{ key: "cancel", label: "Cancelar" }, { key: "ok", label: "Dispensar", cls: "btn-primary" }], onAction: k => { if (k === "ok") { setFeedback(id, "dispensada", val("ds-reason")); App.toast("Vaga dispensada. Veja em “Dispensadas” para desfazer."); } return true; } }); },
  undismissJob(el) { setFeedback(el.dataset.id, null); App.toast("Vaga de volta às recomendações."); },
  tailorResume(el) {
    const s = me(); const r = Cand.resume(s); const j = Repo.get("jobs", el.dataset.id); if (!r) return App.toast("Monte o currículo primeiro.", true);
    const t = Resume.tailor(r.data, j); const v = Cand.saveVersion(s, t.data, `Para: ${j.title} — ${j.company}`, t.changes, j.id, "vaga");
    const app = Repo.one("applications", a => a.userId === s.id && a.jobId === j.id);
    if (app) { const hist = app.history || []; let status = app.status; if (["Vaga encontrada", "Em verificação", "Selecionada", "Preparando currículo"].includes(status)) { status = "Pronta para revisão"; hist.push({ status, at: U.now(), note: "Currículo gerado para a vaga" }); } Repo.update("applications", app.id, { resumeVersionId: v.id, status, history: hist }); }
    const text = Resume.toText(t.data, s, { objective: t.objective });
    App.modal({ title: "Currículo para esta vaga", wide: true, body: `${C.notice("Esta versão só reordena e destaca o que já está no seu currículo. Nenhuma experiência, data ou competência foi criada.", "ok", "✓")}<div class="sunken stack-sm"><b class="small">O que mudou e por quê</b>${t.changes.map(c => `<div class="small"><b>${e(c.field)}</b>: ${e(c.reason)}</div>`).join("")}</div><pre class="preview-text">${e(text)}</pre>`, actions: [{ key: "txt", label: "Exportar .txt" }, { key: "html", label: "Exportar .html" }, { key: "close", label: "Concluir", cls: "btn-primary" }], onAction: k => { if (k === "txt") { App.exportText("Exportar currículo", `curriculo-${U.slug(j.title)}.txt`, text); return false; } if (k === "html") { App.exportText("Exportar currículo", `curriculo-${U.slug(j.title)}.html`, Resume.toHTML(t.data, s, { objective: t.objective }), "text/html;charset=utf-8"); return false; } App.render(); return true; } });
  },
  newApp(el) { const s = me(); const j = Repo.get("jobs", el.dataset.id); if (Repo.one("applications", a => a.userId === s.id && a.jobId === j.id)) return App.toast("Já registrada."); const st = Match.jobStatus(j).key === "unverified" ? "Em verificação" : "Selecionada"; const ver = Repo.find("resume_versions", v => v.userId === s.id && v.jobId === j.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]; const a = Repo.insert("applications", { userId: s.id, jobId: j.id, jobTitle: j.title, jobCompany: j.company, status: ver ? "Pronta para revisão" : st, confirmed: false, evidence: "", next: ver ? "Revisar o currículo e se candidatar no site original" : "Gerar o currículo para a vaga", notes: "", resumeVersionId: ver?.id || null, interview: null, history: [{ status: ver ? "Pronta para revisão" : st, at: U.now(), note: "Registrada pelo candidato" }] }); if (!Repo.one("job_feedback", f => f.userId === s.id && f.jobId === j.id)) setFeedback(j.id, "salva", "", true); App.toast("Candidatura registrada. Nada foi enviado."); Actions.openApp({ dataset: { id: a.id } }); },
  openApp(el) {
    const s = me(); const a = Repo.get("applications", el.dataset.id); if (!a || a.userId !== s.id) return;
    App.modal({ title: "Candidatura", wide: true, body: AppModal(s, a), actions: [{ key: "del", label: "Excluir registro", cls: "btn-danger" }, { key: "cancel", label: "Cancelar" }, { key: "save", label: "Salvar", cls: "btn-primary" }], onAction: k => {
      if (k === "del") { Repo.remove("applications", x => x.id === a.id); App.toast("Registro excluído."); App.render(); return true; }
      if (k !== "save") return true;
      const status = val("ap-status"); const evidence = val("ap-evidence");
      let confirmed = a.confirmed, confirmedAt = a.confirmedAt;
      if (NEEDS_PROOF.includes(status) && !a.confirmed) {
        if (!document.getElementById("ap-proof-ok")?.checked || !evidence) { App.toast("Para marcar como enviada, confirme que o portal mostrou confirmação e preencha a evidência.", true); return false; }
        confirmed = true; confirmedAt = U.now();
      }
      const interview = status === "Entrevista agendada" ? { date: val("ap-int-date"), time: val("ap-int-time"), place: val("ap-int-place") } : a.interview;
      if (status === "Entrevista agendada" && !interview.date) { App.toast("Informe a data da entrevista.", true); return false; }
      const hist = a.history || []; if (status !== a.status) hist.push({ status, at: U.now(), note: status === "Candidatura enviada — confirmada" ? "Evidência: " + evidence : "" });
      Repo.update("applications", a.id, { status, evidence, confirmed, confirmedAt, next: val("ap-next"), notes: val("ap-notes"), resumeVersionId: val("ap-version") || null, interview, history: hist });
      if (status !== a.status) notify(s.id, "Candidatura atualizada", `${a.jobTitle || "Vaga"}: ${status}`, "info", "cand.apps");
      App.toast("Candidatura salva."); App.render(); return true;
    } });
  },
  readAll() { const s = me(); Repo.find("notifications", n => n.userId === s.id).forEach(n => n.read = true); Repo.save(); App.render(); },
  openNotif(el) { const n = Repo.get("notifications", el.dataset.id); n.read = true; Repo.save(); App.go(n.link || "cand.home"); },
  changePlan(el) { const s = me(); const p = Plans.list().find(x => x.key === el.dataset.v); App.confirm(`Mudar para o plano ${p.name}?`, `Simulação: nenhuma cobrança será feita. Novo limite: ${p.limit} oportunidades únicas por mês.`, "Mudar plano", () => { Repo.find("subscriptions", x => x.userId === s.id && x.status === "ativa").forEach(x => { x.status = "encerrada"; x.endedAt = U.now(); }); Repo.insert("subscriptions", { userId: s.id, plan: p.key, status: "ativa", startedAt: U.now(), simulated: true }); audit("Plano alterado (simulado)", s.id, p.name); notify(s.id, "Plano alterado", `Agora você está no ${p.name}.`, "ok", "cand.plan"); App.toast(`Plano ${p.name} ativo (simulado).`); App.render(); }); },
  exportMyData() { const s = me(); const own = c => Repo.find(c, r => r.userId === s.id); const { passwordHash, ...user } = s; const data = { exportadoEm: U.now(), usuario: user, perfil: own("profiles"), curriculo: own("resumes"), versoes: own("resume_versions"), declaracoes: own("keyword_claims"), vagasSalvasDispensadas: own("job_feedback"), candidaturas: own("applications"), assinaturas: own("subscriptions"), consumo: own("usage_events"), notificacoes: own("notifications"), preferencias: own("notification_preferences"), pedidos: own("privacy_requests") }; audit("Exportação de dados pelo titular", s.id); App.exportText("Exportar meus dados", `meus-dados-manda-vaga-${U.today()}.json`, JSON.stringify(data, null, 2), "application/json"); },
  requestFix() { const s = me(); const note = val("pv-fix"); if (!note) return App.toast("Descreva o que precisa ser corrigido.", true); Repo.insert("privacy_requests", { userId: s.id, userName: s.name, type: "Correção de dados", status: "aberta", note }); App.toast("Pedido enviado à equipe."); App.render(); },
  deleteAccount() { const s = me(); App.modal({ title: "Excluir conta", body: `<p>Isso apaga seu perfil, currículo, versões, candidaturas e notificações deste navegador.</p>${C.field("del-confirm", "Digite EXCLUIR para confirmar", C.input("del-confirm", "", 'autocomplete="off"'))}`, actions: [{ key: "cancel", label: "Cancelar" }, { key: "ok", label: "Excluir definitivamente", cls: "btn-danger" }], onAction: k => { if (k !== "ok") return true; if (val("del-confirm") !== "EXCLUIR") { App.toast("Digite EXCLUIR em maiúsculas.", true); return false; } ["profiles", "resumes", "resume_versions", "keyword_claims", "job_feedback", "applications", "subscriptions", "usage_events", "notifications", "notification_preferences"].forEach(c => Repo.remove(c, r => r.userId === s.id)); Repo.remove("users", u => u.id === s.id); Repo.insert("privacy_requests", { userId: s.id, userName: s.name, type: "Exclusão de conta", status: "concluída", note: "Executada pelo titular", resolvedAt: U.now() }); audit("Conta excluída pelo titular", s.id); Repo.data.session = null; Repo.save(); App.toast("Conta excluída."); App.go("landing"); return true; } }); },

  /* ---- admin ---- */
  viewUser(el) {
    const u = Repo.get("users", el.dataset.id); if (!u) return; audit("Usuário consultado", u.id, "Dados de cadastro e uso");
    const apps = u.synthetic ? u.appsCount : Repo.find("applications", a => a.userId === u.id).length; const hasR = u.synthetic ? u.resumeComplete : !!Repo.one("resumes", r => r.userId === u.id);
    App.modal({ title: u.name, body: `<div class="form-grid small"><div><span class="muted">E-mail</span><br>${e(u.email)}</div><div><span class="muted">Cidade</span><br>${e(u.city ? u.city + "/" + u.uf : "Não informado")}</div><div><span class="muted">Área</span><br>${e(u.area || "Não informado")}</div><div><span class="muted">Origem</span><br>${e(u.origin || "Não informado")}</div><div><span class="muted">Faixa etária</span><br>${e(u.ageRange || "Não informado")}</div><div><span class="muted">Plano</span><br>${u.role === "candidate" ? e(Plans.of(u.id).name) + ` · ${Plans.used(u.id)} usadas no mês` : "—"}</div><div><span class="muted">Currículo</span><br>${hasR ? "Preenchido" : "Não preenchido"}</div><div><span class="muted">Candidaturas registradas</span><br>${apps}</div><div><span class="muted">Cadastro</span><br>${U.fmtDate(u.createdAt)}</div><div><span class="muted">Última atividade</span><br>${U.fmtDate(u.lastActiveAt)}</div></div>${C.notice("O conteúdo do currículo e das candidaturas é privado e não aparece aqui. Esta consulta foi registrada na auditoria.", "info")}`, actions: [{ key: "status", label: u.status === "ativo" ? "Suspender" : "Reativar", cls: "btn-danger" }, { key: "role", label: u.role === "admin" ? "Tornar candidato" : "Tornar admin" }, { key: "close", label: "Fechar", cls: "btn-primary" }], onAction: k => {
      if (k === "status") { if (u.id === me().id) { App.toast("Você não pode suspender a própria conta.", true); return false; } Repo.update("users", u.id, { status: u.status === "ativo" ? "suspenso" : "ativo" }); audit(u.status === "ativo" ? "Usuário reativado" : "Usuário suspenso", u.id); App.render(); }
      if (k === "role") { if (u.id === me().id) { App.toast("Você não pode mudar o próprio papel.", true); return false; } Repo.update("users", u.id, { role: u.role === "admin" ? "candidate" : "admin" }); audit("Papel alterado", u.id, u.role); App.render(); }
      return true;
    } });
  },
  newSource() { sourceModal(); }, editSource(el) { sourceModal(Repo.get("job_sources", el.dataset.id)); },
  syncSource(el) { const src = Repo.get("job_sources", el.dataset.id); if (src.id === "src_demo") { Repo.update("job_sources", src.id, { lastSync: U.now() }); audit("Sincronização", src.id, "Catálogo demonstrativo"); App.toast("Catálogo demonstrativo: nenhuma vaga nova."); return App.render(); } if (src.type === "Manual") return App.toast("Fonte manual: cadastre vagas em Vagas → + Vaga."); const r = Integrations.call("jobs"); App.toast(r.reason, true); },
  newJob() { jobModal(); }, editJob(el) { jobModal(Repo.get("jobs", el.dataset.id)); },
  verifyJob(el) { const j = Repo.get("jobs", el.dataset.id); if (!j.isDemo && !j.url) return App.toast("Vaga real sem link individual não pode ser verificada.", true); Repo.update("jobs", j.id, { lastCheckedAt: U.now(), status: j.status === "expired" && (!j.deadline || j.deadline >= U.today()) ? "active" : j.status }); audit("Vaga verificada", j.id, j.title); App.toast("Verificação registrada com a data de hoje."); App.render(); },
  expireJob(el) { const j = Repo.get("jobs", el.dataset.id); const ns = j.status === "expired" ? "active" : "expired"; Repo.update("jobs", j.id, { status: ns }); if (ns === "expired") Repo.find("applications", a => a.jobId === j.id && !a.confirmed && !["Processo encerrado", "Descartada"].includes(a.status)).forEach(a => { a.history = [...(a.history || []), { status: "Vaga expirada/indisponível", at: U.now(), note: "Marcada pela equipe" }]; a.status = "Vaga expirada/indisponível"; notify(a.userId, "Vaga encerrada", `${a.jobTitle}: a vaga foi marcada como indisponível.`, "warn", "cand.apps"); }); Repo.save(); audit(ns === "expired" ? "Vaga expirada" : "Vaga reativada", j.id, j.title); App.render(); },
  importPilot() { let added = 0, dup = 0; PILOT_REAL_JOBS.forEach(p => { const j = { ...p, id: U.uid("job"), sourceId: "src_manual", externalId: null, isDemo: false, status: "active", lastCheckedAt: "2026-10-17T12:00:00.000Z", deadline: "", minSemester: null, duplicateOf: null, createdAt: U.now() }; if (Match.findDuplicate(j, Repo.all("jobs"))) { dup++; return; } Repo.all("jobs").push(j); added++; }); Repo.save(); audit("Importação de vagas reais", "lote-piloto", `${added} novas, ${dup} duplicadas`); App.toast(`${added} vaga(s) real(is) importada(s)${dup ? `, ${dup} já existia(m)` : ""}. Verificação: 17/10/2026.`); App.render(); },
  importJobs() { App.modal({ title: "Importar vagas (JSON)", wide: true, body: `<p class="small muted">Aceita o backup do Painel v6 (<span class="mono">{"jobs":[...]}</span>) ou uma lista de vagas. Cada vaga precisa de cargo, empresa e link individual válido. Duplicatas são ignoradas.</p>${C.textarea("ij-text", "", 'rows="10" class="textarea mono" placeholder="Cole o JSON aqui"')}<label class="btn btn-ghost" for="ij-file" style="justify-self:start">Escolher arquivo .json</label><input type="file" id="ij-file" accept=".json,application/json" class="hidden" data-change="importJobsFile">`, actions: [{ key: "cancel", label: "Cancelar" }, { key: "ok", label: "Importar", cls: "btn-primary" }], onAction: k => { if (k !== "ok") return true; return importJobsFromText(val("ij-text")); } }); },
  newDraft() { const ids = [...document.querySelectorAll('input[name="ed-job"]:checked')].map(x => x.value); if (!ids.length) return App.toast("Escolha ao menos uma vaga verificada.", true); const d = Repo.insert("content_drafts", draftFromJobs(ids.map(id => Repo.get("jobs", id)), val("ed-channel"))); audit("Rascunho editorial criado", d.id, d.title); App.render(); Actions.openDraft({ dataset: { id: d.id } }); },
  openDraft(el) {
    const d = Repo.get("content_drafts", el.dataset.id); const s = me();
    App.modal({ title: d.title, wide: true, body: `<div class="row">${C.pill(d.status)}<span class="small muted">Fontes: ${d.sources.map(x => `${e(x.source)} (verificada ${U.fmtDate(x.checked)})`).join("; ")}</span></div>
      ${C.field("dr-slides", "Slides (separe com uma linha contendo ---)", C.textarea("dr-slides", d.slides.join("\n---\n"), 'rows="10"'))}
      ${C.field("dr-caption", "Legenda", C.textarea("dr-caption", d.caption, 'rows="8"'))}
      ${C.field("dr-notes", "Notas de revisão", C.textarea("dr-notes", d.notes, 'rows="2"'))}
      ${C.notice("Publicação automática não está conectada. Depois de aprovado, publique manualmente e registre aqui.", "warn", "!")}`,
      actions: [{ key: "save", label: "Salvar" }, ...(d.status === "Rascunho" || d.status === "Rejeitado" ? [{ key: "review", label: "Enviar para revisão" }] : []), ...(d.status === "Em revisão" ? [{ key: "reject", label: "Rejeitar", cls: "btn-danger" }, { key: "approve", label: "Aprovar", cls: "btn-primary" }] : []), ...(d.status === "Aprovado" ? [{ key: "publish", label: "Marcar como publicado manualmente", cls: "btn-primary" }] : [])],
      onAction: k => {
        const patch = { slides: val("dr-slides").split(/\n-{3,}\n/).map(x => x.trim()).filter(Boolean), caption: val("dr-caption"), notes: val("dr-notes") };
        if (k === "review") patch.status = "Em revisão";
        if (k === "approve") { if (d.createdBy && d.createdBy === s.id && false) return false; patch.status = "Aprovado"; patch.reviewer = s.name; patch.reviewedAt = U.now(); }
        if (k === "reject") { if (!patch.notes) { App.toast("Explique o motivo nas notas de revisão.", true); return false; } patch.status = "Rejeitado"; patch.reviewer = s.name; }
        if (k === "publish") { patch.status = "Publicado manualmente"; patch.publishedAt = U.now(); }
        Repo.update("content_drafts", d.id, patch); audit("Editorial: " + (patch.status || "edição salva"), d.id, d.title); App.toast(patch.status ? `Status: ${patch.status}` : "Rascunho salvo."); App.render(); return true;
      } });
  },
  resolvePrivacy(el) { const r = Repo.get("privacy_requests", el.dataset.id); Repo.update("privacy_requests", r.id, { status: "concluída", resolvedAt: U.now() }); audit("Pedido de privacidade concluído", r.id, r.type); if (Repo.get("users", r.userId)) notify(r.userId, "Pedido de privacidade concluído", r.type, "ok", "cand.privacy"); App.render(); },
  resetWeights() { Repo.setSetting("weights", DEFAULT_WEIGHTS); audit("Pesos restaurados"); App.toast("Pesos padrão restaurados."); App.render(); },
  resetDemo() { App.confirm("Restaurar dados de demonstração?", "Apaga tudo deste navegador, inclusive contas criadas e vagas reais importadas, e recria os cenários de teste.", "Restaurar", async () => { await seedFresh(); App.toast("Dados de demonstração restaurados."); App.go("login"); }, true); },
  exportDb() { const { session, ...rest } = Repo.data; const clean = JSON.parse(JSON.stringify(rest)); clean.users.forEach(u => delete u.passwordHash); audit("Exportação do banco local"); App.exportText("Banco local (JSON)", `manda-vaga-banco-${U.today()}.json`, JSON.stringify(clean, null, 2), "application/json"); },
};

function setFeedback(jobId, state, reason = "", silent) { const s = me(); const f = Repo.one("job_feedback", x => x.userId === s.id && x.jobId === jobId); if (!state) { if (f) Repo.remove("job_feedback", x => x.id === f.id); } else if (f) Repo.update("job_feedback", f.id, { state, reason }); else Repo.insert("job_feedback", { userId: s.id, jobId, state, reason }); if (!silent) App.render(); }

function sourceModal(src) {
  App.modal({ title: src ? "Editar fonte" : "Nova fonte", body: `${C.field("so-name", "Nome", C.input("so-name", src?.name || ""))}${C.field("so-type", "Camada / tipo", C.select("so-type", SOURCE_TYPES, src?.type || "Manual"))}${C.field("so-url", "URL", C.input("so-url", src?.url || "", 'type="url"'))}${C.field("so-terms", "Autorização e termos de uso", C.textarea("so-terms", src?.terms || "", 'rows="3"'))}${C.field("so-limits", "Limites (requisições, frequência)", C.input("so-limits", src?.limits || ""))}<label class="check"><input type="checkbox" id="so-auth" ${src?.authorized ? "checked" : ""}> Temos autorização para usar esta fonte.</label>`, actions: [{ key: "cancel", label: "Cancelar" }, { key: "ok", label: "Salvar", cls: "btn-primary" }], onAction: k => { if (k !== "ok") return true; const name = val("so-name"); if (!name) { App.toast("Informe o nome.", true); return false; } const url = val("so-url"); if (url && !U.safeUrl(url)) { App.toast("URL inválida.", true); return false; } const rec = { name, type: val("so-type"), url, terms: val("so-terms"), limits: val("so-limits"), authorized: document.getElementById("so-auth").checked }; if (src) Repo.update("job_sources", src.id, rec); else Repo.insert("job_sources", { ...rec, lastSync: null }); audit(src ? "Fonte editada" : "Fonte criada", name); App.render(); return true; } });
}
function jobModal(j) {
  App.modal({ title: j ? "Editar vaga" : "Nova vaga real", wide: true, body: JobForm(j || {}), actions: [...(j ? [{ key: "del", label: "Excluir", cls: "btn-danger" }] : []), { key: "cancel", label: "Cancelar" }, { key: "ok", label: "Salvar", cls: "btn-primary" }], onAction: k => {
    if (k === "del") { Repo.remove("jobs", x => x.id === j.id); Repo.all("jobs").forEach(x => { if (x.duplicateOf === j.id) x.duplicateOf = null; }); Repo.save(); Match.dedupeAll(); audit("Vaga excluída", j.id, j.title); App.render(); return true; }
    if (k !== "ok") return true;
    const title = val("jb-title"), company = val("jb-company"), city = val("jb-city"), rawUrl = val("jb-url"); const url = U.safeUrl(rawUrl);
    if (!title || !company || !city) { App.toast("Preencha cargo, empresa e cidade.", true); return false; }
    const isDemo = j ? j.isDemo : false;
    if (!isDemo && !url) { App.toast("Vaga real precisa de link individual válido (https://...).", true); return false; }
    if (url && /\/(vagas|jobs|search|busca)\/?(\?.*)?$/i.test(new URL(url).pathname + new URL(url).search) && !/\d/.test(new URL(url).pathname)) { App.toast("Esse link parece uma página de busca, não um anúncio individual.", true); return false; }
    const src = Repo.get("job_sources", val("jb-source"));
    const rec = { title, company, city, uf: val("jb-uf").toUpperCase(), modality: val("jb-mod"), level: val("jb-level"), family: val("jb-fam"), minSemester: +val("jb-minsem") || null, url, publishedAt: val("jb-pub"), deadline: val("jb-deadline"), requirements: lines(val("jb-req")), niceToHave: lines(val("jb-nice")), description: val("jb-desc"), sourceId: src?.id || "src_manual", source: src?.name || "Cadastro manual", salaryMin: +val("jb-salmin") || null, salaryMax: +val("jb-salmax") || null, companySize: val("jb-size"), lastCheckedAt: document.getElementById("jb-verified").checked ? U.now() : (j?.lastCheckedAt || null) };
    const dup = Match.findDuplicate({ ...rec, id: j?.id }, Repo.all("jobs").filter(x => !j || x.id !== j.id));
    if (dup && !j) { App.toast(`Duplicata de “${dup.title} — ${dup.company}”. Não cadastrada.`, true); return false; }
    if (j) Repo.update("jobs", j.id, rec); else Repo.insert("jobs", { ...rec, isDemo: false, status: "active", externalId: null, duplicateOf: null });
    Match.dedupeAll(); audit(j ? "Vaga editada" : "Vaga real cadastrada", title, company); App.toast("Vaga salva."); App.render(); return true;
  } });
}
function importJobsFromText(text) {
  let d; try { d = JSON.parse(text); } catch (x) { App.toast("JSON inválido.", true); return false; }
  const arr = Array.isArray(d) ? d : Array.isArray(d?.jobs) ? d.jobs : null; if (!arr) { App.toast("Não encontrei uma lista de vagas.", true); return false; }
  let added = 0, skipped = 0, dup = 0;
  arr.slice(0, 500).forEach(x => {
    const url = U.safeUrl(x.url); if (!url || !x.title || !x.company) { skipped++; return; }
    let city = String(x.city || ""), uf = String(x.uf || ""); const m = city.match(/^(.*?),\s*([A-Z]{2})$/); if (m) { city = m[1]; uf = m[2]; } if (city === "Outra") city = "";
    const verified = x.lastCheckedAt || (x.verified && x.verified !== "Pendente de verificação" && x.verified !== "Encerrada ou indisponível" ? (x.checked || U.today()) + "T12:00:00.000Z" : null);
    const j = { id: U.uid("job"), title: String(x.title).slice(0, 160), company: String(x.company).slice(0, 120), city: city || "Não informada", uf, modality: ["Presencial", "Híbrido", "Remoto"].includes(x.modality) ? x.modality : "Não informada", level: x.level || "Estágio", family: FAMILIES.some(f => f.key === x.family) ? x.family : "juridico", url, publishedAt: x.publishedAt || x.date || "", deadline: x.deadline || "", requirements: Array.isArray(x.requirements) ? x.requirements.map(String) : String(x.requirements || "").split(/[;\n]/).map(s => s.trim()).filter(Boolean).slice(0, 12), niceToHave: [], description: String(x.description || x.reason || "").slice(0, 600), salaryMin: +x.salaryMin || null, salaryMax: +x.salaryMax || null, companySize: COMPANY_SIZES.includes(x.companySize) ? x.companySize : "Não informado", sourceId: "src_manual", source: x.source || "Importação", isDemo: false, status: x.verified === "Encerrada ou indisponível" ? "expired" : "active", lastCheckedAt: verified, externalId: null, duplicateOf: null, createdAt: U.now() };
    if (Match.findDuplicate(j, Repo.all("jobs"))) { dup++; return; }
    Repo.all("jobs").push(j); added++;
  });
  Repo.save(); audit("Importação de vagas", "JSON", `${added} novas, ${dup} duplicadas, ${skipped} inválidas`);
  App.toast(`${added} importada(s), ${dup} duplicada(s), ${skipped} sem link válido.`); App.render(); return true;
}

const Changes = {
  rangeLabel(el) { el.closest(".field").querySelector("label").textContent = `Aderência mínima para receber vagas: ${el.value}%`; },
  weightLabel(el) { document.getElementById("wl-" + el.id.slice(2)).textContent = el.value; },
  jobFilter() { App.ui.jobFilter = { q: val("jf-q"), city: val("jf-city"), mod: val("jf-mod"), lvl: val("jf-lvl"), fam: val("jf-fam"), sal: val("jf-sal"), size: val("jf-size"), stage: val("jf-stage") }; App.render(); },
  apStatus(el) { document.getElementById("ap-proof").classList.toggle("hidden", !NEEDS_PROOF.includes(el.value) || document.querySelector(".modal .pill.ok")?.textContent === "Envio confirmado"); document.getElementById("ap-int").classList.toggle("hidden", el.value !== "Entrevista agendada"); },
  importFile(el) { const f = el.files[0]; if (!f) return; if (!/\.txt$/i.test(f.name) && f.type !== "text/plain") { App.toast(Integrations.call("files").reason + " Copie o texto do arquivo e cole no campo.", true); el.value = ""; return; } if (f.size > 1e6) return App.toast("Arquivo grande demais.", true); const r = new FileReader(); r.onload = () => { App.ui.importText = String(r.result); App.render(); App.toast("Texto carregado. Clique em “Separar seções e conferir”."); }; r.readAsText(f); },
  importJobsFile(el) { const f = el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { document.getElementById("ij-text").value = String(r.result); }; r.readAsText(f); },
};
const Inputs = {
  jobFilter() { Changes.jobFilter(); },
  userQ(el) { App.ui.userQ = el.value; App.render(); },
  admJobQ(el) { App.ui.admJobQ = el.value; App.render(); },
};

const Forms = {
  async login(f) { const email = val("li-email").toLowerCase(); const u = Repo.one("users", x => x.email.toLowerCase() === email); if (!u || !u.passwordHash || u.passwordHash !== await passHash(val("li-pass"))) return App.toast("E-mail ou senha incorretos.", true); if (u.status !== "ativo") return App.toast("Conta suspensa.", true); startSession(u); },
  async signup(f) {
    const name = val("su-name"), email = val("su-email").toLowerCase(), pass = val("su-pass");
    if (name.length < 3) return App.toast("Informe seu nome completo.", true);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return App.toast("E-mail inválido.", true);
    if (pass.length < 8) return App.toast("A senha precisa de 8 caracteres ou mais.", true);
    if (!document.getElementById("su-terms").checked) return App.toast("É preciso aceitar os termos para criar a conta.", true);
    if (Repo.one("users", u => u.email.toLowerCase() === email)) return App.toast("Já existe conta com esse e-mail. Entre ou recupere a senha.", true);
    const u = Repo.insert("users", { name, email, passwordHash: await passHash(pass), role: "candidate", status: "ativo", city: val("su-city"), uf: val("su-uf"), origin: val("su-origin") || null, area: null, ageRange: null, consents: { terms: true, termsAt: U.now(), marketing: document.getElementById("su-mkt").checked, whatsapp: document.getElementById("su-wa").checked }, lastActiveAt: U.now() });
    Repo.insert("subscriptions", { userId: u.id, plan: "inicial", status: "ativa", startedAt: U.now(), simulated: true });
    Repo.insert("notification_preferences", { userId: u.id, inApp: true, email: false, whatsapp: document.getElementById("su-wa").checked, frequency: "diária" });
    Cand.profile(u);
    notify(u.id, "Bem-vindo ao Manda Vaga", "Comece pelo currículo: é ele que define as vagas que você vai receber.", "ok", "cand.resume");
    audit("Cadastro", u.id); startSession(u);
  },
  async forgot(f) {
    if (!App.ui.forgotCode) { const email = val("fg-email").toLowerCase(); const u = Repo.one("users", x => x.email.toLowerCase() === email); App.ui.forgotEmail = email; if (!u) return App.toast("Se o e-mail existir, um código será gerado.", false); App.ui.forgotCode = String(Math.floor(100000 + Math.random() * 900000)); return App.render(); }
    if (val("fg-code") !== App.ui.forgotCode) return App.toast("Código incorreto.", true);
    if (val("fg-pass").length < 8) return App.toast("A nova senha precisa de 8 caracteres ou mais.", true);
    const u = Repo.one("users", x => x.email.toLowerCase() === App.ui.forgotEmail); Repo.update("users", u.id, { passwordHash: await passHash(val("fg-pass")) }); audit("Senha redefinida", u.id); App.ui.forgotCode = null; App.toast("Senha alterada. Entre com a nova senha."); App.go("login");
  },
  profile(f) {
    const s = me(); const p = Cand.profile(s); const fd = new FormData(f);
    const email = val("pf-email").toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return App.toast("E-mail inválido.", true);
    if (Repo.one("users", u => u.id !== s.id && u.email.toLowerCase() === email)) return App.toast("E-mail já usado por outra conta.", true);
    const famNames = fd.getAll("pf-fam");
    Repo.update("users", s.id, { name: val("pf-name") || s.name, email, city: val("pf-city"), uf: val("pf-uf").toUpperCase(), ageRange: val("pf-age") || null, consents: Object.assign({}, s.consents, { marketing: !!fd.get("cs-mkt") }) });
    Repo.update("profiles", p.id, { city: val("pf-city"), uf: val("pf-uf").toUpperCase(), city2: val("pf-city2"), availability: val("pf-avail"), course: val("pf-course"), semester: +val("pf-sem") || null, careerStage: val("pf-stage") || null, salaryMin: +val("pf-salary") || null, targetRoles: lines(val("pf-roles")), families: FAMILIES.filter(x => famNames.includes(x.name)).map(x => x.key), modalities: fd.getAll("pf-mod"), levels: fd.getAll("pf-lvl"), minScore: +val("pf-min") });
    const np = Repo.one("notification_preferences", x => x.userId === s.id); const pref = { inApp: !!fd.get("np-inapp"), email: !!fd.get("np-email"), whatsapp: !!fd.get("np-wa") };
    if (np) Repo.update("notification_preferences", np.id, pref); else Repo.insert("notification_preferences", { userId: s.id, ...pref });
    App.toast(pref.email || pref.whatsapp ? "Perfil salvo. Consentimento registrado; envios externos começam quando a integração for conectada." : "Perfil salvo."); App.render();
  },
  resume(f) {
    const s = me(); const d = collectResume(f); const r = Cand.resume(s);
    const bad = d.experiences.filter(x => !x.org || !x.role); if (bad.length) return App.toast("Cada experiência precisa de empresa e cargo.", true);
    const badY = d.experiences.filter(x => x.start && !Resume.year(x.start)); if (badY.length) return App.toast("Use o ano com 4 dígitos no início das experiências.", true);
    const ch = sectionChanges(r?.data, d);
    if (r && !ch.length) return App.toast("Nada mudou.");
    saveResumeData(s, d, r ? "Edição manual: " + ch.map(c => c.field).join(", ") : "Versão inicial (preenchimento manual)", ch);
    App.ui.resumeDraft = null; App.toast("Currículo salvo. Nova versão no histórico."); App.render();
  },
  plans(f) { const fd = new FormData(f); const plans = Plans.list().map((p, i) => ({ ...p, price: Math.max(0, +fd.get(`pl-price-${i}`) || p.price), limit: Math.max(1, Math.round(+fd.get(`pl-limit-${i}`) || p.limit)) })); Repo.setSetting("plans", plans); audit("Planos alterados", "", plans.map(p => `${p.name}:${p.limit}`).join(", ")); App.toast("Planos salvos."); App.render(); },
  weights(f) { const fd = new FormData(f); const w = {}; Object.keys(DIM_LABEL).forEach(k => w[k] = +fd.get("w-" + k)); if (!Object.values(w).some(Boolean)) return App.toast("Pelo menos uma dimensão precisa de peso.", true); Repo.setSetting("weights", w); audit("Pesos de aderência alterados", "", JSON.stringify(w)); App.toast("Pesos salvos. As pontuações já foram recalculadas."); App.render(); },
};

/* ---------------- eventos globais ---------------- */
document.addEventListener("click", ev => {
  const mb = ev.target.closest("[data-modal]");
  if (mb && App._modal) { const k = mb.dataset.modal; if (k === "close") return App.closeModal(); const r = App._modal.onAction ? App._modal.onAction(k) : true; if (r !== false && App._modal && App._modal.el.contains(mb)) App.closeModal(); return; }
  if (ev.target.dataset && ev.target.dataset.modalBg) return App.closeModal();
  const g = ev.target.closest("[data-go]");
  if (g) { ev.preventDefault(); let [page, tab] = g.dataset.go.split(":"); if (tab) App.ui.resumeTab = tab; if (page === "cand.resume" && !tab && !g.closest(".nav")) {} App.closeModal(); return App.go(page, g.dataset.id ? { id: g.dataset.id } : {}); }
  const a = ev.target.closest("[data-act]");
  if (a && Actions[a.dataset.act]) { ev.preventDefault(); Actions[a.dataset.act](a, ev); }
});
document.addEventListener("submit", ev => { const f = ev.target.closest("form[data-form]"); if (!f) return; ev.preventDefault(); Forms[f.dataset.form]?.(f); });
document.addEventListener("change", ev => { const el = ev.target.closest("[data-change]"); if (el && Changes[el.dataset.change]) Changes[el.dataset.change](el); });
let inputTimer; document.addEventListener("input", ev => { const el = ev.target.closest("[data-input]"); if (el && Inputs[el.dataset.input]) { clearTimeout(inputTimer); inputTimer = setTimeout(() => Inputs[el.dataset.input](el), 250); } if (ev.target.id === "pf-min") Changes.rangeLabel(ev.target); });
document.addEventListener("keydown", ev => { if (ev.key === "Escape") { if (App._modal) App.closeModal(); else App.closeMenu(); } });

async function seedFresh() {
  const hashes = { demo: await passHash(DEMO_PASSWORD) };
  Repo.init(buildSeed(hashes)); Repo.data.session = null; Match.dedupeAll(); Repo.save();
}
async function boot() {
  if (!Repo.load()) await seedFresh();
  if (!LocalAdapter.ok) setTimeout(() => App.toast("Este navegador bloqueou o armazenamento local. O app funciona, mas os dados somem ao fechar.", true), 400);
  const underApp = /\/app(\/|$)/.test(location.pathname); // no site, a landing fica em "/" e o app em "/app/"
  App.route = { page: Repo.data.session ? "home" : (underApp ? "login" : "landing"), params: {} };
  applyTheme(); App.render();
}
boot();
