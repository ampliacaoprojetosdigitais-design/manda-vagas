# PRD Mestre --- Manda Vaga

**Versão 2.0 · 17/10/2026 · Documento mestre de produto e
desenvolvimento**

## 1. Objetivo deste documento

Este é o documento oficial de referência para projetar, construir e
testar o Manda Vaga antes de conectar serviços externos. Ele consolida a
visão do produto, os fluxos, os módulos, os critérios de aceite e a
estratégia de substituição de dados simulados por serviços reais.

**Regra de desenvolvimento:** primeiro construir e validar localmente
tudo o que for possível; depois conectar banco remoto, IA externa,
fontes reais de vagas, notificações, pagamentos e hospedagem. Nenhum
protótipo deve ser tratado como integração real.

## 2. Visão e posicionamento

O Manda Vaga ajuda candidatos a preparar melhor seus currículos para
mecanismos de recrutamento, identificar oportunidades compatíveis e
receber uma curadoria personalizada dentro da plataforma.

### Promessa central

**Primeiro melhoramos e estruturamos seu currículo; depois buscamos
vagas compatíveis com seu perfil e entregamos essas oportunidades para
você.**

O Manda Vaga não é agência de emprego, não representa empresas
contratantes e não garante que um currículo será encontrado, entrevista
ou contratação. A plataforma melhora a clareza, a organização e a
correspondência do currículo com requisitos relevantes, sem inventar
qualificações.

## 3. Fluxo principal oficial: três etapas

### Etapa 1 --- Preparar um currículo inteligente e flexível

É o primeiro serviço e a principal prioridade do produto. - Receber
currículo por arquivo ou preenchimento manual. - Extrair/organizar
experiências, formação, competências, certificações e resultados
informados pelo candidato. - Diagnosticar clareza, estrutura,
legibilidade, lacunas e consistência. - Identificar palavras-chave
relevantes que já sejam sustentadas pela experiência real do
candidato. - Identificar competências transferíveis e famílias de cargos
plausíveis, sem transformar o currículo em algo genérico nem declarar
competências inexistentes. - Produzir currículo-base flexível,
organizado e legível por sistemas de recrutamento. - Mostrar comparação
antes/depois, explicando cada alteração e permitindo revisão do
candidato. - Permitir edição manual, histórico de versões e exportação
em formatos adequados. - Solicitar confirmação quando houver dados
ausentes, contraditórios ou ambíguos.

**Resultado:** currículo-base claro, estruturado e versátil para
oportunidades compatíveis com a trajetória real do candidato.

### Etapa 2 --- Buscar e selecionar vagas compatíveis

-   Usar o perfil profissional estruturado e o currículo-base como base
    da busca.
-   Considerar competências, experiências, formação, cargos-alvo,
    localização, modalidade, faixa salarial opcional e preferências.
-   Normalizar informações das vagas: cargo, empresa, local, modalidade,
    requisitos, palavras-chave, fonte, URL individual, data de
    publicação/consulta e status.
-   Calcular uma pontuação explicável de aderência, sem prometer
    previsão de contratação.
-   Explicar requisitos correspondentes, pontos fortes e lacunas
    identificadas.
-   Deduplicar anúncios e marcar vagas expiradas ou não verificadas.
-   Priorizar vagas recentes e fontes permitidas/autorizadas.

**Resultado:** uma curadoria de oportunidades relevantes, ordenadas por
compatibilidade e qualidade dos dados.

### Etapa 3 --- Entregar as vagas ao candidato

-   Mostrar as oportunidades na área pessoal do usuário.
-   Exibir motivo da recomendação, data da última verificação,
    localidade, modalidade, requisitos e link direto para a vaga
    individual.
-   Permitir salvar, dispensar e acompanhar vagas.
-   Notificar o usuário conforme preferências e consentimentos
    configurados.
-   Permitir que o candidato decida se quer se candidatar.
-   Oferecer, quando útil, uma versão do currículo adaptada à vaga
    específica, sem alterar fatos nem criar competências.
