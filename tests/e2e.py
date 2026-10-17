"""Testes ponta a ponta do Manda Vaga SaaS (critérios de aceite PRD §11 e §22)."""
import json, sys
from playwright.sync_api import sync_playwright
import pathlib
PATH = (pathlib.Path(__file__).resolve().parent.parent / "app" / "dist" / "index.html").as_uri()
R = []
def check(cid, desc, ok, obs=""):
    R.append({"id": cid, "desc": desc, "ok": bool(ok), "obs": str(obs)[:160]})

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1366, "height": 900})
    ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort())
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(PATH); pg.wait_for_timeout(400)
    ev = lambda js: pg.evaluate(js)
    modal = lambda k: pg.click(f".modal [data-modal='{k}']")
    def nav(page): pg.click(f".nav [data-go='{page}']"); pg.wait_for_timeout(120)
    def login(kind):
        if ev("!!App.session()"): pg.click("[data-act=logout]")
        pg.click("text=Entrar >> nth=0"); pg.click(f"[data-act=demoLogin][data-v={kind}]"); pg.wait_for_timeout(250)

    # ---------- cadastro ----------
    pg.click("text=Criar conta grátis")
    pg.fill("#su-name", "Teste Silva"); pg.fill("#su-email", "teste@exemplo.com"); pg.fill("#su-pass", "senha1234")
    pg.click("form[data-form=signup] button[type=submit]"); pg.wait_for_timeout(200)
    check("AUTH-1", "Cadastro sem aceitar termos é bloqueado", not ev("!!App.session()"))
    pg.check("#su-terms"); pg.click("form[data-form=signup] button[type=submit]"); pg.wait_for_timeout(400)
    check("AUTH-2", "Cadastro com termos cria conta, plano Inicial e entra", ev("App.session()?.email") == "teste@exemplo.com" and ev("Plans.of(App.session().id).key") == "inicial")
    nav("cand.jobs")
    check("FLOW-1", "Vagas bloqueadas antes do currículo (currículo primeiro)", "O currículo vem primeiro" in pg.inner_text("#view"))
    nav("cand.resume"); pg.click("[data-act=resumeTab][data-v=import]")
    txt = """RESUMO PROFISSIONAL
Profissional com mais de 15 anos de experiência em atendimento e rotinas administrativas, buscando estágio jurídico.

EXPERIÊNCIA PROFISSIONAL
Loja Central — Atendente | 2020–Atual
• Responsável por atender clientes e organizar cadastros
• Controle de prazos de entregas em planilhas Excel

FORMAÇÃO
Direito — Faculdade Exemplo, cursando

COMPETÊNCIAS
Atendimento ao público; Excel; Cadastros

IDIOMAS
Inglês — Básico"""
    pg.fill("#imp-text", txt); pg.click("[data-act=parseImport]"); pg.wait_for_timeout(150)
    check("RES-1", "Importação mostra prévia para conferência antes de aplicar", pg.is_visible(".modal") and "Loja Central" in pg.inner_text(".modal"))
    modal("ok"); pg.wait_for_timeout(200)
    d = ev("Cand.resume(App.session()).data")
    check("RES-2", "Texto importado vira currículo estruturado", len(d["experiences"]) == 1 and d["experiences"][0]["org"] == "Loja Central" and "Excel" in d["skills"], d["experiences"][0])
    check("RES-3", "Versão criada no histórico", ev("Repo.find('resume_versions',v=>v.userId===App.session().id).length") == 1)
    # editor: adicionar experiência e salvar
    pg.click("[data-act=addExp]"); pg.fill("#ex-org-1", "Mercado Bom"); pg.fill("#ex-role-1", "Repositor"); pg.fill("#ex-start-1", "2018"); pg.fill("#ex-end-1", "2019"); pg.fill("#ex-act-1", "Reposição de mercadorias\nControle de estoque")
    pg.click("form[data-form=resume] button[type=submit]"); pg.wait_for_timeout(200)
    check("RES-4", "Editar manualmente e salvar cria nova versão", ev("Cand.resume(App.session()).data.experiences.length") == 2 and ev("Repo.find('resume_versions',v=>v.userId===App.session().id).length") == 2)
    pg.click("[data-act=resumeTab][data-v=diag]")
    diag = pg.inner_text("#view")
    check("RES-5", "Diagnóstico detecta “mais de 15 anos” sem datas que sustentem", "mais de 15 anos" in diag)
    n_before = ev("Repo.find('resume_versions',v=>v.userId===App.session().id).length")
    pg.click("[data-act=markReviewed]"); pg.wait_for_timeout(100)
    check("RES-6", "Não deixa marcar revisado com afirmação sem evidência", ev("Cand.resume(App.session()).status") != "revisado")
    pg.click("[data-act=acceptSugg] >> nth=0"); pg.wait_for_timeout(150)
    summ = ev("Cand.resume(App.session()).data.summary")
    check("RES-7", "Aceitar sugestão aplica antes/depois e registra versão", "desde 2018" in summ and ev("Repo.find('resume_versions',v=>v.userId===App.session().id).length") == n_before + 1, summ[:90])
    pg.click("[data-act=markReviewed]"); pg.wait_for_timeout(100)
    check("RES-8", "Marca revisado depois da correção", ev("Cand.resume(App.session()).status") == "revisado")
    # palavras-chave
    pg.click("[data-act=resumeTab][data-v=keywords]"); pg.click("[data-act=kwFilter][data-v=todas]")
    state = lambda t: ev(f"Cand.ev(App.session())['{t}'].state")
    check("KW-1", "Termo presente em experiência = sustentado", state("Controle de prazos") == "sustentado")
    check("KW-2", "Termo sem evidência = ausente (não vira competência)", state("Pesquisa de jurisprudência") == "ausente")
    pg.click("[data-act=claimTerm][data-term='Pesquisa de jurisprudência']"); pg.check("#kc-true"); modal("ok"); pg.wait_for_timeout(120)
    check("KW-3", "Declarar sem descrever onde usou = precisa de confirmação", state("Pesquisa de jurisprudência") == "confirmar")
    pg.click("[data-act=claimTerm][data-term='Pesquisa de jurisprudência']"); pg.fill("#kc-ev", "Pesquisei jurisprudência no TCC do técnico"); pg.check("#kc-true"); pg.check("#kc-add"); modal("ok"); pg.wait_for_timeout(120)
    check("KW-4", "Com evidência e confirmação = sustentado e entra no currículo", state("Pesquisa de jurisprudência") == "sustentado" and "Pesquisa de jurisprudência" in ev("Cand.resume(App.session()).data.skills"))
    # exportação
    pg.click("[data-act=resumeTab][data-v=versions]"); pg.click("[data-act=exportResume][data-v=txt]")
    exp = pg.input_value("#export-text"); d = ev("Cand.resume(App.session()).data")
    order = [exp.find(h) for h in ["RESUMO PROFISSIONAL", "EXPERIÊNCIA PROFISSIONAL", "FORMAÇÃO", "COMPETÊNCIAS", "IDIOMAS"]]
    check("RES-9", "Exportação mantém conteúdo e ordem das seções", all(x >= 0 for x in order) and order == sorted(order) and "Loja Central" in exp)
    pg.click(".modal [data-modal=close]")
    pg.click("[data-act=diffVersion] >> nth=-1"); check("RES-10", "Comparar versão mostra diferenças", pg.locator(".diff .add, .diff .del").count() > 0); pg.click(".modal [data-modal=close]")

    # ---------- curadoria ----------
    login("candidate")
    sid = ev("App.session().id")
    s1 = ev("Cand.curated(App.session()).map(x=>x.m.score).join()"); s2 = ev("Cand.curated(App.session()).map(x=>x.m.score).join()")
    check("CUR-1", "Pontuação determinística para entradas iguais", s1 == s2)
    recs = ev("Cand.recommendations(App.session()).map(x=>({id:x.job.id,st:x.st.key,dup:!!x.job.duplicateOf,demo:x.job.isDemo,score:x.m.score}))")
    check("CUR-2", "Recomendadas excluem expiradas, não verificadas e duplicatas", all(r["st"] in ("ok", "stale") and not r["dup"] for r in recs), len(recs))
    check("CUR-3", "Duplicata do catálogo foi detectada", ev("Repo.all('jobs').filter(j=>j.duplicateOf).length") >= 1)
    m = ev("(()=>{const x=Cand.curated(App.session()).find(x=>x.job.id==='job_d02');return x.m})()")
    check("CUR-4", "Explicação mostra combinações, lacunas e bloqueio por semestre", "4º semestre" in " ".join(m["notes"]) and m["dims"]["level"] == 0, m["notes"])
    used1 = ev(f"Plans.used('{sid}')"); nav("cand.jobs"); nav("cand.home"); nav("cand.jobs"); used2 = ev(f"Plans.used('{sid}')")
    check("PLAN-1", "Rever as mesmas vagas não consome o plano de novo (idempotente)", used1 == used2, f"{used1}->{used2}")
    first = ev("Cand.recommendations(App.session())[0].job.id")
    pg.click(f"[data-act=dismissJob][data-id={first}]"); modal("ok"); pg.wait_for_timeout(120)
    check("CUR-5", "Dispensar remove das recomendadas e aparece em Dispensadas", first not in ev("Cand.recommendations(App.session()).map(x=>x.job.id)") and ev(f"Cand.feedback(App.session())['{first}'].state") == "dispensada")
    pg.click("[data-act=jobsTab][data-v=dismissed]"); pg.click(f"[data-act=undismissJob][data-id={first}]")
    sec = ev("Cand.recommendations(App.session())[1].job.id"); pg.click("[data-act=jobsTab][data-v=rec]"); pg.click(f"[data-act=saveJob][data-id={sec}]")
    check("CUR-6", "Salvar vaga", ev(f"Cand.feedback(App.session())['{sec}'].state") == "salva")
    pg.click(".filters summary"); pg.select_option("#jf-sal", "2500"); pg.wait_for_timeout(150)
    sal_ok = ev("(()=>{const f=App.ui.jobFilter;return Cand.recommendations(App.session()).filter(x=>(x.job.salaryMax||x.job.salaryMin||0)>=2500).length})()")
    shown = pg.locator("#view article.job").count()
    check("FILT-1", "Filtro por salário funciona", shown == sal_ok, f"{shown} vs {sal_ok}")
    pg.select_option("#jf-sal", ""); pg.select_option("#jf-stage", "Em formação (estágio)"); pg.wait_for_timeout(150)
    titles = pg.locator("#view .job-meta >> nth=0").all_inner_texts()
    check("FILT-2", "Filtro por momento de carreira mostra só estágios", all("Estágio" in t for t in pg.locator("#view article .job-meta:first-of-type").all_inner_texts()))
    pg.click("[data-act=clearJobFilter]")

    # ---------- currículo por vaga + candidatura ----------
    pg.click(f"[data-go='cand.job'][data-id='{sec}']"); pg.wait_for_timeout(120)
    before = sorted(ev("Cand.resume(App.session()).data.skills"))
    pg.click("[data-act=tailorResume]"); pg.wait_for_timeout(120)
    v = ev(f"Repo.find('resume_versions',v=>v.jobId==='{sec}'&&v.userId==='{sid}').at(-1)")
    check("TAIL-1", "Currículo para a vaga não cria competência nem experiência", sorted(v["data"]["skills"]) == before and len(v["data"]["experiences"]) == len(ev("Cand.resume(App.session()).data.experiences")))
    check("TAIL-2", "Alterações do currículo direcionado são explicadas", len(v["changes"]) >= 1)
    modal("close")
    pg.click("[data-act=newApp]"); pg.wait_for_timeout(150)
    aid = ev(f"Repo.one('applications',a=>a.jobId==='{sec}'&&a.userId==='{sid}').id")
    check("APP-1", "Registrar candidatura não marca como enviada", ev(f"Repo.get('applications','{aid}').confirmed") is False and ev(f"Repo.get('applications','{aid}').status") == "Pronta para revisão")
    pg.select_option("#ap-status", "Candidatura enviada — confirmada"); modal("save"); pg.wait_for_timeout(120)
    check("APP-2", "Marcar enviada sem confirmação e evidência é bloqueado", ev(f"Repo.get('applications','{aid}').confirmed") is False and pg.is_visible(".modal"))
    pg.fill("#ap-evidence", "Protocolo 98765"); pg.check("#ap-proof-ok"); modal("save"); pg.wait_for_timeout(150)
    check("APP-3", "Com confirmação + evidência vira enviada confirmada", ev(f"Repo.get('applications','{aid}').confirmed") is True)
    pg.click(f"[data-act=openApp][data-id='{aid}']"); pg.select_option("#ap-status", "Aguardando resposta"); modal("save"); pg.wait_for_timeout(120)
    nav("cand.home")
    check("APP-4", "Avançar o status mantém a contagem de enviadas", "1" in pg.inner_text(".grid.g4 .card:nth-child(3) .v"))
    nav("cand.apps"); pg.click(f"[data-act=openApp][data-id='{aid}']"); pg.select_option("#ap-status", "Entrevista agendada"); modal("save"); pg.wait_for_timeout(100)
    check("APP-5", "Entrevista exige data", pg.is_visible(".modal") and ev(f"Repo.get('applications','{aid}').status") == "Aguardando resposta")
    pg.fill("#ap-int-date", "2026-10-24"); pg.fill("#ap-int-time", "10:00"); pg.fill("#ap-int-place", "Online"); modal("save"); pg.wait_for_timeout(120)
    check("APP-6", "Entrevista registrada com data, hora e local; histórico guardado", ev(f"Repo.get('applications','{aid}').interview.date") == "2026-10-24" and len(ev(f"Repo.get('applications','{aid}').history")) >= 4)

    # ---------- plano e limite ----------
    nav("cand.plan"); pg.click("[data-act=changePlan][data-v=plus]"); modal("ok"); pg.wait_for_timeout(120)
    check("PLAN-2", "Troca de plano simulada", ev("Plans.of(App.session().id).key") == "plus")
    # ---------- permissões ----------
    ev("App.go('admin.users')")
    check("PERM-1", "Candidato não acessa área administrativa", ev("App.route.page") == "cand.home" and "Usuários" not in pg.inner_text(".nav"))
    other = ev("Repo.find('applications',a=>a.userId!==App.session().id).length")
    check("PERM-2", "Candidato só vê as próprias candidaturas", ev("Cand.apps(App.session()).every(a=>a.userId===App.session().id)") and other >= 0)
    # ---------- privacidade ----------
    nav("cand.privacy"); pg.click("[data-act=exportMyData]")
    data = json.loads(pg.input_value("#export-text"))
    check("PRIV-1", "Exportação de dados do titular sem hash de senha", "passwordHash" not in data["usuario"] and len(data["candidaturas"]) >= 1)
    modal("close")

    # ---------- admin ----------
    login("admin")
    nav("admin.users"); pg.click("[data-act=viewUser] >> nth=0"); pg.wait_for_timeout(100)
    check("ADM-1", "Abrir usuário gera auditoria e não mostra currículo", ev("Repo.all('audit_events').some(a=>a.action==='Usuário consultado')") and "RESUMO" not in pg.inner_text(".modal"))
    modal("close")
    nav("admin.jobs"); pg.click("[data-act=importPilot]"); pg.wait_for_timeout(150)
    real = ev("Repo.all('jobs').filter(j=>!j.isDemo).length")
    pg.click("[data-act=importPilot]"); pg.wait_for_timeout(150)
    check("ADM-2", "Importa lote-piloto real e não duplica na segunda vez", real == 5 and ev("Repo.all('jobs').filter(j=>!j.isDemo).length") == 5)
    check("ADM-3", "Vagas reais têm link individual e data de verificação", ev("Repo.all('jobs').filter(j=>!j.isDemo).every(j=>j.url&&j.lastCheckedAt)"))
    pg.click("text=+ Vaga"); pg.fill("#jb-title", "Teste"); pg.fill("#jb-company", "Empresa X"); pg.fill("#jb-url", "https://www.vagas.com.br/vagas/"); modal("ok"); pg.wait_for_timeout(100)
    check("ADM-4", "Link de página de busca não é aceito como anúncio individual", pg.is_visible(".modal"))
    pg.fill("#jb-url", "https://www.vagas.com.br/vagas/v2836402/estagio-juridico-trabalhista?utm_source=x"); modal("ok"); pg.wait_for_timeout(100)
    check("ADM-5", "Mesmo anúncio com parâmetros diferentes é recusado como duplicata", pg.is_visible(".modal"))
    pg.fill("#jb-url", "https://exemplo.com.br/carreiras/vaga/123"); pg.fill("#jb-salmin", "2000"); modal("ok"); pg.wait_for_timeout(120)
    check("ADM-6", "Vaga nova válida é cadastrada", ev("Repo.all('jobs').some(j=>j.url==='https://exemplo.com.br/carreiras/vaga/123'&&j.salaryMin===2000)"))
    # expirar vaga com candidatura de candidato
    ev("App.ui.admJobQ='Auxiliar de Controladoria Jurídica'"); pg.evaluate("App.render()")
    pg.click("[data-act=expireJob][data-id=job_d03]"); pg.wait_for_timeout(120)
    check("ADM-7", "Expirar vaga marca candidatura não enviada como expirada e notifica", ev("Repo.get('applications','app_cam1').status") == "Vaga expirada/indisponível" and ev("Repo.find('notifications',n=>n.userId==='usr_camila'&&n.title==='Vaga encerrada').length") == 1)
    # editorial
    nav("admin.editorial"); pg.check("input[name=ed-job] >> nth=0"); pg.click("[data-act=newDraft]"); pg.wait_for_timeout(150)
    did = ev("Repo.all('content_drafts').at(-1).id")
    modal("review"); pg.wait_for_timeout(100); pg.click(f"[data-act=openDraft][data-id='{did}']"); modal("reject"); pg.wait_for_timeout(100)
    check("ED-1", "Rejeitar exige nota de revisão", pg.is_visible(".modal") and ev(f"Repo.get('content_drafts','{did}').status") == "Em revisão")
    modal("approve"); pg.wait_for_timeout(100); pg.click(f"[data-act=openDraft][data-id='{did}']"); modal("publish"); pg.wait_for_timeout(100)
    dr = ev(f"Repo.get('content_drafts','{did}')")
    check("ED-2", "Fluxo editorial: revisão humana → aprovado → publicado manualmente, com fonte e data", dr["status"] == "Publicado manualmente" and dr["reviewer"] and all(s["checked"] for s in dr["sources"]))
    # pesos
    sc_before = ev("Match.score(Repo.one('profiles',p=>p.userId==='usr_camila'),Keywords.evidence('usr_camila',Repo.one('resumes',r=>r.userId==='usr_camila').data),Repo.get('jobs','job_d01')).score")
    nav("admin.settings"); pg.fill("#w-location", "60"); pg.click("form[data-form=weights] button[type=submit]"); pg.wait_for_timeout(100)
    sc_after = ev("Match.score(Repo.one('profiles',p=>p.userId==='usr_camila'),Keywords.evidence('usr_camila',Repo.one('resumes',r=>r.userId==='usr_camila').data),Repo.get('jobs','job_d01')).score")
    check("ADM-8", "Pesos configuráveis alteram a pontuação", sc_before != sc_after, f"{sc_before}->{sc_after}")
    nav("admin.sources"); pg.click("[data-act=syncSource][data-id=src_adzuna]"); pg.wait_for_timeout(80)
    check("INT-1", "Integração não conectada aparece como indisponível, nunca como sucesso", "não conectada" in pg.inner_text("#toasts"))
    nav("admin.plans")
    pg.fill("input[name=pl-limit-1]", "3"); pg.click("form[data-form=plans] button[type=submit]"); pg.wait_for_timeout(100)
    # candidata no Plus com limite 3
    login("candidate"); ev("Repo.find('subscriptions',s=>s.userId==='usr_camila'&&s.status==='ativa').forEach(s=>s.plan='plus');Repo.remove('usage_events',u=>u.userId==='usr_camila')"); nav("cand.jobs")
    check("PLAN-3", "Limite do plano bloqueia entregas além do contratado", ev("Plans.used('usr_camila')") == 3 and "limite do plano" in pg.inner_text("#view"))
    # excluir conta
    nav("cand.privacy"); pg.click("[data-act=deleteAccount]"); pg.fill("#del-confirm", "excluir"); modal("ok"); pg.wait_for_timeout(80)
    check("PRIV-2", "Excluir conta exige digitar EXCLUIR", pg.is_visible(".modal"))
    pg.fill("#del-confirm", "EXCLUIR"); modal("ok"); pg.wait_for_timeout(150)
    check("PRIV-3", "Conta e dados do titular apagados; pedido registrado", not ev("Repo.get('users','usr_camila')") and ev("Repo.find('resumes',r=>r.userId==='usr_camila').length") == 0 and ev("Repo.all('privacy_requests').some(r=>r.type==='Exclusão de conta')"))
    check("ERR-0", "Nenhum erro de JavaScript no fluxo todo", not errs, errs[:2])

    # ---------- persistência ----------
    pg.reload(); pg.wait_for_timeout(300)
    check("DB-1", "Dados persistem após recarregar", ev("Repo.all('jobs').filter(j=>!j.isDemo).length") == 6)

    # ---------- celular, tema, armazenamento bloqueado ----------
    m = b.new_context(viewport={"width": 390, "height": 844}); m.route("**/fonts.googleapis.com/**", lambda r: r.abort()); mp = m.new_page(); merr = []
    mp.on("pageerror", lambda e: merr.append(str(e))); mp.goto(PATH); mp.wait_for_timeout(300)
    widths = {"landing": mp.evaluate("document.documentElement.scrollWidth")}
    mp.click("text=Entrar >> nth=0"); widths["login"] = mp.evaluate("document.documentElement.scrollWidth")
    mp.click("[data-act=demoLogin][data-v=candidate]"); mp.wait_for_timeout(250)
    for pgname in ["cand.home", "cand.resume", "cand.profile", "cand.jobs", "cand.apps", "cand.plan", "cand.privacy"]:
        mp.evaluate(f"App.go('{pgname}')"); mp.wait_for_timeout(80); widths[pgname] = mp.evaluate("document.documentElement.scrollWidth")
    mp.evaluate("App.go('cand.jobs')"); mp.screenshot(path="m_jobs.png")
    mp.click(".menu-btn"); opened = mp.evaluate("document.querySelector('.rail').classList.contains('open')"); mp.click(".scrim", position={"x": 370, "y": 400}); closed = not mp.evaluate("document.querySelector('.rail').classList.contains('open')")
    mp.evaluate("Actions.logout()"); mp.click("text=Entrar >> nth=0"); mp.click("[data-act=demoLogin][data-v=admin]"); mp.wait_for_timeout(200)
    for pgname in ["admin.dashboard", "admin.users", "admin.jobs", "admin.sources", "admin.editorial", "admin.plans", "admin.privacy", "admin.settings"]:
        mp.evaluate(f"App.go('{pgname}')"); mp.wait_for_timeout(80); widths[pgname] = mp.evaluate("document.documentElement.scrollWidth")
    over = {k: v for k, v in widths.items() if v > 390}
    check("MOB-1", "Celular 390px: nenhuma página com rolagem horizontal", not over, over)
    check("MOB-2", "Celular: menu abre e fecha", opened and closed)
    check("MOB-3", "Celular: sem erros", not merr, merr[:1])
    dk = b.new_context(viewport={"width": 1366, "height": 900}, color_scheme="dark"); dk.route("**/fonts.googleapis.com/**", lambda r: r.abort()); dp = dk.new_page(); dp.goto(PATH); dp.wait_for_timeout(200)
    dp.click("text=Entrar >> nth=0"); dp.click("[data-act=demoLogin][data-v=candidate]"); dp.wait_for_timeout(250); dp.evaluate("App.go('cand.resume')"); dp.click("[data-act=resumeTab][data-v=diag]"); dp.screenshot(path="d_diag.png")
    bg = dp.evaluate("getComputedStyle(document.body).backgroundColor")
    check("THEME-1", "Tema escuro aplica fundo escuro", bg != "rgb(244, 246, 241)", bg)
    bl = b.new_context(); bl.route("**/fonts.googleapis.com/**", lambda r: r.abort()); bp = bl.new_page(); berr = []; bp.on("pageerror", lambda e: berr.append(str(e)))
    bp.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})"); bp.goto(PATH); bp.wait_for_timeout(500)
    bp.click("text=Entrar >> nth=0"); bp.click("[data-act=demoLogin][data-v=candidate]"); bp.wait_for_timeout(250)
    check("STO-1", "Armazenamento bloqueado: app funciona e avisa", bp.evaluate("!!App.session()") and not berr and "bloqueou" in bp.inner_text("#toasts"), berr[:1])
    b.close()

print(json.dumps(R, ensure_ascii=False, indent=1))
print(f"{sum(r['ok'] for r in R)}/{len(R)} OK", file=sys.stderr)
for r in R:
    if not r["ok"]: print("FAIL", r["id"], r["desc"], "|", r["obs"], file=sys.stderr)
