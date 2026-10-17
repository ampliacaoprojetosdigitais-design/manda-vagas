# Manda Vaga

Currículo primeiro. Vagas depois. A decisão é do candidato.

SaaS que (1) prepara um currículo-base fiel à trajetória real, (2) busca e classifica vagas compatíveis com aderência explicável e (3) entrega as oportunidades e acompanha as candidaturas, sem enviar nada sem confirmação.

## Estado atual
Protótipo funcional **local-first** (fases 3 a 10 do PRD). Tudo roda no navegador com dados demonstrativos; integrações externas aparecem como "não conectadas".

- `app/src/` — código-fonte em camadas: `01_core` (utilidades, repositório e adaptadores), `02_domain` (regras de currículo, palavras-chave, aderência, deduplicação, planos e estados), `03_seed` (dados demonstrativos), `04_app` / `05_candidate` / `06_admin` (interface), `07_actions` (eventos e formulários).
- `site/` — landing page (StoryBrand) servida em `/`; `site/landing.src.html` é o modelo com marcadores.
- `app/dist/index.html` — app em arquivo único, servido em `/app/`. O início do candidato é um assistente em conversa.
- `tests/e2e.py` — testes ponta a ponta (Playwright). Último resultado: 64/64.
- `docs/` — PRD mestre (com adendos 3.1 e 3.2), relatório de QA do painel v6 e a estratégia de descoberta diária de vagas.
- `prototipos/` — painel v6 e landing page.
- `piloto/` — lote-piloto de 5 vagas reais consultadas em 17/10/2026.

## Rodar
```bash
npm start                           # landing em http://localhost:3000 e app em /app/
```

Para desenvolver:
```bash
cd app && python3 build.py          # gera dist/index.html
pip install playwright && python3 ../tests/e2e.py   # testes
```
Contas de demonstração (tela de login): candidata com currículo, candidato novo e administrador. Senha: `demo1234`.

## Pagamentos (Asaas)
O servidor cria cliente e assinatura mensal na Asaas, devolve o link de pagamento e ativa o plano quando a Asaas avisa pelo webhook. O preço é definido no servidor (`payments/asaas.js`).

1. Na Asaas, gere a chave da API (comece pelo Sandbox).
2. Na hospedagem, configure as variáveis de `.env.example` (`ASAAS_API_KEY`, `ASAAS_ENV`, `ASAAS_WEBHOOK_TOKEN`).
3. Na Asaas, cadastre o webhook `https://SEU-DOMINIO/api/webhooks/asaas` com o mesmo token e os eventos de cobrança (`PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED`, `PAYMENT_REFUNDED`).
4. Sem a chave configurada, o app continua com a troca de plano simulada.

Testes com uma Asaas simulada (sem cobrança real): `python3 tests/pagamentos_test.py` (21/21).

Limite desta fase: as contas ainda ficam no navegador do usuário. O registro de pagamento fica em `data/payments.json` no servidor. A trava definitiva de plano precisa do banco e do login no servidor (próxima fase).

## Publicar na Hostinger (Node.js)
Importe este repositório, branch `main`. Comando de início: `npm start`. A porta vem da variável `PORT`. Não é preciso rodar build: `app/dist/index.html` já vai no repositório.

## Próximas fases
1. Banco, autenticação e armazenamento (ex.: Supabase).
2. Leitura de PDF/DOCX e geração de PDF.
3. Robô diário de vagas (agregadores, ATS, sites oficiais, canais públicos), respeitando termos de uso.
4. Candidatura assistida e envio por e-mail com confirmação.
5. Central de Respostas (e-mail) e notificações.
6. Pagamentos.
7. LGPD e piloto com usuários reais.

O Manda Vaga não é agência de emprego e não garante entrevista ou contratação.