-   Registrar histórico e status de candidatura quando o usuário
    informar.

**Resultado:** vagas entregues de forma organizada, com controle da
decisão nas mãos do candidato.

## 4. Público-alvo

-   Pessoas em busca do primeiro emprego, incluindo estágio e jovem
    aprendiz.
-   Profissionais em recolocação.
-   Pessoas em transição de carreira.
-   Trabalhadores experientes que precisam melhorar a apresentação do
    currículo.
-   Usuários com pouca familiaridade digital, que precisam de linguagem
    simples e passos guiados.

## 5. Princípios de produto

1.  Currículo primeiro; curadoria de vagas depois; entrega personalizada
    por último.
2.  Toda alteração sugerida deve ser explicável e revisável.
3.  Não inventar experiência, diploma, datas, resultados, certificações
    ou competências.
4.  Mostrar fontes e links individuais para os anúncios; não apresentar
    links genéricos como se fossem anúncios específicos.
5.  Distinguir dados simulados, dados reais e dados desatualizados.
6.  Nenhuma candidatura, publicação ou mensagem externa deve ser enviada
    sem autorização adequada.
7.  Privacidade e segurança desde o desenho.
8.  Interfaces de integração devem permitir substituir adaptadores
    simulados por adaptadores reais sem reescrever as regras de negócio.

## 6. Módulos e requisitos funcionais

### 6.1 Landing page pública

-   Apresentar o problema e a proposta de valor com estrutura
    StoryBrand.
-   Destacar a melhoria do currículo como serviço principal.
-   Explicar o fluxo de três etapas.
-   Ter CTA claro para começar.
-   Mostrar marcas de plataformas de recrutamento somente para fins
    informativos, sem sugerir parceria ou endosso.
-   Mostrar vagas apenas com URL individual e status/data verificáveis
    quando forem apresentadas como reais.
-   Exibir aviso de independência e ausência de garantia de contratação.
-   Ser responsiva, acessível e otimizada para carregamento.

### 6.2 Cadastro, autenticação e perfil

-   Cadastro, login, logout, recuperação de senha e edição de perfil.
-   Campos: nome, cidade/UF, cargos-alvo, experiências, formação,
    competências, modalidade, preferências e salário opcional.
-   Consentimentos separados para comunicações opcionais.
-   No modo local, usar perfis de demonstração claramente identificados.

### 6.3 Gestão e análise de currículo

-   Upload planejado de PDF/DOCX/TXT e opção de preenchimento manual.
-   Validação de formato e tamanho.
-   Representação interna estruturada do currículo.
-   Análise de seções, clareza, consistência, palavras-chave,
    competências e lacunas.
-   Recomendações com explicação antes/depois.
-   Edição e versões com histórico.
-   Exportação inicial para HTML/TXT e, conforme a implementação,
    PDF/DOCX.
-   Separar fatos declarados pelo candidato de sugestões editoriais.

### 6.4 Motor de palavras-chave e flexibilidade

-   Extrair termos do currículo e de descrições de vagas.
-   Agrupar palavras-chave por competências, ferramentas, tarefas, área
    e cargo.
-   Marcar cada termo como sustentado, precisa de confirmação ou
    ausente.
-   Só incluir termos sustentados por informações do candidato; termos
    ausentes podem aparecer como lacunas de desenvolvimento, não como
    qualificações declaradas.
-   Recomendar famílias de cargos compatíveis com evidências do
    currículo.
-   Evitar excesso de palavras-chave e repetição artificial.
-   Produzir uma versão-base ampla, mas coerente, e permitir versões
    específicas por oportunidade.

### 6.5 Motor de curadoria e aderência

-   Filtrar por cargo, competências, nível, localização, modalidade e
    preferências.
-   Calcular score explicável por dimensões configuráveis.
-   Mostrar pontos correspondentes e lacunas; não apresentar score como
    probabilidade de contratação.
-   Dar prioridade a anúncios com fonte e URL individual, data de
    publicação e verificação recente.
