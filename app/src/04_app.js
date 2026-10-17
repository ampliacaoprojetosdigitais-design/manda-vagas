/* =====================================================================
   CAMADA 4 — interface: estado da tela, navegação, modais e eventos
   ===================================================================== */
const e = U.esc;
const App = {
  route: { page: "landing", params: {} },
  ui: {},            // estado efêmero por tela (filtros, abas)
  _modal: null,
  session() { const id = Repo.data?.session; return id ? Repo.get("users", id) : null; },
  go(page, params = {}) { this.route = { page, params }; this.closeMenu(); this.render(); window.scrollTo({ top: 0 }); },
  toast(msg, bad) { const box = document.getElementById("toasts"); const t = document.createElement("div"); t.className = "toast" + (bad ? " bad" : ""); t.setAttribute("role", "status"); t.textContent = msg; box.appendChild(t); setTimeout(() => t.remove(), 3600); },
  closeMenu() { document.querySelector(".rail")?.classList.remove("open"); document.querySelector(".scrim")?.remove(); },
  openMenu() { document.querySelector(".rail")?.classList.add("open"); const s = document.createElement("div"); s.className = "scrim"; s.dataset.act = "closeMenu"; document.body.appendChild(s); },

  /* modal: corpo em HTML + ações; resolve com callback */
  modal({ title, body, actions = [], wide = false, onAction }) {
    this.closeModal();
    const bg = document.createElement("div"); bg.className = "modal-bg"; bg.dataset.modalBg = "1";
    bg.innerHTML = `<div class="modal${wide ? " wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="row-between"><h2 id="modal-title">${e(title)}</h2><button class="btn btn-ghost btn-sm" data-modal="close" aria-label="Fechar">✕</button></div><div class="stack">${body}</div><div class="modal-actions">${actions.map(a => `<button class="btn ${a.cls || "btn-ghost"}" data-modal="${e(a.key)}">${e(a.label)}</button>`).join("")}</div></div>`;
    document.body.appendChild(bg); this._modal = { el: bg, onAction };
    setTimeout(() => (bg.querySelector("input,textarea,select,[data-modal]:not([data-modal=close])") || bg.querySelector("button"))?.focus(), 30);
  },
  closeModal() { this._modal?.el.remove(); this._modal = null; },
  confirm(title, body, okLabel, cb, danger) { this.modal({ title, body: `<p>${body}</p>`, actions: [{ key: "cancel", label: "Cancelar" }, { key: "ok", label: okLabel, cls: danger ? "btn-danger" : "btn-primary" }], onAction: k => { if (k === "ok") cb(); return true; } }); },

  /* exportação: arquivo quando o navegador permite + texto para copiar sempre */
  exportText(title, filename, text, mime = "text/plain;charset=utf-8") {
    this.modal({ title, wide: true, body: `<p class="small muted">Se o download não começar (alguns visualizadores bloqueiam), use “Copiar” e cole num editor de texto.</p><textarea id="export-text" class="textarea mono" style="min-height:300px" readonly>${e(text)}</textarea>`, actions: [{ key: "copy", label: "Copiar" }, { key: "dl", label: "Baixar " + filename.split(".").pop().toUpperCase(), cls: "btn-primary" }], onAction: k => {
      if (k === "copy") { const ta = document.getElementById("export-text"); navigator.clipboard?.writeText(text).then(() => App.toast("Copiado.")).catch(() => { ta.select(); App.toast("Selecionado. Use Ctrl+C para copiar."); }); return false; }
      if (k === "dl") {
        if (window.claude?.use) { window.claude.use("downloads").then(dl => { if (!dl) return App.toast("Download indisponível aqui. Use Copiar.", true); return dl.save({ filename, data: text }).then(() => App.toast("Arquivo salvo: " + filename)).catch(err => App.toast(err?.code === "declined" ? "Download cancelado." : "Não foi possível baixar aqui. Use Copiar.", err?.code !== "declined")); }); return false; }
        try { const b = new Blob([text], { type: mime }), url = URL.createObjectURL(b), a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); App.toast("Download iniciado: " + filename); } catch (err) { App.toast("O download foi bloqueado. Use Copiar.", true); } return false; }
      return true;
    } });
  },

  render() {
    const root = document.getElementById("app");
    const active = document.activeElement; const fid = active && active.id; const sel = fid && "selectionStart" in active ? [active.selectionStart, active.selectionEnd] : null;
    const s = this.session();
    if (!s) { root.innerHTML = this.route.page === "landing" ? Views.landing() : Views.auth(this.route.page); }
    else {
      if (s.status === "suspenso") { Repo.data.session = null; Repo.save(); this.toast("Conta suspensa. Fale com o suporte.", true); return this.go("login"); }
      const area = s.role === "admin" ? "admin" : "cand";
      if (!this.route.page.startsWith(area + ".")) this.route = { page: area + (area === "admin" ? ".dashboard" : ".home"), params: {} };
      const view = Views[this.route.page];
      root.innerHTML = Views.shell(s, view ? view(s, this.route.params) : Views.notFound());
    }
    if (fid) { const el = document.getElementById(fid); if (el) { el.focus(); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (x) { } } }
  },
};

