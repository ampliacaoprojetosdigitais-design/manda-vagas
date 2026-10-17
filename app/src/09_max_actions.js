/* Ações do plano Max e do pagamento */
Object.assign(Actions, {
  copyCover() { const t = document.getElementById("ap-cover"); if (!t) return; navigator.clipboard?.writeText(t.value).then(() => App.toast("Mensagem copiada.")).catch(() => { t.select(); App.toast("Selecionada. Use Ctrl+C."); }); },
  sendEmail() { App.toast(Integrations.call("email").reason + " Copie a mensagem e envie pelo seu e-mail.", true); },
  markTried(el) { const a = Repo.get("applications", el.dataset.id); if (!a) return; const hist = a.history || []; hist.push({ status: "Envio tentado — sem confirmação", at: U.now(), note: "Envio facilitado: candidato informou que enviou pelo site" }); Repo.update("applications", a.id, { status: "Envio tentado — sem confirmação", next: "Registrar o protocolo ou a confirmação recebida", history: hist }); App.closeModal(); App.toast("Registrado como envio tentado. Quando chegar a confirmação, registre o protocolo."); App.render(); },
  addResponse(el) {
    const s = me(); const a = Repo.get("applications", el.dataset.id); if (!a || a.userId !== s.id) return;
    App.modal({ title: "Registrar resposta da empresa", body: `<p class="small muted">${e(Assistant.jobTitle(a))}</p><div class="form-grid">${C.field("rp-type", "Tipo", C.select("rp-type", RESP_TYPES, "convite", 'data-change="rpType"'))}${C.field("rp-channel", "Canal", C.select("rp-channel", ["E-mail", "WhatsApp", "Telefone", "Portal da vaga", "LinkedIn"], "E-mail"))}${C.field("rp-date", "Data da resposta", C.input("rp-date", U.today(), 'type="date"'))}<div class="full">${C.field("rp-summary", "Resumo do que disseram", C.textarea("rp-summary", "", 'rows="3"'))}</div></div><div id="rp-int" class="form-grid sunken">${C.field("rp-int-date", "Data da entrevista", C.input("rp-int-date", "", 'type="date"'))}${C.field("rp-int-time", "Horário", C.input("rp-int-time", "", 'type="time"'))}<div class="full">${C.field("rp-int-place", "Local ou link", C.input("rp-int-place", ""))}</div></div>`, actions: [{ key: "cancel", label: "Cancelar" }, { key: "ok", label: "Salvar resposta", cls: "btn-primary" }], onAction: k => {
      if (k !== "ok") return true;
      const type = val("rp-type"), date = val("rp-date"), channel = val("rp-channel");
      if (!date) { App.toast("Informe a data da resposta.", true); return false; }
      const patch = { responses: [...(a.responses || []), { type, channel, date, summary: val("rp-summary"), at: U.now() }], history: [...(a.history || [])] };
      let status = "Resposta recebida", next = a.next;
      if (type === "convite") { const di = val("rp-int-date"); if (!di) { App.toast("Informe a data da entrevista.", true); return false; } status = "Entrevista agendada"; patch.interview = { date: di, time: val("rp-int-time"), place: val("rp-int-place") }; next = "Preparar a entrevista"; }
      if (type === "docs") next = "Enviar os documentos ou fazer o teste pedido";
      if (type === "recusa") { status = "Processo encerrado"; next = ""; }
      if (!a.confirmed) { patch.confirmed = true; patch.confirmedAt = U.now(); patch.evidence = a.evidence || `Resposta da empresa recebida em ${U.fmtDate(date)} (${channel})`; }
      patch.status = status; patch.next = next; patch.history.push({ status, at: U.now(), note: `Resposta registrada: ${Object.fromEntries(RESP_TYPES)[type]} (${channel})` });
      Repo.update("applications", a.id, patch); notify(s.id, "Resposta registrada", `${Assistant.jobTitle(a)}: ${status}`, "ok", "cand.responses");
      const draft = MaxFeat.replyDraft(s, a, type);
      setTimeout(() => App.modal({ title: "Sugestão de resposta", body: `<p class="small muted">Revise e envie pelo mesmo canal. Nada é enviado automaticamente.</p><textarea id="rp-draft" class="textarea" rows="9">${e(draft)}</textarea>`, actions: [{ key: "copy", label: "Copiar" }, { key: "close", label: "Concluir", cls: "btn-primary" }], onAction: kk => { if (kk === "copy") { const t = document.getElementById("rp-draft"); navigator.clipboard?.writeText(t.value).then(() => App.toast("Copiado.")).catch(() => { t.select(); }); return false; } return true; } }), 30);
      App.render(); return true;
    } });
  },
});
Changes.rpType = el => document.getElementById("rp-int").classList.toggle("hidden", el.value !== "convite");