-   Deduplicar por URL canônica, identificador da fonte e similaridade.
-   Desativar ou sinalizar oportunidades vencidas, removidas ou sem
    validação recente.
-   No modo de demonstração, usar conjunto sintético claramente
    rotulado.

### 6.6 Área do candidato

-   Resumo do currículo e estado de conclusão.
-   Vagas recomendadas e justificativa de compatibilidade.
-   Vagas salvas, dispensadas e candidaturas acompanhadas.
-   Versões de currículo por vaga.
-   Histórico de atividade e consumo do plano.
-   Preferências de notificação e privacidade.

### 6.7 Candidaturas

Estados iniciais: salva, preparando candidatura, candidatura realizada
pelo usuário, aguardando resposta, entrevista, encerrada/recusada e vaga
indisponível. - Permitir atualização manual de status e notas. - Abrir o
anúncio original em nova aba. - Não automatizar candidaturas no MVP.

### 6.8 Painel administrativo

-   Dashboard com usuários totais, novos usuários, usuários ativos,
    conversão e uso.
-   Distribuição agregada por cidade/UF, faixa etária quando
    legitimamente fornecida, área profissional e origem de aquisição.
-   Exibir também dados ausentes; não inferir idade ou características
    sensíveis.
-   Busca e gestão de usuários com controles de acesso.
-   Gestão de empresas/fontes, vagas, status, datas de checagem e URLs
    individuais.
-   Área editorial para selecionar vagas verificadas, criar pautas,
    carrosséis e rascunhos; revisão humana antes de publicação.
-   Gestão de planos, limites, eventos de uso e solicitações de
    privacidade.
-   Dados simulados devem estar marcados como demonstração e nunca
    misturados silenciosamente aos dados reais.

### 6.9 Planos e limites

Planos propostos já discutidos: - Inicial: R\$ 19,90/mês --- até 100
oportunidades únicas/mês. - Plus: R\$ 29,90/mês --- até 200
oportunidades únicas/mês. - Max: R\$ 39,90/mês --- até 500 oportunidades
únicas/mês.

A unidade de consumo e a definição de oportunidade única precisam ser
aplicadas consistentemente. Não contar duplicatas como novas
oportunidades. No modo local, simular mudança de plano, limites e
consumo; pagamentos reais só após selecionar e integrar um provedor.

### 6.10 Conteúdo editorial (somente administração)

-   Ferramenta interna para transformar vagas selecionadas em pautas e
    rascunhos de conteúdo.
-   Não mostrar ferramentas editoriais no painel do candidato.
-   Guardar a fonte, URL individual, data de verificação e notas de
    revisão.
-   Não copiar integralmente anúncios protegidos; resumir com atribuição
    e link.
-   Exigir revisão humana antes de publicar.

## 7. Arquitetura de desenvolvimento local-first

### Camadas

-   **Interface:** componentes e páginas sem regras de negócio críticas
    embutidas.
-   **Domínio:** regras de currículo, palavras-chave, aderência,
    curadoria, limites e estados.
-   **Repositórios de dados:** contratos estáveis para perfis,
    currículos, vagas, candidaturas e planos.
-   **Adaptadores:** armazenamento local simulado, futuro Supabase,
    futuro provedor de IA, fontes de vagas, notificações e pagamentos.
-   **Testes:** unitários para regras, testes de fluxo e testes de
    interface.

### Regra de substituição

Criar contratos/interfaces antes de integrar serviços. A implementação
de demonstração deve respeitar os mesmos contratos do serviço futuro. A
substituição real deve exigir configuração e adaptadores, não reescrever
telas e regras centrais.

### Stack proposta

Frontend React + TypeScript + Vite para a aplicação modular. HTML
estático pode ser mantido para protótipos e landing page, mas não deve
virar a arquitetura inteira do produto sem avaliação. Futuro
backend/banco pode usar Supabase; hospedagem Vercel ou Hostinger
conforme requisitos finais. Segredos só no servidor.

