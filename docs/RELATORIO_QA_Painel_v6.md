# Manda Vaga — Relatório de QA do Painel (v5 → v6)

**Data:** 17/10/2026 · **Arquivo auditado:** `02_interface/index.html` (Painel v5) · **Arquivo corrigido:** `02_interface/index.html` (Painel v6; o v5 foi mantido como `index_v5_original.html`)

**Método:** testes automatizados em navegador Chromium real (Playwright), em desktop (1366 px) e celular (375 px), com cliques nos botões, preenchimento de formulários, downloads reais e recarga da página. Resultado final: **47 de 47 passos aprovados, sem erro de JavaScript.**

## 1. Defeitos encontrados no v5

| # | Gravidade | Defeito | Efeito para o usuário | Correção no v6 |
|---|---|---|---|---|
| B1 | **Crítica** | A função `persistApps` era chamada, mas não existia | “Preparar candidatura” e “Registrar candidatura” davam erro; **o painel de candidaturas nunca funcionou** | Função criada; fluxo testado de ponta a ponta |
| B2 | Alta | “Candidaturas enviadas” só contava o status “enviada — confirmada” | Ao avançar para “Aguardando resposta” ou “Entrevista”, o total **caía para zero** | Envio confirmado vira um registro permanente da candidatura |
| B3 | Alta | Era possível pular direto para “Entrevista” sem confirmar o envio | Entrevista sem prova de candidatura | Estados pós-envio exigem confirmação + evidência |
| B4 | Alta | O resumo dizia “mais de 20 anos de experiência” | A experiência mais antiga registrada é de 2008 (≈18 anos), e o currículo de teste diz “mais de 10 anos”. **Afirmação sem evidência**, contra o PRD | Texto trocado por “experiência profissional desde 2008” + alerta automático se o número de anos não fechar com as datas |
| B5 | Alta | Mesma vaga podia ser cadastrada várias vezes | Duplicatas inflavam a contagem (PRD §22 proíbe) | Deduplicação por URL canônica (ignora www, utm, âncora e barra final) + aviso de cargo/empresa repetidos |
| B6 | Média | “Baixar currículo personalizado” baixava a versão da **vaga anterior** ao trocar a seleção | Currículo errado enviado para a vaga | Download sempre gera a versão da vaga selecionada |
| B7 | Média | Personalizar não atualizava o contador nem a candidatura | Card “Currículos preparados” ficava sempre em 0 | Versões salvas por vaga; candidatura passa para “Currículo preparado” |
| B8 | Média | Faltavam modalidade e data da consulta (PRD §6.5 e §22) | Vaga sem data de verificação | Campos novos, exibidos na lista e no CSV |
| B9 | Média | Estados diferentes do PRD §19 | Faltavam “Em verificação”, “Resposta recebida”, “Vaga expirada”, “Descartada” etc. | 14 estados do PRD; dados do v5 migrados automaticamente |
| B10 | Média | Não dava para mudar o estado de verificação de uma vaga já cadastrada | Era preciso excluir e recadastrar | Seletor na própria lista; atualiza a data da consulta; vaga encerrada marca candidaturas não enviadas como expiradas |
| B11 | Média | Sem backup nem reset (PRD §8) | Dados presos num navegador | Exportar/importar backup (.json, com validação) e apagar dados locais |
| B12 | Média | Navegador com armazenamento bloqueado travava o “Salvar perfil” | Erro silencioso | Aviso visível; o painel continua funcionando |
| B13 | Baixa | Formação complementar ausente (MBA, Comunicação, Scrum Master) | Currículo mestre mais fraco do que o real | Novo campo, preenchido com dados do currículo de teste |
| B14 | Baixa | Botão ☰ aparecia no computador sem função; no celular, o menu só fechava navegando | Interface confusa | ☰ só no celular; toque fora ou Esc fecha o menu |
| B15 | Baixa | Rótulos não ligados aos campos; código duplicado (`downloadMaster` 2×) | Acessibilidade e manutenção | Corrigido |
| B16 | Baixa | “Registrar candidatura” pedia o número da vaga numa caixa de texto | Pouco amigável | Lista de seleção |

**Não alterado de propósito:** a aderência continua sendo uma estimativa manual (o motor de pontuação é a fase 5 do PRD). O painel segue sem pesquisar portais, sem IA externa e sem envio de candidaturas.

## 2. Testes executados

