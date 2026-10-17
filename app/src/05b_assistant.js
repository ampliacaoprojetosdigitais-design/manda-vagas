/* =====================================================================
   DASHBOARD COM ASSISTENTE EM CONVERSA
   Regras locais e determinísticas. Nada aqui é IA externa: quando o
   provedor for conectado, o motor de respostas troca, a tela fica.
   ===================================================================== */
const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const Assistant = {
  /* fotografia do estado do candidato, usada por todas as respostas */
  state(s) {
    const r = Cand.resume(s); const has = Cand.hasResume(s); const prof = Cand.profile(s);
    const diag = r ? Resume.analyze(r.data) : null;
    const sugg = r ? Resume.suggestions(r.data).filter(x => !(r.dismissed || []).includes(x.id)) : [];
    const recs = has ? Cand.recommendations(s).filter(x => !x.locked) : [];
    const apps = Cand.apps(s);
    const pending = apps.filter(a => ["Aguardando ação do candidato", "Envio tentado — sem confirmação"].includes(a.status));
    const active = apps.filter(a => !["Processo encerrado", "Vaga expirada/indisponível", "Descartada"].includes(a.status));
    const preparing = active.filter(a => !a.confirmed && !pending.includes(a));
    const interviews = apps.filter(a => a.status === "Entrevista agendada" && a.interview?.date && a.interview.date >= U.today()).sort((a, b) => a.interview.date.localeCompare(b.interview.date));
    const plan = Plans.of(s.id);
    return { r, has, prof, diag, sugg, recs, apps, pending, active, preparing, interviews, plan, used: Plans.used(s.id), integrity: diag?.items.find(i => i.id === "integrity" && i.status === "fail") };
  },
  jobTitle(a) { const j = Repo.get("jobs", a.jobId); return j ? `${j.title} — ${j.company}` : (a.jobTitle || "Vaga"); },
  company(a) { const j = Repo.get("jobs", a.jobId); return j?.company || a.jobCompany || "essa vaga"; },
  hello() { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; },

  /* abertura: resumo + a pergunta do próximo passo */
  opening(s) {
    const st = Assistant.state(s); const first = s.name.split(" ")[0]; const out = [];
    if (!st.has) {
      out.push({ text: `${Assistant.hello()}, ${first}. Eu sou o assistente do Manda Vaga. Antes de buscar vagas, preciso conhecer o seu currículo: é ele que define o que eu vou trazer para você.` });
      out.push({ text: "Como prefere começar?", chips: [["go", "cand.resume:import", "Colar meu currículo"], ["go", "cand.resume:editor", "Preencher do zero"], ["intent", "how", "Como funciona?"]] });
      return out;
    }
    if (st.plan.limit === 0) {
      out.push({ html: `${Assistant.hello()}, ${e(first)}. Seu currículo está com nota <b>${st.diag.score}/100</b>${st.sugg.length ? ` e tem <b>${pl(st.sugg.length, "ajuste sugerido", "ajustes sugeridos")}</b>` : ""}. No plano Grátis você deixa o currículo pronto para recrutadores e sistemas de IA.` });
      out.push({ html: `Quando quiser receber vagas escolhidas pelo seu currículo: ${Plans.list().filter(p => p.limit).map(p => `<b>${e(p.name)}</b>, até ${p.limit} vagas de uma vez`).join(", ")}. O Max inclui envio facilitado e a Central de Respostas.`, chips: [["go", "cand.resume:diag", "Melhorar meu currículo"], ["go", "cand.plan", "Ver planos"]] });
      return out;
    }
    const facts = [];
    facts.push(`<b>${pl(st.recs.length, "vaga compatível", "vagas compatíveis")}</b> acima de ${st.prof.minScore}%`);
    if (st.pending.length) facts.push(`<b>${pl(st.pending.length, "candidatura", "candidaturas")}</b> esperando ação sua`);
    if (st.interviews.length) facts.push(`entrevista em <b>${U.fmtDate(st.interviews[0].interview.date)}</b>`);
    if (st.sugg.length) facts.push(`<b>${pl(st.sugg.length, "ajuste sugerido", "ajustes sugeridos")}</b> no currículo`);
    const list = facts.length > 1 ? facts.slice(0, -1).join(", ") + " e " + facts.at(-1) : facts[0];
    out.push({ html: `${Assistant.hello()}, ${e(first)}. Hoje você tem ${list}.` });
    if (st.integrity) out.push({ text: "Antes de tudo, um ponto importante: o seu resumo afirma um tempo de experiência que as datas não sustentam. Recrutador costuma conferir isso. Quer corrigir agora?", chips: [["go", "cand.resume:diag", "Revisar o currículo"], ["intent", "later", "Depois"]] });
    if (st.interviews.length) { const a = st.interviews[0]; out.push({ html: `Lembrete: entrevista para <b>${e(Assistant.jobTitle(a))}</b> em ${U.fmtDate(a.interview.date)}${a.interview.time ? " às " + e(a.interview.time) : ""}${a.interview.place ? ` (${e(a.interview.place)})` : ""}.`, chips: [["app", a.id, "Ver candidatura"]] }); }
    if (st.pending.length) { const a = st.pending[0]; out.push({ html: `A candidatura para <b>${e(Assistant.jobTitle(a))}</b> está parada em “${e(a.status)}”.${a.next ? ` Próximo passo: ${e(a.next)}.` : ""}`, chips: [["app", a.id, "Abrir candidatura"], ["intent", "resolved:" + a.id, "Já resolvi"]] }); }
    const focus = st.pending[0] || st.preparing[0];
    const chips = [];
    if (focus) chips.push(["app", focus.id, "Continuar a candidatura"]);
    chips.push(["intent", "widen", "Ampliar a lista de vagas"], ["intent", "top", "Ver as melhores vagas"]);
    const fj = focus ? Repo.get("jobs", focus.jobId) : null;
    out.push({ html: focus ? `Agora me diga: vamos continuar a candidatura para <b>${e(fj?.title || focus.jobTitle || "a vaga")}</b>${fj ? ` (${e(fj.company)})` : ""} ou você prefere que eu amplie a lista de vagas para ter mais opções?` : "Por onde quer seguir: ver as melhores vagas de agora ou ampliar a lista para ter mais opções?", chips });
    return out;
  },

  /* respostas a botões e a texto livre */
  reply(s, intent, arg) {
    const st = Assistant.state(s);
    if (intent === "top") {
      const top = st.recs.slice(0, 3);
      if (!top.length) return [{ text: "Não há vagas acima da sua aderência mínima agora. Posso ampliar a lista reduzindo a aderência mínima.", chips: [["intent", "widen", "Ampliar a lista"]] }];
      return [{ text: top.length === 1 ? "Esta é a melhor vaga agora, pela aderência ao seu currículo:" : `Estas são as ${top.length} melhores agora, pela aderência ao seu currículo:`, jobs: top.map(x => x.job.id) }, { text: "Quer que eu gere o currículo para alguma delas ou prefere ver todas?", chips: [["go", "cand.jobs", "Ver todas as vagas"], ["intent", "widen", "Ampliar a lista"]] }];
    }
    if (intent === "widen") {
      const prof = Cand.profile(s); const old = prof.minScore || 40; if (old <= 20) return [{ text: "Sua aderência mínima já está em 20%, o menor valor útil. Para ampliar mais, inclua cidades, modalidades ou níveis no perfil.", chips: [["go", "cand.profile", "Abrir preferências"]] }];
      const before = st.recs.length; const nv = Math.max(20, old - 10); Repo.update("profiles", prof.id, { minScore: nv }); const after = Cand.recommendations(s).filter(x => !x.locked).length;
      return [{ html: `Feito. Baixei a aderência mínima de <b>${old}%</b> para <b>${nv}%</b>. Agora são <b>${pl(after, "vaga", "vagas")}</b>${after > before ? ` (<b>+${after - before}</b>)` : ""}. As novas têm mais lacunas: confira o motivo de cada uma antes de se candidatar.`, chips: [["intent", "top", "Ver as melhores"], ["intent", "undoWiden:" + old, "Desfazer"]] }];
    }
    if (intent === "undoWiden") { const prof = Cand.profile(s); Repo.update("profiles", prof.id, { minScore: +arg }); return [{ text: `Voltei a aderência mínima para ${arg}%.` }]; }
    if (intent === "resolved") { const a = Repo.get("applications", arg); if (!a || a.userId !== s.id) return [{ text: "Não encontrei essa candidatura." }]; return [{ html: `Ótimo. O que aconteceu com <b>${e(Assistant.jobTitle(a))}</b>? Se o portal mostrou confirmação, registre o protocolo para eu contar como enviada.`, chips: [["app", a.id, "Registrar o que aconteceu"]] }]; }
    if (intent === "plan") return [{ html: `Você está no plano <b>${e(st.plan.name)}</b>: ${st.used} de ${st.plan.limit} oportunidades únicas usadas neste mês. Rever a mesma vaga não gasta de novo.`, chips: [["go", "cand.plan", "Ver planos"]] }];
    if (intent === "resume") { if (!st.has) return Assistant.opening(s); return [{ html: `Seu currículo está com nota <b>${st.diag.score}/100</b> em clareza e estrutura${st.sugg.length ? ` e tem <b>${pl(st.sugg.length, "sugestão", "sugestões")}</b> para revisar` : ""}. ${st.r.status === "revisado" ? "Você já marcou como revisado." : "Ainda está como rascunho."}`, chips: [["go", "cand.resume:diag", "Abrir diagnóstico"], ["go", "cand.resume:keywords", "Ver palavras-chave"]] }]; }
    if (intent === "apps") { if (!st.apps.length) return [{ text: "Você ainda não registrou candidaturas. Quando gostar de uma vaga, use “Registrar que vou me candidatar”.", chips: [["intent", "top", "Ver as melhores vagas"]] }]; const sent = st.apps.filter(a => a.confirmed).length; return [{ html: `Você tem <b>${pl(st.active.length, "candidatura", "candidaturas")}</b> em andamento e <b>${sent}</b> com envio confirmado.${st.pending.length ? ` ${st.pending.length === 1 ? "<b>1</b> espera" : `<b>${st.pending.length}</b> esperam`} ação sua.` : ""}`, chips: [["go", "cand.apps", "Abrir candidaturas"], ...(st.pending[0] ? [["app", st.pending[0].id, "Continuar a pendente"]] : [])] }]; }
    if (intent === "how") return [{ text: "Funciona em três etapas: primeiro organizo o seu currículo só com o que você realmente fez; depois cruzo com as vagas e explico a aderência de cada uma; por fim você decide onde se candidatar e eu acompanho o andamento. Nada é enviado sem você." }];
    if (intent === "later") return [{ text: "Combinado. O aviso continua no diagnóstico do currículo." }];
    if (intent === "send") return [{ text: "Eu não envio candidaturas sozinho. Abro o anúncio original, preparo o currículo para a vaga e você clica em enviar no site da empresa. Depois registramos aqui o protocolo.", chips: [["intent", "top", "Ver vagas"]] }];
    return [{ text: "Por enquanto eu entendo perguntas sobre currículo, vagas, candidaturas e plano. A conversa livre com IA entra quando o provedor for conectado.", chips: [["intent", "top", "Melhores vagas"], ["intent", "resume", "Meu currículo"], ["intent", "apps", "Minhas candidaturas"], ["intent", "plan", "Meu plano"]] }];
  },
  parse(text) {
    const t = U.norm(text);
    if (/ampli|mais vagas|mais opc|aument/.test(t)) return ["widen"];
    if (/melhor|vaga|oportunidad|emprego|estagio/.test(t)) return ["top"];
    if (/curricul|cv|resumo|diagnost/.test(t)) return ["resume"];
    if (/candidat|status|resposta|entrevist|protocolo/.test(t)) return ["apps"];
    if (/plano|limite|pagar|preco|assinatura/.test(t)) return ["plan"];
    if (/envi|mandar|aplicar|automatic/.test(t)) return ["send"];
    if (/como funciona|ajuda|o que voce faz/.test(t)) return ["how"];
    return ["fallback"];
  },
};