## 8. Modo de demonstração

-   Usar dados sintéticos, com rótulos visíveis como "Dados
    demonstrativos".
-   Simular cadastro, persistência local, análise, curadoria,
    candidaturas e planos.
-   Fornecer perfis e currículos de teste diversos, sem usar dados
    pessoais reais.
-   Criar cenários positivos, negativos, incompletos, duplicados e
    expirados.
-   Permitir reset de dados de demonstração.
-   Não afirmar que uma vaga fictícia está aberta ou que uma IA externa
    foi executada.
-   Exibir mensagens de indisponibilidade quando uma operação exigir
    integração ainda não conectada.

## 9. Modelo de dados conceitual

-   `profiles`: usuário, localização, cargos-alvo, preferências e
    consentimentos.
-   `resumes`: currículo original, texto extraído, estado e metadados.
-   `resume_versions`: conteúdo estruturado, tipo de versão, vaga-alvo
    opcional, alterações e data.
-   `resume_keyword_evidence`: termo, origem, evidência do currículo e
    estado de confirmação.
-   `job_sources`: nome, tipo, URL, autorização/termos, limites e última
    sincronização.
-   `jobs`: fonte, identificador externo, URL canônica individual,
    empresa, cargo, local, modalidade, requisitos, datas e status.
-   `job_matches`: usuário, vaga, score, dimensões e explicação.
-   `saved_jobs`: usuário, vaga e estado.
-   `applications`: usuário, vaga, estado, datas e notas.
-   `subscriptions`: plano, provedor, estado e período.
-   `usage_events`: tipo de uso, vaga, data e chave de idempotência.
-   `content_drafts`: vagas de origem, canal, texto, slides, fontes,
    estado de revisão e responsável.
-   `notification_preferences`: canais habilitados e consentimento.
-   `audit_events` e `privacy_requests`: auditoria e direitos do
    titular.

## 10. Privacidade e segurança

-   Currículos e dados de candidaturas são privados por padrão.
-   Usuários só acessam seus próprios registros; administradores têm
    permissões restritas e auditáveis.
-   No futuro, aplicar RLS, bucket privado, URLs assinadas, validação de
    arquivo e segredos no servidor.
-   Coletar idade somente se necessária e informada legitimamente;
    preferir faixas agregadas para análises.
-   Permitir acesso, correção, exportação e exclusão conforme política
    aplicável.
-   Informar quando dados de currículo forem enviados a um provedor
    externo de IA.
-   Não usar dados reais em testes locais sem necessidade e autorização.

## 11. Testes e critérios de aceite

### Currículo

-   Pode ser criado manualmente e editado.
-   Toda sugestão é rastreável e revisável.
-   Palavras-chave sem evidência não são declaradas como competência do
    candidato.
-   Comparação antes/depois mostra alterações e motivos.
-   Exportação mantém conteúdo e ordem das seções.

### Curadoria

-   Score é determinístico para entradas iguais no modo de regras.
-   Explicação do score identifica correspondências e lacunas.
-   Vaga sem URL individual válida não pode ser apresentada como anúncio
    específico verificado.
-   Duplicatas não contam como novas oportunidades.
-   Vagas expiradas ou não verificadas são claramente sinalizadas.

### Fluxos e permissões

-   Perfil, currículo, vaga salva e candidatura mantêm consistência
    entre telas.
-   Área editorial não aparece na área do candidato.
-   Usuário não pode acessar dados de outro usuário.
-   Dados demonstrativos são identificados e podem ser restaurados.
-   A interface funciona em telas móveis e desktop e inclui estados
    vazios, carregamento e erro.

## 12. Fases de execução antes das integrações externas