| ID | Passo | Esperado | Observado | OK | Correção relacionada |
|---|---|---|---|---|---|
| NAV-profile | Clicar no menu 'Perfil e currículo' | Página e título mudam | visível=True, título=Perfil e currículo | ✅ | — |
| NAV-jobs | Clicar no menu 'Oportunidades' | Página e título mudam | visível=True, título=Oportunidades | ✅ | — |
| NAV-apps | Clicar no menu 'Painel de candidaturas' | Página e título mudam | visível=True, título=Painel de candidaturas | ✅ | — |
| NAV-workflow | Clicar no menu 'Fluxo e dados' | Página e título mudam | visível=True, título=Fluxo e dados | ✅ | — |
| NAV-home | Clicar no menu 'Visão geral' | Página e título mudam | visível=True, título=Visão geral | ✅ | — |
| PERF-1 | Abrir perfil com dados padrão | Sem alerta de integridade | False | ✅ | — |
| PERF-2 | Resumo com 'mais de 20 anos' e experiência desde 2008 | Alerta de integridade aparece | Revisão de integridade
O resumo diz “mais de 20 anos”, mas a experiência mais antiga regis | ✅ | Checagem automática de integridade do resumo |
| PERF-3 | Corrigir resumo e salvar | Alerta some; perfil salvo | False | ✅ | — |
| PERF-4 | Gerar currículo mestre | Prévia inclui formação complementar (MBA) | True | ✅ | Campo de formação complementar |
| PERF-5 | Baixar currículo mestre | Arquivo .txt baixado | MandaVaga_Curriculo_Mestre_Agner.txt | ✅ | — |
| VAGA-1 | Registrar vaga vazia | Bloqueia e avisa | Preencha cargo, empresa e link direto. | ✅ | — |
| VAGA-2 | Link javascript: | Rejeita link inválido | Informe um link válido começando com https:// | ✅ | — |
| VAGA-3 | Registrar vaga válida | Vaga entra na lista com modalidade e data da consulta | Estágio em Direito
Escritório A · São Paulo, SP · Híbrido · Site oficial da empresa
Consulta: 17/10/2026 · Pub | ✅ | — |
| VAGA-4 | Mesmo link com www/utm/barra/âncora diferentes | Duplicata bloqueada | Esta vaga já está cadastrada: Estágio em Direito — Escritório A | ✅ | Deduplicação por URL canônica |
| VAGA-5 | Aderência 999% | Limitada a 100 | 100 | ✅ | — |
| FILT-1 | Filtro por palavra-chave (ao digitar) | Mostra 1 de 3 | 1 de 3 vaga(s) | ✅ | Filtro aplica ao digitar |
| FILT-2 | Filtro por localização | Mostra só Guarulhos | 1 de 3 vaga(s) | ✅ | — |
| FILT-3 | Filtro por verificação | Mostra 1 de 3 | 1 de 3 vaga(s) | ✅ | — |
| FILT-4 | Limpar filtros e ordenar por aderência | 3 vagas; maior aderência primeiro | 3 vaga(s) / topo=Auxiliar de Cartório | ✅ | — |
| FILT-5 | Filtro sem resultados | Estado vazio explicativo | Nenhuma vaga com esses filtros
Ajuste ou limpe os filtros. | ✅ | — |
| EXP-1 | Exportar vagas CSV | CSV com cabeçalho, modalidade e data da consulta, 3 linhas | "Cargo","Empresa","Cidade","Modalidade","Fonte","Link","Data da consulta","Publi | ✅ | CSV com modalidade e data da consulta |
| CAND-1 | Preparar candidatura (antes quebrava: persistApps inexistente) | Candidatura criada, painel aberto, sem erro | apps=1, erros=[] | ✅ | Criada a função persistApps (antes inexistente) |
| CAND-2 | Status inicial | Selecionada (vaga já verificada) | Selecionada | ✅ | — |
| CAND-3 | Preparar candidatura de novo para a mesma vaga | Não duplica | 1 | ✅ | — |
| CAND-4 | Status 'Envio tentado — sem confirmação' | Não conta como enviada; conta como pendência | enviadas=0 pend=1 | ✅ | — |
| CAND-5 | Marcar como enviada (confirma + evidência) | Conta 1 enviada e grava evidência | enviadas=1 ev=Protocolo 123 exibido na tela | ✅ | — |
| CAND-6 | Avançar para Aguardando resposta → Entrevista | Continua contando 1 enviada (antes caía para 0) | 1 | ✅ | Contagem por flag 'confirmed', não pelo nome do status |
| CAND-7 | Pular para 'Entrevista agendada' sem evidência | Bloqueado; status não muda; não conta como enviada | Em verificação, enviadas=1 | ✅ | Estados pós-envio exigem confirmação + evidência |
| CAND-8 | Editar próxima ação | Salvo na candidatura | Ligar para RH | ✅ | — |
| PERS-1 | 'Personalizar currículo' a partir do painel | Abre perfil com a vaga selecionada | True | ✅ | — |
| PERS-2 | Preparar versão personalizada | Mostra termos sustentados e lacunas (ex.: projudi) | Versão preparada para revisão
Estágio em Direito — Escritório A
direito
prazos
atendimento
cliente
excel
Sem e | ✅ | — |
| PERS-3 | Contador e status do currículo | Currículos personalizados = 1; candidatura passa a 'Currículo preparado' | 1 / Currículo preparado | ✅ | Versões por vaga salvas; status do currículo atualizado |
| PERS-4 | Trocar a vaga e baixar (antes baixava a versão da vaga anterior) | Arquivo corresponde à vaga selecionada | MandaVaga_Curriculo_Assistente_Administrativo_Juridico_Empresa_B.txt | ✅ | Download regenera para a vaga selecionada |
| VER-1 | Marcar vaga como encerrada na lista | Vaga sai das ativas; candidatura não enviada vira 'Vaga expirada/indisponível' | ativas=2 status=Vaga expirada/indisponível | ✅ | Seletor de verificação na própria lista |
| EXP-2 | Exportar painel CSV | Inclui coluna 'Envio confirmado' | "Cargo","Empresa","Cidade","Link","Registro","Status","Envio confirmado","Data do envio"," | ✅ | — |
| PERS-DB | Recarregar a página | Vagas, candidaturas, perfil e currículos mantidos | jobs=3 apps=2 resumes=2 resumo=Estudante de Direito com exper | ✅ | — |
| BKP-1 | Exportar backup | JSON com perfil, vagas e candidaturas | jobs=3 apps=2 | ✅ | — |
| BKP-2 | Importar backup com dados maliciosos | Vaga com link javascript: descartada; HTML escapado; IDs saneados | jobs=4 | ✅ | Importação valida URL, saneia IDs e escapa HTML |
| BKP-3 | Importar arquivo inválido | Aviso e dados preservados | Arquivo inválido: não é um backup do Manda Vaga. | ✅ | — |
| BKP-4 | Apagar dados locais | Tudo zerado após confirmar | jobs=0 apps=0 | ✅ | — |
| ERR-0 | Console durante todo o fluxo | Nenhum erro de JavaScript | [] | ✅ | — |
| MIG-1 | Abrir v6 com dados salvos pelo v5 | Dados migrados e estados antigos convertidos | 1 / Aguardando ação do candidato | ✅ | Migração automática mv5 → mv6 |
| STO-1 | Navegador com armazenamento bloqueado | Aviso visível e sem travar | aviso=True erros=[] | ✅ | Leitura/escrita protegidas + aviso |
| MOB-1 | Celular 375px: abrir e fechar menu | Menu abre e fecha tocando fora | abriu=True fechou=True | ✅ | Fundo escuro clicável fecha o menu |
| MOB-2 | Celular 375px: largura de todas as páginas | Sem rolagem horizontal (≤375) | [375, 375, 375, 375, 375] | ✅ | — |
| DSK-1 | Desktop: botão ☰ | Oculto (antes aparecia sem função) | False | ✅ | Botão ☰ só no celular |
| A11Y-1 | Campos de formulário | Todos associados a um rótulo | todos ok | ✅ | Rótulos ligados aos campos |

