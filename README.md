# Manda Vaga

Currículo primeiro. Vagas depois. A decisão é do candidato.

SaaS que (1) prepara um currículo-base fiel à trajetória real, (2) busca e classifica vagas compatíveis com aderência explicável e (3) entrega as oportunidades e acompanha as candidaturas, sem enviar nada sem confirmação.

## Estado atual
Protótipo funcional **local-first** (fases 3 a 10 do PRD). Tudo roda no navegador com dados demonstrativos; integrações externas aparecem como "não conectadas".

- `app/src/` — código-fonte em camadas: `01_core` (utilidades, repositório e adaptadores), `02_domain` (regras de currículo, palavras-chave, aderência, deduplicação, planos e estados), `03_seed` (dados demonstrativos), `04_app` / `05_candidate` / `06_admin` (interface), `07_actions` (eventos e formulários).
- `app/dist/index.html` — app em arquivo único. Abra no navegador.
- `tests/e2e.py` — testes ponta a ponta (Playwright). Último resultado: 59/59.
- `docs/` — PRD mestre (com adendos 3.1 e 3.2), relatório de QA do painel v6 e a estratégia de descoberta diária de vagas.
- `prototipos/` — painel v6 e landing page.
- `piloto/` — lote-piloto de 5 vagas reais consultadas em 17/10/2026.

## Rodar
```bash
cd app && python3 build.py          # gera dist/index.html
pip install playwright && python3 ../tests/e2e.py   # testes
```
Contas de demonstração (tela de login): candidata com currículo, candidato novo e administrador. Senha: `demo1234`.

## Próximas fases
1. Banco, autenticação e armazenamento (ex.: Supabase).
2. Leitura de PDF/DOCX e geração de PDF.
3. Robô diário de vagas (agregadores, ATS, sites oficiais, canais públicos), respeitando termos de uso.
4. Candidatura assistida e envio por e-mail com confirmação.
5. Central de Respostas (e-mail) e notificações.
6. Pagamentos.
7. LGPD e piloto com usuários reais.

O Manda Vaga não é agência de emprego e não garante entrevista ou contratação.