1.  Consolidar repositório e documento mestre.
2.  Definir arquitetura de componentes, domínio, dados e adaptadores.
3.  Construir área do candidato com dados locais.
4.  Implementar motor de currículo e palavras-chave.
5.  Implementar motor de curadoria com catálogo sintético.
6.  Implementar entrega personalizada, vagas salvas e candidaturas.
7.  Construir painel administrativo e métricas demonstrativas.
8.  Implementar planos e limites em modo simulado.
9.  Implementar exportação, acessibilidade, responsividade e testes.
10. Fazer revisão de segurança, fluxos e erros; produzir checklist de
    integração.
11. Somente depois conectar serviços reais e validar em ambiente de
    teste.

## 13. Integrações futuras --- fora da fase atual

-   Banco remoto e autenticação (ex.: Supabase).
-   Provedor de IA server-side.
-   Fontes autorizadas de vagas e agendamento de sincronização.
-   E-mail/WhatsApp com consentimento.
-   Provedor de pagamentos e webhooks.
-   Hospedagem, domínio, logs e monitoramento.

## 14. Definição de pronto

Um módulo só é considerado pronto nesta fase quando: funciona no modo de
demonstração, usa dados claramente identificados, cobre estados de
sucesso/erro/vazio, respeita os contratos de domínio e dados, possui
testes para regras centrais e não exige uma integração externa para
completar o fluxo demonstrado.

------------------------------------------------------------------------

# ADENDO DE CONTINUIDADE --- VERSÃO 3.0

**Data: 17/10/2026**

## 13. Resumo executivo consolidado

O Manda Vaga organiza a candidatura em três etapas: (1) preparar
currículo-base inteligente, flexível e fiel à trajetória real; (2)
buscar, verificar, deduplicar e classificar oportunidades; (3) entregar
vagas personalizadas e acompanhar candidaturas, respostas e entrevistas.

A plataforma não é agência de emprego, não representa contratantes e não
garante entrevistas ou contratação. A aderência é uma estimativa
explicável, não uma previsão de contratação.

## 14. Decisões confirmadas nas conversas

-   Construir e testar tudo o que for possível localmente antes de
    conectar banco remoto, IA externa, fontes de vagas, e-mail,
    pagamentos ou hospedagem.
-   Fluxo oficial: currículo → busca/curadoria → entrega personalizada.
-   Maximizar oportunidades compatíveis sem inventar experiência,
    formação, datas, competências ou resultados.
-   Estratégia equilibrada entre jurídico, administrativo, marketing e
    sistemas digitais.
-   Prioridade geográfica: São Paulo capital primeiro; Guarulhos em
    segundo.
-   Aceitar todas as faixas salariais no piloto.
-   Meta aspiracional de até 500 oportunidades/candidaturas compatíveis.
    A meta não significa que 500 candidaturas já tenham sido enviadas.
-   Primeiro lote-piloto: cinco vagas individuais, reais e verificadas.
-   O usuário tem cadastro na Gupy, mas acredita que o perfil pode estar
    desatualizado. A atualização ainda não foi executada.
-   Não há comprovação de que as cinco candidaturas foram enviadas.
    Preparação, tentativa e envio confirmado devem permanecer estados
    distintos.
-   CAPTCHA, login, testes e confirmações pessoais podem exigir ação do
    candidato.
-   A Central de Respostas futura deverá relacionar mensagens de
    recrutadores à vaga, sugerir respostas editáveis, pedir confirmação
    antes de enviar e registrar respostas/entrevistas. Gmail não está
    conectado nesta fase.

## 15. Estratégia de busca definida

### Grupo 1 --- Direito/jurídico

`Estágio em Direito`, `Direito Trabalhista`, `Direito do Trabalho`,
`CLT`, `Processo do Trabalho`, `Relações de Trabalho`.

### Grupo 2 --- Acompanhamento processual e tribunais

`Acompanhamento Processual`, `Auxiliar Jurídico`,
`Controladoria Jurídica`, `Andamento Processual`, `Controle de Prazos`,
`Tribunais`, `Fóruns`, `Publicações Jurídicas`.

### Grupo 3 --- Cartório

`Estágio em Cartório`, `Auxiliar de Cartório`,
`Serviços Extrajudiciais`, `Registro Civil`, `Notas`,
`Protocolo de Documentos`.