function ChatMessage(m) {
  if (m.who === "me") return `<div class="msg me"><div class="bubble">${e(m.text)}</div></div>`;
  const jobs = (m.jobs || []).map(id => { const j = Repo.get("jobs", id); if (!j) return ""; const mm = Match.score(Cand.profile(App.session()), Cand.ev(App.session()), j); return `<div class="chat-job">${C.score(mm.score)}<div class="grow" style="min-width:0"><b>${e(j.title)}</b><div class="xs muted">${e(j.company)} · ${e(j.city)} · ${e(j.modality)} · ${e(salaryText(j))}</div>${mm.matched.length ? `<div class="xs" style="margin-top:3px">Combina: ${mm.matched.slice(0, 3).map(e).join(", ")}</div>` : ""}</div><div class="stack-sm"><button class="btn btn-primary btn-sm" data-go="cand.job" data-id="${e(j.id)}">Ver motivo</button><button class="btn btn-ghost btn-sm" data-act="tailorResume" data-id="${e(j.id)}">Gerar currículo</button></div></div>`; }).join("");
  return `<div class="msg bot"><span class="bot-avatar" aria-hidden="true">MV</span><div class="bot-body"><div class="bubble">${m.html || e(m.text)}</div>${jobs ? `<div class="stack-sm">${jobs}</div>` : ""}${m.chips?.length ? `<div class="chips quick">${m.chips.map(([kind, arg, label]) => `<button class="qr" data-act="chat" data-kind="${e(kind)}" data-arg="${e(arg)}">${e(label)}</button>`).join("")}</div>` : ""}</div></div>`;
}