/* ---------------- componentes ---------------- */
const C = {
  pill(text, cls = "") { return `<span class="pill ${cls}">${e(text)}</span>`; },
  demoPill(job) { return job.isDemo ? C.pill("Dado demonstrativo", "demo") : C.pill("Anúncio real", "info"); },
  meter(v, max, cls = "", usage = false) { const p = max ? U.clamp(v / max * 100, 0, 100) : 0; return `<div class="meter ${usage ? (p >= 100 ? "bad" : p >= 85 ? "warn" : cls) : cls}" role="progressbar" aria-valuenow="${v}" aria-valuemax="${max}"><span style="width:${p}%"></span></div>`; },
  score(v) { return `<div class="score" style="--p:${v}" aria-label="Aderência ${v}%"><span>${v}</span></div>`; },
  empty(title, body, action = "") { return `<div class="empty"><b>${e(title)}</b><p>${body}</p>${action ? `<div style="margin-top:12px">${action}</div>` : ""}</div>`; },
  notice(text, cls = "info", icon = "i") { return `<div class="notice ${cls}"><span class="ic" aria-hidden="true">${icon}</span><div>${text}</div></div>`; },
  field(id, label, input, hint = "") { return `<div class="field"><label for="${id}">${e(label)}</label>${input}${hint ? `<span class="hint">${hint}</span>` : ""}</div>`; },
  input(id, value = "", attrs = "") { return `<input class="input" id="${id}" name="${id}" value="${e(value)}" ${attrs}>`; },
  select(id, opts, value, attrs = "") { return `<select class="select" id="${id}" name="${id}" ${attrs}>${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${e(v)}" ${String(v) === String(value ?? "") ? "selected" : ""}>${e(l)}</option>`; }).join("")}</select>`; },
  textarea(id, value = "", attrs = "") { return `<textarea class="textarea" id="${id}" name="${id}" ${attrs}>${e(value)}</textarea>`; },
  checks(name, opts, values) { return `<div class="chips">${opts.map(o => `<label class="check chip" style="padding:5px 9px"><input type="checkbox" name="${name}" value="${e(o)}" ${(values || []).includes(o) ? "checked" : ""}> ${e(o)}</label>`).join("")}</div>`; },
  tabs(current, items, act) { return `<div class="seg" role="tablist">${items.map(([k, l]) => `<button role="tab" aria-selected="${k === current}" class="${k === current ? "on" : ""}" data-act="${act}" data-v="${k}">${e(l)}</button>`).join("")}</div>`; },
  head(eyebrow, title, lead = "", right = "") { return `<div class="page-head"><div><div class="eyebrow">${e(eyebrow)}</div><h1 style="margin-top:6px">${e(title)}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}</div>${right ? `<div class="row">${right}</div>` : ""}</div>`; },
};

const Views = {};

/* ---------------- shell ---------------- */
Views.shell = (s, inner) => {
  const unread = Repo.find("notifications", n => n.userId === s.id && !n.read).length;
  const candNav = [["Etapa 1", [["cand.home", "▦", "Início"], ["cand.resume", "▤", "Currículo"], ["cand.profile", "◎", "Perfil e preferências"]]], ["Etapas 2 e 3", [["cand.jobs", "⌕", "Vagas para você"], ["cand.apps", "↗", "Candidaturas"]]], ["Conta", [["cand.notifications", "◔", "Notificações", unread], ["cand.plan", "◇", "Plano e consumo"], ["cand.privacy", "⚿", "Privacidade"]]]];
  const admNav = [["Visão", [["admin.dashboard", "▦", "Métricas"]]], ["Operação", [["admin.users", "◎", "Usuários"], ["admin.jobs", "⌕", "Vagas"], ["admin.sources", "⇄", "Fontes"], ["admin.editorial", "✎", "Editorial"]]], ["Gestão", [["admin.plans", "◇", "Planos e uso"], ["admin.privacy", "⚿", "Privacidade e auditoria"], ["admin.settings", "⚙", "Configurações"]]]];
  const nav = s.role === "admin" ? admNav : candNav;
  const page = App.route.page.split(":")[0];
  const label = page === "cand.job" ? "Detalhe da vaga" : (nav.flatMap(g => g[1]).find(i => page.startsWith(i[0]))?.[2] || "");
  const theme = Repo.setting("theme_" + s.id, "system");
  return `<div class="shell"><aside class="rail" aria-label="Menu principal">
    <div class="brand"><span class="brand-mark">MV</span><span>manda vaga<small>${s.role === "admin" ? "Painel administrativo" : "Seu currículo, mais oportunidades"}</small></span></div>
    <nav class="nav">${nav.map(([g, items]) => `<div class="nav-label">${e(g)}</div>${items.map(([k, ic, l, b]) => `<button class="${page === k || (page === "cand.job" && k === "cand.jobs") ? "active" : ""}" data-go="${k}"><span class="ico" aria-hidden="true">${ic}</span>${e(l)}${b ? `<span class="badge">${b}</span>` : ""}</button>`).join("")}`).join("")}</nav>
    <div class="rail-foot">
      <div class="rail-user"><span class="avatar">${e(U.initials(s.name))}</span><span class="who"><b>${e(s.name)}</b><span>${s.role === "admin" ? "Administrador" : Plans.of(s.id).name}${s.demoAccount ? " · demo" : ""}</span></span></div>
      <div class="row" style="gap:4px"><button class="rail-btn" data-act="theme">Tema: ${{ system: "sistema", light: "claro", dark: "escuro" }[theme]}</button><button class="rail-btn" data-act="logout">Sair</button></div>
    </div></aside>
    <div class="main"><header class="topbar"><button class="btn btn-ghost btn-sm menu-btn" data-act="openMenu" aria-label="Abrir menu">☰</button><span class="crumb">${e(label)}</span><span class="spacer"></span>${Repo.data.demo ? `<button class="pill demo" data-act="demoInfo" style="border:0">Modo demonstração</button>` : ""}</header>
    <main class="content" id="view">${inner}</main></div></div>`;
};
Views.notFound = () => C.empty("Página não encontrada", "Use o menu para continuar.");

/* ---------------- landing pública (PRD §6.1, StoryBrand) ---------------- */
Views.landing = () => {
  const plans = Plans.list();
  return `<div class="landing"><section class="l-hero"><div class="l-wrap">
    <nav class="l-nav"><div class="brand"><span class="brand-mark">MV</span><span>manda vaga</span></div><span class="grow"></span><button class="btn btn-ghost btn-sm" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.25)" data-go="login">Entrar</button><button class="btn btn-lime btn-sm" data-go="signup">Criar conta grátis</button></nav>
    <div class="l-hero-body"><div>
      <div class="pill lime">Currículo primeiro. Vagas depois.</div>
      <h1 style="margin-top:16px">Você tem a experiência. <em>O seu currículo precisa mostrar isso.</em></h1>
      <p class="lead">O Manda Vaga organiza o seu currículo com o que você já fez de verdade, encontra vagas compatíveis e entrega cada oportunidade com o link original e o motivo da recomendação. Você decide onde se candidatar.</p>
      <div class="row" style="margin-top:24px"><button class="btn btn-lime" data-go="signup">Começar pelo meu currículo →</button><button class="btn" style="color:#fff;border-color:rgba(255,255,255,.3)" data-act="demoLogin" data-v="candidate">Ver a demonstração</button></div>
    </div>
    <div class="l-panel" aria-label="Exemplo de recomendação">
      <div class="row-between"><b>Exemplo de vaga recomendada</b>${C.pill("Dado demonstrativo", "demo")}</div>
      <div class="row" style="gap:14px;align-items:center">${C.score(82)}<div><div style="color:#fff;font-weight:700">Estágio em Direito Trabalhista</div><div class="small">São Paulo · Híbrido · verificada hoje</div></div></div>
      <div class="small">Combina: controle de prazos, Excel, relatórios, atendimento.</div>
      <div class="small" style="color:var(--lime)">Lacuna: pesquisa de jurisprudência (não declaramos o que você não tem).</div>
    </div></div></div></section>
    <section class="l-sec"><div class="l-wrap"><div class="eyebrow">Como funciona</div><h2 style="font-size:clamp(24px,3vw,34px);margin-top:8px">Três etapas, nesta ordem</h2>
      <div class="l-steps">
        <div class="l-step"><span class="n">ETAPA 1</span><h3>Currículo inteligente e flexível</h3><p class="muted">Você preenche ou cola o currículo. Mostramos o diagnóstico, as palavras-chave que sua experiência sustenta e cada sugestão com antes e depois.</p></div>
        <div class="l-step"><span class="n">ETAPA 2</span><h3>Curadoria de vagas compatíveis</h3><p class="muted">Cruzamos competências, cargo, localização, modalidade e nível. A pontuação é explicada, com o que combina e o que falta.</p></div>
        <div class="l-step"><span class="n">ETAPA 3</span><h3>Entrega na sua área</h3><p class="muted">Cada vaga vem com link do anúncio original e data da verificação. Você salva, dispensa, gera uma versão do currículo e acompanha a candidatura.</p></div>
      </div></div></section>
    <section class="l-sec" style="padding-top:0"><div class="l-wrap"><div class="eyebrow">Planos</div><h2 style="font-size:clamp(24px,3vw,34px);margin:8px 0 18px">Pague pelo volume de oportunidades</h2>
      <div class="plans">${plans.map((p, i) => `<div class="plan ${i === 1 ? "featured" : ""}"><b>${e(p.name)}</b><div class="price num">${U.money(p.price)}<small>/mês</small></div><p class="muted small">Até ${p.limit} oportunidades únicas por mês. Vagas repetidas não contam duas vezes.</p><button class="btn ${i === 1 ? "btn-primary" : "btn-ghost"}" data-go="signup">Escolher ${e(p.name)}</button></div>`).join("")}</div>
      <p class="small muted" style="margin-top:12px">Na fase de testes não há cobrança: a troca de plano é simulada.</p></div></section>
    <footer class="l-foot"><div class="l-wrap stack-sm"><b>O Manda Vaga não é agência de emprego.</b><span>Não representamos empresas contratantes e não garantimos entrevista ou contratação. A aderência é uma estimativa explicável, não uma previsão. Marcas de plataformas de recrutamento citadas pertencem aos seus donos e não indicam parceria.</span><span>Protótipo local · ${new Date().getFullYear()}</span></div></footer></div>`;
};

/* ---------------- autenticação (simulada, local) ---------------- */
Views.auth = page => {
  const side = `<aside class="auth-side"><div class="brand"><span class="brand-mark">MV</span><span>manda vaga</span></div><div class="stack"><h2>Primeiro o <em>currículo</em>. Depois as vagas. A decisão é sua.</h2><p>Nenhuma candidatura é enviada sem você. Nenhuma competência é declarada sem evidência.</p></div><p class="xs">Protótipo local: contas e dados ficam neste navegador.</p></aside>`;
  let box = "";
  if (page === "signup") box = `<div><div class="eyebrow">Criar conta</div><h1 style="margin-top:6px">Comece pelo seu currículo</h1></div>
    <form class="stack" data-form="signup" novalidate>
      ${C.field("su-name", "Nome completo", C.input("su-name", "", 'autocomplete="name" required'))}
      ${C.field("su-email", "E-mail", C.input("su-email", "", 'type="email" autocomplete="email" required'))}
      ${C.field("su-pass", "Senha", C.input("su-pass", "", 'type="password" autocomplete="new-password" minlength="8" required'), "Mínimo de 8 caracteres.")}
      <div class="form-grid">${C.field("su-city", "Cidade", C.input("su-city", "", 'autocomplete="address-level2"'))}${C.field("su-uf", "UF", C.select("su-uf", ["", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"], ""))}</div>
      ${C.field("su-origin", "Como conheceu o Manda Vaga? (opcional)", C.select("su-origin", ["", "Instagram", "Indicação", "Google", "LinkedIn", "WhatsApp", "Outro"], ""))}
      <label class="check"><input type="checkbox" id="su-terms" name="su-terms"> <span>Li e aceito os termos de uso e a política de privacidade. <b>Obrigatório.</b></span></label>
      <label class="check"><input type="checkbox" id="su-mkt" name="su-mkt"> <span>Quero receber novidades por e-mail. Opcional.</span></label>
      <label class="check"><input type="checkbox" id="su-wa" name="su-wa"> <span>Quero receber alertas de vagas por WhatsApp. Opcional.</span></label>
      <button class="btn btn-primary" type="submit">Criar conta</button>
      <p class="small muted">Já tem conta? <button type="button" class="btn-link" data-go="login">Entrar</button></p></form>`;
  else if (page === "forgot") box = `<div><div class="eyebrow">Recuperar senha</div><h1 style="margin-top:6px">Redefinir senha</h1></div>
    ${C.notice("O envio de e-mail ainda não está conectado. Nesta fase o código aparece aqui na tela, apenas para teste.", "warn", "!")}
    <form class="stack" data-form="forgot" novalidate>${C.field("fg-email", "E-mail da conta", C.input("fg-email", App.ui.forgotEmail || "", 'type="email" required'))}
    ${App.ui.forgotCode ? `<div class="sunken small">Código de teste: <b class="mono">${e(App.ui.forgotCode)}</b></div>${C.field("fg-code", "Código", C.input("fg-code", "", 'inputmode="numeric"'))}${C.field("fg-pass", "Nova senha", C.input("fg-pass", "", 'type="password" minlength="8"'))}<button class="btn btn-primary" type="submit">Salvar nova senha</button>` : `<button class="btn btn-primary" type="submit">Gerar código</button>`}
    <p class="small"><button type="button" class="btn-link" data-go="login">Voltar para o login</button></p></form>`;
  else box = `<div><div class="eyebrow">Entrar</div><h1 style="margin-top:6px">Bem-vindo de volta</h1></div>
    <form class="stack" data-form="login" novalidate>
      ${C.field("li-email", "E-mail", C.input("li-email", "", 'type="email" autocomplete="email" required'))}
      ${C.field("li-pass", "Senha", C.input("li-pass", "", 'type="password" autocomplete="current-password" required'))}
      <button class="btn btn-primary" type="submit">Entrar</button>
      <div class="row-between small"><button type="button" class="btn-link" data-go="forgot">Esqueci a senha</button><button type="button" class="btn-link" data-go="signup">Criar conta</button></div></form>
    <div class="card stack-sm"><b>Contas de demonstração</b><p class="small muted">Senha de todas: <span class="mono">${DEMO_PASSWORD}</span></p>
      <div class="row"><button class="btn btn-soft btn-sm" data-act="demoLogin" data-v="candidate">Candidata com currículo</button><button class="btn btn-soft btn-sm" data-act="demoLogin" data-v="new">Candidato novo (sem currículo)</button><button class="btn btn-soft btn-sm" data-act="demoLogin" data-v="admin">Administrador</button></div></div>
    <p class="small"><button type="button" class="btn-link" data-go="landing">← Página inicial</button></p>`;
  return `<div class="auth">${side}<div class="auth-main"><div class="auth-box">${box}</div></div></div>`;
};