### Grupo 4 --- Administrativo e operações

`Assistente Jurídico`, `Assistente Administrativo Jurídico`,
`Gestão Documental`, `Contratos`, `Legal Operations`, `Legal Ops`.

### Grupo 5 --- Marketing jurídico

`Marketing Jurídico`, `Comunicação Jurídica`, `Conteúdo Jurídico`,
`Assistente de Marketing`, `CRM`, `Relacionamento com Clientes`.

### Grupo 6 --- Digital, sistemas e IA

`Sistemas Jurídicos`, `Produtos Digitais`, `Tecnologia Jurídica`,
`LegalTech`, `Inteligência Artificial`, `Ferramentas Digitais`.

Pesquisar termos exatos, variações de títulos e palavras usadas nos
requisitos dos anúncios. Priorizar publicações recentes e links
individuais. Deduplicar anúncios. Páginas gerais de pesquisa não contam
como links individuais de vaga.

## 16. Perfil de teste --- fatos e limites

O protótipo foi testado com o perfil real do usuário. Os documentos em
`03_testes_curriculo/` contêm dados pessoais e devem ser tratados como
privados.

Fatos informados: - Prioridade geográfica: São Paulo capital;
secundária: Guarulhos/SP. - Graduação em Direito iniciada em 2026,
primeiro semestre, Faculdade CTA, curso de 10 semestres, modalidade
híbrida, unidade Ipiranga. - Disponibilidade informada: manhã e tarde. -
Curso de Marketing Jurídico --- OAB São Paulo, em andamento. -
Experiência em Ampliação Projetos Digitais (2022--atual), Saber Ensinar
Educação Criativa (2017--atual), programa estadual/CDHU (2010--2018) e
atendimento/vendas internas em escola de fotografia (2008). - O usuário
está desenvolvendo um sistema de acompanhamento processual. - O usuário
esclareceu que ainda não trabalha profissionalmente com automações de
IA.

Não presumir experiência como advogado, inscrição na OAB, proficiência
técnica avançada, atuação prática em sistemas de tribunais, stack de
desenvolvimento, resultados numéricos ou ano de conclusão. Quando
necessário, confirmar o nome exato do curso OAB-SP e o estágio real do
sistema processual.

## 17. Estratégia para candidaturas em lote

1.  Encontrar cinco vagas individuais e verificar status, link,
    localidade, modalidade e requisitos.
2.  Checar compatibilidade, inclusive semestre exigido para estágio.
3.  Adaptar currículo com fatos confirmados.
4.  Registrar vaga selecionada e preparação.
5.  Submeter somente por fluxo autorizado; orientar o usuário se não
    houver interação externa disponível.
6.  Registrar "envio tentado --- sem confirmação" quando não houver
    prova de sucesso.
7.  Só registrar "candidatura enviada --- confirmada" depois de
    confirmação real ou protocolo.
8.  Expandir o volume depois de testar o piloto.

## 18. Interface entregue --- Painel v5

Arquivo: `02_interface/index.html`.

Telas: visão geral; perfil e currículo; oportunidades; painel de
candidaturas; fluxo de envio.

Recursos: perfil editável; currículo mestre em texto; download do
currículo; cadastro manual de oportunidades; filtros por palavra-chave,
localidade e verificação; personalização inicial por vaga; painel de
candidaturas; campos de próxima ação, evidência/protocolo e observações;
exportação CSV; persistência em `localStorage`.

Limitações: não pesquisa portais automaticamente, não usa IA externa,
não faz login, não envia candidaturas, não sincroniza entre
dispositivos. A personalização atual é baseada em correspondência
textual e precisa de revisão humana. Os dados ficam no navegador local.

## 19. Modelo de estados da candidatura

`Vaga encontrada` → `Em verificação` → `Selecionada` →
`Preparando currículo` → `Pronta para revisão` →
`Aguardando ação do candidato` → `Envio tentado — sem confirmação` →
`Candidatura enviada — confirmada` → `Aguardando resposta` →
`Resposta recebida` → `Entrevista agendada` → `Processo encerrado`.