Views["cand.home"] = (s) => {
  if (!App.ui.chat || App.ui.chatUser !== s.id) { App.ui.chat = Assistant.opening(s).map(m => ({ ...m, who: "bot" })); App.ui.chatUser = s.id; }
  const st = Assistant.state(s);
  const steps = [
    [!!(st.prof.targetRoles || []).length && !!st.prof.city, "Perfil e cargos-alvo", "cand.profile"],
    [st.has, "Currículo-base", "cand.resume"],
    [st.r?.status === "revisado", "Currículo revisado", "cand.resume:diag"],
    [st.apps.length > 0, "Primeira candidatura registrada", "cand.jobs"],
  ];
  const done = steps.filter(x => x[0]).length;
  const sent = st.apps.filter(a => a.confirmed).length;
  return `<div class="dash">
    <section class="card chat" aria-label="Assistente Manda Vaga">
      <header class="chat-head"><span class="bot-avatar lg" aria-hidden="true">MV</span><div><b>Assistente Manda Vaga</b><div class="xs muted">Responde com base no seu currículo, vagas e candidaturas</div></div><button class="btn btn-ghost btn-sm" data-act="chatReset" title="Recomeçar a conversa">Recomeçar</button></header>
      <div class="chat-log" id="chat-log" aria-live="polite">${App.ui.chat.map(ChatMessage).join("")}</div>
      <form class="chat-input" data-form="chat" autocomplete="off"><label for="chat-text" class="hidden">Mensagem</label><input class="input" id="chat-text" name="chat-text" placeholder="Pergunte sobre vagas, currículo, candidaturas ou plano…"><button class="btn btn-primary" type="submit" aria-label="Enviar">↑</button></form>
    </section>
    <aside class="stack">
      <div class="card stack-sm"><div class="row-between"><h3>Seu progresso</h3><span class="pill ${done === 4 ? "ok" : "info"}">${done}/4</span></div>${steps.map(([ok, t, go]) => `<button class="mini-step ${ok ? "done" : ""}" data-go="${go}"><span class="tick">${ok ? "✓" : ""}</span>${e(t)}</button>`).join("")}</div>
      <div class="grid g2" style="gap:10px">
        <div class="card stat"><span class="k">Nota do currículo</span><span class="v">${st.diag ? st.diag.score : "—"}</span></div>
        <div class="card stat"><span class="k">Vagas compatíveis</span><span class="v">${st.recs.length}</span></div>
        <div class="card stat"><span class="k">Envios confirmados</span><span class="v">${sent}</span></div>
        <div class="card stat"><span class="k">Ações suas</span><span class="v">${st.pending.length}</span></div>
      </div>
      <div class="card stack-sm"><div class="row-between small"><b>Plano ${e(st.plan.name)}</b><span class="num muted">${st.used}/${st.plan.limit}</span></div>${C.meter(st.used, st.plan.limit, "", true)}<span class="xs muted">Oportunidades únicas entregues este mês</span></div>
      ${C.notice("O assistente usa regras locais e só fala do que está nos seus dados. Ele não envia candidaturas nem mensagens.", "info")}
    </aside></div>`;
};