/* ---------- pagamento real (Asaas) quando o servidor estiver configurado ---------- */
const Payments = {
  _cfg: null,
  async config() {
    if (this._cfg) return this._cfg;
    if (!/^https?:$/.test(location.protocol) || /claude\.ai|claudeusercontent/.test(location.hostname)) return (this._cfg = { payments: false });
    try { const r = await fetch("/api/config", { cache: "no-store" }); this._cfg = r.ok ? await r.json() : { payments: false }; } catch (e) { this._cfg = { payments: false }; }
    return this._cfg;
  },
  ref(s) { if (!s.paymentRef) { const b = new Uint8Array(16); crypto.getRandomValues(b); Repo.update("users", s.id, { paymentRef: [...b].map(x => x.toString(16).padStart(2, "0")).join("") }); } return Repo.get("users", s.id).paymentRef; },
  pending(s) { return Repo.one("subscriptions", x => x.userId === s.id && x.status === "aguardando pagamento"); },
  activate(s, pend) { Repo.find("subscriptions", x => x.userId === s.id && x.status === "ativa").forEach(x => { x.status = "encerrada"; x.endedAt = U.now(); }); pend.status = "ativa"; pend.startedAt = U.now(); Repo.save(); audit("Assinatura ativada (Asaas)", s.id, pend.plan); notify(s.id, "Pagamento confirmado", `Plano ${Plans.list().find(p => p.key === pend.plan)?.name} ativo.`, "ok", "cand.plan"); },
};
const _simulatedChangePlan = Actions.changePlan;
Object.assign(Actions, {
  async changePlan(el) {
    const s = me(); const p = Plans.list().find(x => x.key === el.dataset.v); const cy = el.dataset.cycle || "mensal"; const cc = Plans.cycle(cy);
    const cfg = await Payments.config();
    if (!cfg.payments || !p.price) return _simulatedChangePlan(el);
    App.modal({ title: `Assinar o plano ${p.name} ${cc.label.toLowerCase()}`, body: `<p>${cc.months === 1 ? U.money(p.price) + " por mês" : `${U.money(Plans.total(p, cy))} a cada ${cc.months} meses (${U.money(Plans.perMonth(p, cy))}/mês, ${Math.round(cc.discount * 100)}% de desconto)`}. Você paga na página segura da Asaas, com Pix, boleto ou cartão.</p>${C.field("pg-doc", "CPF ou CNPJ (exigido para emitir a cobrança)", C.input("pg-doc", "", 'inputmode="numeric" autocomplete="off"'))}${C.field("pg-phone", "Celular (opcional)", C.input("pg-phone", "", 'inputmode="tel"'))}<p class="xs muted">O plano é ativado assim que a Asaas confirmar o pagamento.</p>`, actions: [{ key: "cancel", label: "Cancelar" }, { key: "ok", label: "Gerar cobrança", cls: "btn-primary" }], onAction: k => {
      if (k !== "ok") return true;
      const doc = val("pg-doc").replace(/\D/g, ""); if (![11, 14].includes(doc.length)) { App.toast("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).", true); return false; }
      const ref = Payments.ref(s);
      fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: p.key, cycle: cy, name: s.name, email: s.email, cpfCnpj: doc, phone: val("pg-phone"), ref }) })
        .then(r => r.json().then(b => ({ ok: r.ok, b })))
        .then(({ ok, b }) => {
          if (!ok) return App.toast(b.error || "Não foi possível gerar a cobrança.", true);
          Repo.remove("subscriptions", x => x.userId === s.id && x.status === "aguardando pagamento");
          Repo.insert("subscriptions", { userId: s.id, plan: p.key, cycle: cy, status: "aguardando pagamento", ref, asaasSubscriptionId: b.subscriptionId, invoiceUrl: b.invoiceUrl || "" });
          audit("Cobrança criada (Asaas)", s.id, p.name); App.render(); Actions.payInfo();
        }).catch(() => App.toast("Sem conexão com o servidor de pagamentos.", true));
      return true;
    } });
  },
  payInfo() { const s = me(); const pend = Payments.pending(s); if (!pend) return; const plan = Plans.list().find(p => p.key === pend.plan); App.modal({ title: `Pagamento do plano ${plan?.name}`, body: `<p>Cobrança criada. Abra a página da Asaas para pagar com Pix, boleto ou cartão.</p>${pend.invoiceUrl ? `<a class="btn btn-primary" href="${e(pend.invoiceUrl)}" target="_blank" rel="noopener noreferrer">Abrir página de pagamento ↗</a>` : `<p class="small muted">O link ainda está sendo gerado. Clique em “Verificar pagamento” em alguns segundos.</p>`}<p class="small muted">Depois de pagar, volte aqui e clique em “Verificar pagamento”. Pix costuma confirmar em minutos; boleto pode levar até 3 dias úteis.</p>`, actions: [{ key: "close", label: "Fechar" }, { key: "check", label: "Verificar pagamento", cls: "btn-primary" }], onAction: k => { if (k === "check") { Actions.checkPayment(); } return true; } }); },
  async checkPayment() {
    const s = me(); const pend = Payments.pending(s); if (!pend) return;
    try {
      const r = await fetch("/api/subscription?ref=" + encodeURIComponent(pend.ref), { cache: "no-store" }); const b = await r.json();
      if (!r.ok) return App.toast(b.error || "Não foi possível verificar.", true);
      if (b.invoiceUrl && !pend.invoiceUrl) { pend.invoiceUrl = b.invoiceUrl; Repo.save(); }
      if (b.status === "ACTIVE") { Payments.activate(s, pend); App.toast("Pagamento confirmado. Plano ativo!"); }
      else if (b.status === "CANCELED") { pend.status = "cancelada"; Repo.save(); App.toast("A cobrança foi cancelada.", true); }
      else App.toast(b.status === "OVERDUE" ? "Cobrança vencida. Abra a página de pagamento para gerar uma nova." : "Ainda aguardando a confirmação da Asaas.");
      App.render();
    } catch (e) { App.toast("Sem conexão com o servidor de pagamentos.", true); }
  },
});