Estados alternativos: `Vaga expirada/indisponível` e `Descartada`. Não
contar duplicatas como oportunidades únicas. Guardar data, link, versão
do currículo, evidência, observações e próxima ação.

## 20. Central de Respostas --- fase futura

-   Integração de e-mail somente após autorização e conexão explícitas.
-   Relacionar mensagem com candidato, vaga e candidatura.
-   Sugerir rascunho de resposta contextualizado.
-   Permitir editar e exigir confirmação antes do envio.
-   Registrar estado, data e resposta.
-   Identificar convite para entrevista e permitir registrar data, hora
    e local/link.
-   Nunca declarar mensagem enviada/recebida sem confirmação do
    conector.

## 21. Estrutura de documentação e conteúdo audiovisual

Para cada módulo do produto, documentar: objetivo/contexto; ator;
entradas; regras de processamento; saídas; fluxo principal; estados
alternativos e erros; dependências; critérios de aceite;
métricas/auditoria; riscos e próximos passos.

Quando houver roteiro ou transcrição de vídeo do produto, preservar o
conteúdo-fonte e organizar os materiais em: 1. **Ficha estratégica:**
objetivo, público, plataforma, formato, duração, promessa, ângulo,
mensagem e CTA. 2. **Roteiro literário:** narrativa integral,
compreensível e falável. 3. **Roteiro de gravação:** cenas, ações,
falas, cenário, personagens, objetos e material necessário. 4. **Roteiro
técnico:** enquadramentos, movimentos, áudio, luz e especificações de
captação. 5. **Roteiro de edição:** ordem, cortes, legendas, ritmo,
B-roll, áudio e finalização.

**Proveniência:** entre os arquivos disponíveis para esta transferência
não foi identificado com segurança um arquivo independente contendo a
transcrição específica do vídeo mencionado. O PRD anterior foi
preservado e esta estrutura foi registrada como padrão operacional, sem
inventar ou atribuir frases a uma transcrição ausente. Se o
texto/transcrição for anexado no próximo chat, incorporá-lo mantendo
terminologia e ordem originais.

## 22. Critérios de aceite adicionais

-   Cada vaga específica possui link individual, fonte, data da consulta
    e status.
-   A contagem de oportunidades considera vagas únicas, não buscas
    repetidas.
-   Requisitos obrigatórios não atendidos ficam explícitos.
-   Currículo direcionado não contém fatos não confirmados.
-   Preparar candidatura não muda status para enviada.
-   Tentativa sem confirmação não entra no total de envios concluídos.
-   Integrações inativas são apresentadas como indisponíveis, nunca como
    sucesso simulado.
-   Interface funciona em desktop e celular e apresenta estados vazios e
    erros compreensíveis.

## 23. Próximas tarefas para o próximo chat

1.  Ler este adendo e o PRD original antes de sugerir novas decisões.
2.  Abrir e auditar `02_interface/index.html`.
3.  Testar todos os botões, formulários, filtros, persistência e
    exportação; corrigir bugs localmente.
4.  Gerar relatório de QA com passo, resultado esperado, resultado
    observado e correção.
5.  Montar lote de cinco vagas individuais, verificadas e compatíveis.
6.  Não afirmar que a Gupy foi atualizada ou que candidatura foi enviada
    sem execução e confirmação reais.
7.  Só depois desenhar integrações externas.

------------------------------------------------------------------------

# ADENDO 3.1 — QA do painel e lote-piloto

**Data: 17/10/2026**

