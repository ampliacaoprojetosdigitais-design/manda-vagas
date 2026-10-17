/* =====================================================================
   RECURSOS DO PLANO MAX: envio facilitado e Central de Respostas
   ===================================================================== */
const MaxFeat = {
  cover(s, a) {
    const j = Repo.get("jobs", a.jobId) || {}; const r = Cand.resume(s); const d = r?.data || Resume.empty();
    const ev = Cand.ev(s); const m = j.title ? Match.score(Cand.profile(s), ev, j) : { matched: [] };
    const first = String(d.summary || "").split(/(?<=\.)\s/)[0] || "";
    return `Olá, equipe de recrutamento${j.company ? " da " + j.company : ""}.\n\nMeu nome é ${s.name} e tenho interesse na vaga de ${j.title || a.jobTitle || "a vaga anunciada"}.${first ? " " + first : ""}\n\n${m.matched.length ? `Destaco experiência em ${m.matched.slice(0, 3).join(", ").toLowerCase()}.\n\n` : ""}Envio meu currículo em anexo e fico à disposição para conversar.\n\nAtenciosamente,\n${s.name}\n${s.email}`;
  },
  replyDraft(s, a, type) {
    const j = Repo.get("jobs", a.jobId) || {}; const who = j.company ? `equipe da ${j.company}` : "equipe";
    const t = { convite: `Olá, ${who}.\n\nObrigado pelo convite para a entrevista da vaga de ${j.title || "a vaga"}. Confirmo minha participação na data e horário indicados.\n\nAtenciosamente,\n${s.name}`, docs: `Olá, ${who}.\n\nObrigado pelo retorno. Segue o que foi solicitado para a vaga de ${j.title || "a vaga"}. Se precisarem de mais alguma informação, fico à disposição.\n\nAtenciosamente,\n${s.name}`, recusa: `Olá, ${who}.\n\nObrigado pelo retorno sobre a vaga de ${j.title || "a vaga"}. Fico à disposição para futuras oportunidades.\n\nAtenciosamente,\n${s.name}`, outra: `Olá, ${who}.\n\nObrigado pelo contato sobre a vaga de ${j.title || "a vaga"}.\n\nAtenciosamente,\n${s.name}` };
    return t[type] || t.outra;
  },
};
const RESP_TYPES = [["convite", "Convite para entrevista"], ["docs", "Pedido de documentos ou teste"], ["recusa", "Recusa"], ["outra", "Outra resposta"]];

function EnvioPanel(s, a) {
  if (!Plans.has(s.id, "envio")) return `<div class="notice info"><span class="ic">✉</span><div><b>Envio facilitado é do plano Max.</b> Mensagem de apresentação pronta para cada vaga, envio pelo seu e-mail e registro automático da tentativa. <button type="button" class="btn-link" data-go="cand.plan">Ver o Max</button></div></div>`;
  if (a.confirmed) return "";
  const j = Repo.get("jobs", a.jobId);
  return `<div class="sunken stack-sm"><div class="row-between"><b>Envio facilitado</b>${C.pill("Plano Max", "lime")}</div>
    <p class="small muted">Mensagem de apresentação montada com o seu currículo e a vaga. Revise antes de usar.</p>
    <textarea id="ap-cover" class="textarea" rows="8">${e(MaxFeat.cover(s, a))}</textarea>
    <div class="row">${j?.url ? `<a class="btn btn-primary btn-sm" href="${e(j.url)}" target="_blank" rel="noopener noreferrer">Abrir anúncio para enviar ↗</a>` : ""}<button type="button" class="btn btn-soft btn-sm" data-act="copyCover">Copiar mensagem</button><button type="button" class="btn btn-ghost btn-sm" data-act="sendEmail">Enviar pelo meu e-mail</button><button type="button" class="btn btn-ghost btn-sm" data-act="markTried" data-id="${e(a.id)}">Já enviei pelo site</button></div>
    <p class="xs muted">Nos portais (Gupy, LinkedIn e outros) o envio final é seu: eles não permitem robôs. Depois registre o protocolo para contar como enviada.</p></div>`;
}

Views["cand.responses"] = (s) => {
  if (!Plans.has(s.id, "respostas")) return `${C.head("Etapa 3", "Central de Respostas")}<div class="card">${C.empty("A Central de Respostas é do plano Max", "Registre convites, pedidos de documentos e recusas de cada empresa, com sugestão de resposta pronta e o status da candidatura atualizado sozinho.", `<button class="btn btn-primary" data-go="cand.plan">Conhecer o Max</button>`)}</div>`;
  const apps = Cand.apps(s).filter(a => !["Descartada"].includes(a.status));
  const all = apps.flatMap(a => (a.responses || []).map(r => ({ ...r, a }))).sort((x, y) => String(y.date).localeCompare(String(x.date)));
  const label = Object.fromEntries(RESP_TYPES);
  return `${C.head("Etapa 3", "Central de Respostas", "Cada retorno das empresas ligado à sua candidatura, com o próximo passo e uma sugestão de resposta.", C.pill("Plano Max", "lime"))}
  ${C.notice("Por enquanto você registra as respostas aqui. A leitura automática do seu e-mail entra quando a integração for conectada, sempre com a sua autorização.", "info")}
  <div class="grid g-main" style="margin-top:14px"><div class="card"><div class="card-head"><h2>Candidaturas em andamento</h2><span class="pill">${apps.length}</span></div>
    ${apps.length ? apps.map(a => `<div class="row-between" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="grow" style="min-width:0"><b>${e(Assistant.jobTitle(a))}</b><div class="xs muted">${e(a.status)}${(a.responses || []).length ? ` · ${a.responses.length} resposta(s) registrada(s)` : " · nenhuma resposta ainda"}</div></div><button class="btn btn-soft btn-sm" data-act="addResponse" data-id="${e(a.id)}">Registrar resposta</button></div>`).join("") : C.empty("Nenhuma candidatura", "Registre uma candidatura para acompanhar as respostas.", `<button class="btn btn-primary btn-sm" data-go="cand.jobs">Ver vagas</button>`)}
  </div><div class="card"><h2 style="margin-bottom:10px">Últimas respostas</h2>${all.length ? `<div class="timeline">${all.slice(0, 12).map(r => `<div class="t"><b>${e(label[r.type] || r.type)}</b> <span class="xs muted">${U.fmtDate(r.date)} · ${e(r.channel)}</span><div class="xs">${e(Assistant.jobTitle(r.a))}</div>${r.summary ? `<div class="xs muted">${e(r.summary)}</div>` : ""}</div>`).join("")}</div>` : '<p class="small muted">Nada registrado ainda.</p>'}</div></div>`;
};