## 3. Lote-piloto: 5 vagas individuais

Consultadas em **17/10/2026**, cada uma no anúncio individual. **Nenhuma candidatura foi enviada** e o perfil Gupy **não** foi atualizado. Nenhuma das páginas informa prazo; o status “aberta” vem da presença do botão de candidatura, sem confirmação formal. Para carregar tudo no painel: aba **Fluxo e dados → Importar backup →** `MandaVaga_Lote_Piloto_17-10-2026.json`.

| # | Vaga | Empresa | Local / modalidade | Grupo | Aderência | Principal lacuna / pendência |
|---|---|---|---|---|---|---|
| 1 | [Estágio Jurídico Trabalhista](https://www.vagas.com.br/vagas/v2836402/estagio-juridico-trabalhista) | SulAmérica | SP, Av. Paulista · híbrido 3+2 | 1 – Trabalhista | 80% | Sem semestre mínimo. Confirmar horário com a faculdade |
| 2 | [Estágio Jurídico – Contencioso e Regulatório](https://www.vagas.com.br/vagas/v2835862/estagio-juridico-contencioso-e-regulatorio) | SulAmérica | SP, Av. Paulista · híbrido 3+2 | 2 – Prazos/processual | 78% | Mesma empresa da nº 1; priorizar uma se o portal limitar |
| 3 | [Assistente de Marketing](https://caasp.gupy.io/jobs/12492390) | CAASP | São Paulo · não informada | 5 – Marketing jurídico | 75% | Pede Google Analytics e Meta Ads, que não constam no perfil. Vaga CLT, não estágio |
| 4 | [Estágio Tributário](https://www.vagas.com.br/vagas/v2838700/estagio-tributario) | Confidencial | São Paulo · não informada | 2/4 – Processos e documentos | 60% | Empresa não identificada; sem base tributária |
| 5 | [Auxiliar de Controladoria Jurídica](https://radardagestao.com.br/vaga/auxiliar-de-controladoria-jurdica/1301/2026) | Escritório (via Radar da Gestão) | SP, Paulista · presencial 9h–18h | 2 – Controladoria | 50% | Pede experiência em rotina jurídica e CPJ; contrato PJ; jornada integral |

**Reservas verificadas, com restrição:**
- [Estágio Jurídico | Marcas – Dannemann](https://dannemann.gupy.io/jobs/12384061?jobBoardSource=gupy_public_page): aceita até o 6º semestre, mas exige **inglês fluente**.
- [Estagiário(a) de Direito – Contratos Corporativos – Silveiro](https://silveiroadvogados.gupy.io/jobs/12491592?jobBoardSource=gupy_public_page): prefere a partir do 4º semestre e pede **inglês avançado**.
- [Auxiliar de Jornalismo – CAASP](https://caasp.gupy.io/jobs/12492750): aceita superior em curso, mas prefere Jornalismo ou Marketing.

**Descartadas:** Estágio Direito Daycoval (inscrições encerradas); Estágio em PI & Digital Silveiro (a partir do 6º semestre).

**Não verificada:** [Assistente Administrativo (Jurídico) – Azevedo & Travassos](https://www.vagas.com.br/vagas/v2839316/assistente-administrativo-juridico). A página não abriu nesta consulta; vale conferir manualmente.

**Pendências para você confirmar antes de se candidatar:** (1) nível de inglês; (2) se usa Google Analytics e Meta Ads, e em que nível; (3) turno das aulas na CTA, para checar a compatibilidade com o horário dos estágios.

## 4. Revisão da landing page (anexo `manda-vaga-landing-page.html`)

O **HTML** está alinhado ao PRD: aviso de ausência de vínculo com as marcas, FAQ dizendo que não há garantia, cards com link individual de cada vaga e a decisão final com o candidato. Pontos a ajustar:

1. **Acessibilidade do carrossel:** os cards duplicados recebem `aria-hidden`, mas os links dentro deles continuam focáveis pelo teclado. Aplicar `tabindex="-1"` nos links (ou `inert` no card).
2. **Data de verificação:** os cards mostram só a data de publicação. O PRD §6.1 pede status e data da última verificação. Sugestão: “Verificada em 17/10/2026”.
3. **Vagas antigas:** há estágios publicados em agosto (Britvic). Revalidar antes de publicar.

A **imagem** enviada (versão com a modelo e o tablet) tem três pontos de risco em relação ao PRD:

1. **“+12 mil pessoas já melhoraram seus currículos”:** o produto ainda está em protótipo. Prova social sem dado real é afirmação inventada e pode ser considerada propaganda enganosa (CDC, art. 37). Remover ou trocar por um número real quando existir.
2. **Faixa com 15 logos** (“Vagas de empresas que recrutam com tecnologia e IA”: Gupy, LinkedIn, Catho, Indeed, Glassdoor etc.): sugere parceria e que o Manda Vaga traz vagas de todas essas fontes, o que ainda não acontece. O HTML resolveu isso com aviso e marcas reais com link. Se a faixa for mantida, ela precisa do mesmo aviso e só deve listar fontes realmente usadas.
3. **“Depoimentos” no menu e “Melhores empresas — no Brasil e no mundo”:** não existem depoimentos reais e a busca não cobre o exterior. Retirar até haver conteúdo verdadeiro.