- Painel atualizado para **v6** (`02_interface/index.html`); v5 preservado como `index_v5_original.html`.
- Defeito crítico corrigido: `persistApps` não existia, então o registro de candidaturas nunca funcionou no v5.
- Implementado no v6: estados do §19; contagem de enviadas por confirmação permanente; deduplicação por URL canônica; modalidade e data da consulta; alteração do estado de verificação na lista; backup/importação/reset; alerta de integridade do resumo; versões de currículo por vaga com termos sustentados e lacunas; migração automática dos dados do v5.
- Correção de integridade: o resumo dizia “mais de 20 anos de experiência”, o que não é sustentado pelas datas (desde 2008). Substituído por “experiência profissional desde 2008”.
- QA: 47/47 passos aprovados (`04_qa_e_piloto/RELATORIO_QA_Painel_v6.md`; script `teste_automatizado_qa_v6.py`).
- Lote-piloto de 5 vagas consultado em 17/10/2026 (`04_qa_e_piloto/MandaVaga_Lote_Piloto_17-10-2026.json`, importável no painel). Estado: **nenhuma candidatura enviada**; Gupy **não** atualizada.
- Pendências do candidato: nível de inglês; uso de Google Analytics/Meta Ads; turno das aulas na CTA.
- Landing page: HTML conforme o PRD, com 3 ajustes menores. A versão em imagem contém prova social sem dado real (“+12 mil pessoas”), faixa de logos que sugere parceria e menu “Depoimentos” sem depoimentos reais. Não publicar assim.

------------------------------------------------------------------------

# ADENDO 3.2 — SaaS funcional em modo demonstração

**Data: 17/10/2026**

- Construído o SaaS completo em modo local-first (`05_saas/MandaVaga_SaaS_local.html`; código-fonte em `05_saas/codigo_fonte/`), cobrindo as fases 3 a 10 do §12.
- Camadas separadas no código: interface (`04_app`, `05_candidate`, `06_admin`), domínio (`02_domain`), repositório com contrato estável (`01_core`, adaptador local) e adaptadores de integração, todos "não conectados".
- Candidato: cadastro/login/recuperação simulada, perfil e preferências, currículo (editor, importação de texto, diagnóstico, sugestões antes/depois, palavras-chave sustentado/confirmar/ausente, famílias de cargo, versões, comparação, exportação TXT/HTML), vagas (aderência explicável por 6 dimensões, filtros, salvar/dispensar, currículo por vaga), candidaturas (14 estados do §19 com prova obrigatória), notificações, plano e consumo idempotente, privacidade (exportar, corrigir, excluir).
- Admin: métricas agregadas com "Não informado", usuários com auditoria, fontes, vagas (cadastro com link individual, deduplicação, verificação, expiração, importação JSON e lote-piloto real), editorial com revisão humana, planos e limites, privacidade e auditoria, pesos da aderência, reset dos cenários demonstrativos.
- Filtros adicionados a pedido: salário, porte da empresa e momento de carreira. Fontes classificadas pelas quatro camadas (agregador/API, ATS, site oficial, consultoria/RH, canal público).
- Testes: 59/59 critérios aprovados (`05_saas/RELATORIO_TESTES_SaaS.md`).

## Próxima fase — descoberta diária de vagas (a pedido do usuário, depois desta etapa)

Objetivo: o banco de vagas se atualiza todo dia, com filtros por categoria, tipo, cidade, nível, salário, momento de carreira e porte da empresa. Referências do usuário em `01_documentacao/estrategia_descoberta_vagas/`.

1. Cadastro de empregadores e canais (CNPJ, setor, porte, cidade, site, URL de carreiras, ATS usado).
2. Conectores por camada, priorizando os que permitem leitura automatizada: APIs de agregadores (ex.: Adzuna), quadros públicos de ATS (Greenhouse, Lever, Ashby, SmartRecruiters), páginas "Trabalhe Conosco" com acesso permitido (robots.txt e termos), canais públicos (CIEE, Emprega Brasil).
3. Robô agendado diário no servidor: busca, normaliza, deduplica (URL canônica, ID da fonte, similaridade), marca encerradas e registra data de verificação.
4. Respeitar termos de uso de cada fonte; nada de raspagem onde for proibido; candidatura sempre pelo canal original, com confirmação do candidato.
