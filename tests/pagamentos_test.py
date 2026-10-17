import subprocess, time, json, urllib.request, os, tempfile
from playwright.sync_api import sync_playwright
import pathlib
R=str(pathlib.Path(__file__).resolve().parent.parent); store=tempfile.mktemp(suffix=".json")
mock=subprocess.Popen(["node","tests/mock_asaas.js"],cwd=R)
env=dict(os.environ,PORT="3130",ASAAS_API_KEY="chave_teste",ASAAS_BASE_URL="http://localhost:4010/v3",ASAAS_WEBHOOK_TOKEN="whk_teste",PAYMENTS_STORE=store)
srv=subprocess.Popen(["node","server.js"],cwd=R,env=env); time.sleep(1.2)
B="http://localhost:3130"; out=[]
def req(m,u,body=None,h=None):
    r=urllib.request.Request(B+u,method=m,data=json.dumps(body).encode() if isinstance(body,dict) else body,headers={"Content-Type":"application/json",**(h or {})})
    try:
        with urllib.request.urlopen(r) as x: return x.status,json.loads(x.read())
    except urllib.error.HTTPError as e: return e.code,json.loads(e.read())
def ck(i,d,ok,o=""): out.append((i,d,bool(ok),str(o)[:120]))
try:
    s,b=req("GET","/api/config"); ck("PAY-1","Servidor informa pagamentos ativos sem expor a chave",b["payments"] and "chave" not in json.dumps(b),b)
    ref="a"*32
    s,b=req("POST","/api/checkout",{"plan":"max","name":"Teste Silva","email":"t@ex.com","cpfCnpj":"123","ref":ref}); ck("PAY-2","CPF inválido é recusado",s==400,b)
    s,b=req("POST","/api/checkout",{"plan":"vip","name":"Teste Silva","email":"t@ex.com","cpfCnpj":"52998224725","ref":ref}); ck("PAY-3","Plano inexistente é recusado",s==400,b)
    s,b=req("POST","/api/checkout",{"plan":"max","name":"Teste Silva","email":"t@ex.com","cpfCnpj":"529.982.247-25","ref":ref,"value":1}); ck("PAY-4","Checkout cria cliente e assinatura e devolve o link de pagamento",s==200 and b["invoiceUrl"].startswith("https://"),b)
    calls=json.loads(urllib.request.urlopen("http://localhost:4010/__calls").read())
    sub=[c for c in calls if c["u"]=="/v3/subscriptions"][0]["b"]
    ck("PAY-5","Preço vem do servidor (ignora valor enviado pelo navegador)",sub["value"]==59.9 and sub["cycle"]=="MONTHLY" and sub["externalReference"]==ref,sub)
    ref2="c"*32
    s,b=req("POST","/api/checkout",{"plan":"max","cycle":"semestral","name":"Teste Silva","email":"t@ex.com","cpfCnpj":"52998224725","ref":ref2})
    sub2=[c for c in json.loads(urllib.request.urlopen("http://localhost:4010/__calls").read()) if c["u"]=="/v3/subscriptions"][-1]["b"]
    ck("PAY-5b","Semestral do Max: R$ 251,90 a cada 6 meses (preço arredondado em ,90), ciclo SEMIANNUALLY",s==200 and sub2["value"]==251.9 and sub2["cycle"]=="SEMIANNUALLY",sub2)
    s,b=req("POST","/api/checkout",{"plan":"inicial","cycle":"trimestral","name":"Teste Silva","email":"t@ex.com","cpfCnpj":"52998224725","ref":"d"*32})
    sub3=[c for c in json.loads(urllib.request.urlopen("http://localhost:4010/__calls").read()) if c["u"]=="/v3/subscriptions"][-1]["b"]
    ck("PAY-5c","Trimestral do Inicial: R$ 47,90 a cada 3 meses (preço arredondado em ,90), ciclo QUARTERLY",sub3["value"]==47.9 and sub3["cycle"]=="QUARTERLY",sub3)
    s,b=req("POST","/api/checkout",{"plan":"max","cycle":"anual","name":"Teste Silva","email":"t@ex.com","cpfCnpj":"52998224725","ref":"e"*32}); ck("PAY-5d","Ciclo anual (removido) é recusado",s==400,b)
    s,b=req("GET","/api/subscription?ref="+ref); ck("PAY-6","Status começa como pendente",b["status"]=="PENDING",b)
    ev={"id":"evt_1","event":"PAYMENT_CONFIRMED","payment":{"id":"pay_1","subscription":"sub_teste1","externalReference":ref,"status":"CONFIRMED"}}
    s,b=req("POST","/api/webhooks/asaas",json.dumps(ev).encode(),{"asaas-access-token":"errado"}); ck("PAY-7","Webhook com token errado é recusado",s==401,b)
    s,b=req("GET","/api/subscription?ref="+ref); ck("PAY-8","Token errado não ativa o plano",b["status"]=="PENDING")
    s,b=req("POST","/api/webhooks/asaas",json.dumps(ev).encode(),{"asaas-access-token":"whk_teste"}); ck("PAY-9","Webhook válido responde 200",s==200,b)
    s,b=req("GET","/api/subscription?ref="+ref); ck("PAY-10","Pagamento confirmado ativa a assinatura",b["status"]=="ACTIVE",b)
    s,b=req("POST","/api/webhooks/asaas",json.dumps(ev).encode(),{"asaas-access-token":"whk_teste"}); ck("PAY-11","Evento repetido é ignorado (idempotência)",b.get("duplicate") is True,b)
    s,b=req("GET","/api/subscription?ref="+"b"*32); ck("PAY-12","Referência desconhecida não revela nada",s==404)
    # fluxo no navegador
    with sync_playwright() as p:
        br=p.chromium.launch(); pg=br.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        pg.route("**/fonts.googleapis.com/**",lambda r:r.abort())
        pg.goto(B+"/app/"); pg.wait_for_timeout(500)
        ck("PAY-13","/app/ abre direto no login",pg.is_visible("form[data-form=login]"))
        pg.click("[data-act=demoLogin][data-v=candidate]"); pg.wait_for_timeout(300)
        pg.evaluate("App.go('cand.plan')"); pg.click("[data-act=changePlan][data-v=max]"); pg.wait_for_timeout(300)
        ck("PAY-14","Assinar abre o formulário de cobrança real",pg.is_visible("#pg-doc"))
        pg.fill("#pg-doc","52998224725"); pg.click(".modal [data-modal=ok]"); pg.wait_for_timeout(800)
        link=pg.locator(".modal a[href*='asaas']").count()
        ck("PAY-15","Mostra o botão para a página de pagamento da Asaas",link==1)
        uref=pg.evaluate("Repo.get('users','usr_camila').paymentRef")
        ck("PAY-16","Plano não ativa antes da confirmação",pg.evaluate("Plans.of('usr_camila').key")=="inicial")
        req("POST","/api/webhooks/asaas",json.dumps({"id":"evt_2","event":"PAYMENT_RECEIVED","payment":{"subscription":"sub_teste1","externalReference":uref}}).encode(),{"asaas-access-token":"whk_teste"})
        pg.click(".modal [data-modal=check]"); pg.wait_for_timeout(800)
        ck("PAY-17","Depois do webhook, “Verificar pagamento” ativa o Max",pg.evaluate("Plans.of('usr_camila').key")=="max")
        pg.evaluate("App.go('cand.responses')"); pg.wait_for_timeout(150)
        ck("MAX-1","Central de Respostas liberada no Max",pg.locator("[data-act=addResponse]").count()>=1)
        pg.click("[data-act=addResponse] >> nth=0"); pg.fill("#rp-int-date","2026-10-30"); pg.fill("#rp-summary","RH chamou para entrevista"); pg.click(".modal [data-modal=ok]"); pg.wait_for_timeout(300)
        a=pg.evaluate("Repo.get('applications','app_cam1')")
        ck("MAX-2","Registrar convite agenda entrevista, conta como enviada e sugere resposta",a["status"]=="Entrevista agendada" and a["confirmed"] and pg.is_visible("#rp-draft"),a["status"])
        pg.click(".modal [data-modal=close]")
        ck("ERR","Sem erros de JavaScript",not errs,errs[:1])
        br.close()
    ck("SEC-1","Documentos internos não são servidos",urllib.request.Request(B+"/docs/PRD-Mestre.md") and __import__("subprocess").run(["curl","-s","-o","/dev/null","-w","%{http_code}",B+"/docs/PRD-Mestre.md"],capture_output=True,text=True).stdout=="404")
finally:
    srv.terminate(); mock.terminate()
for i,d,ok,o in out: print(("OK  " if ok else "FAIL"),i,d,"" if ok else o)
print(f"{sum(1 for x in out if x[2])}/{len(out)}")
json.dump([{"id":i,"desc":d,"ok":ok} for i,d,ok,o in out],open(pathlib.Path(__file__).with_name("pay_results.json"),"w"),ensure_ascii=False)
