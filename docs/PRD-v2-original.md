# PRD Mestre — Manda Vaga
**Versão 2.0 · 17/10/2026 · Documento mestre de produto e desenvolvimento**

## 1. Objetivo deste documento
Este é o documento oficial de referência para projetar, construir e testar o Manda Vaga antes de conectar serviços externos. Ele consolida a visão do produto, os fluxos, os módulos, os critérios de aceite e a estratégia de substituição de dados simulados por serviços reais.

**Regra de desenvolvimento:** primeiro construir e validar localmente tudo o que for possível; depois conectar banco remoto, IA externa, fontes reais de vagas, notificações, pagamentos e hospedagem. Nenhum protótipo deve ser tratado como integração real.

## 2. Visão e posicionamento
O Manda Vaga ajuda candidatos a preparar melhor seus currículos para mecanismos de recrutamento, identificar oportunidades compatíveis e receber uma curadoria personalizada dentro da plataforma.

### Promessa central
**Primeiro melhoramos e estruturamos seu currículo; depois buscamos vagas compatíveis com seu perfil e entregamos essas oportunidades para você.**

O Manda Vaga não é agência de emprego, não representa empresas contratantes e não garante que um currículo será encontrado, entrevista ou contratação. A plataforma melhora a clareza, a organização e a correspondência do currículo com requisitos relevantes, sem inventar qualificações.

## 3. Fluxo principal oficial: três etapas

### Etapa 1 — Preparar um currículo inteligente e flexível
É o primeiro serviço e a principal prioridade do produto.
- Receber currículo por arquivo ou preenchimento manual.
- Extrair/organizar experiências, formação, competências, certificações e resultados informados pelo candidato.
- Diagnosticar clareza, estrutura, legibilidade, lacunas e consistência.
- Identificar palavras-chave relevantes que já sejam sustentadas pela experiência real do candidato.
- Identificar competências transferíveis e famílias de cargos plausíveis, sem transformar o currículo em algo genérico nem declarar competências inexistentes.
- Produzir currículo-base flexível, organizado e legível por sistemas de recrutamento.
- Mostrar comparação antes/depois, explicando cada alteração e permitindo revisão do candidato.
- Permitir edição manual, histórico de versões e exportação em formatos adequados.
- Solicitar confirmação quando houver dados ausentes, contraditórios ou ambíguos.

**Resultado:** currículo-base claro, estruturado e versátil para oportunidades compatíveis com a trajetória real do candidato.

### Etapa 2 — Buscar e selecionar vagas compatíveis
- Usar o perfil profissional estruturado e o currículo-base como base da busca.
- Considerar competências, experiências, formação, cargos-alvo, localização, modalidade, faixa salarial opcional e preferências.
- Normalizar informações das vagas: cargo, empresa, local, modalidade, requisitos, palavras-chave, fonte, URL individual, data de publicação/consulta e status.
- Calcular uma pontuação explicável de aderência, sem prometer previsão de contratação.
- Explicar requisitos correspondentes, pontos fortes e lacunas identificadas.
- Deduplicar anúncios e marcar vagas expiradas ou não verificadas.
- Priorizar vagas recentes e fontes permitidas/autorizadas.

**Resultado:** uma curadoria de oportunidades relevantes, ordenadas por compatibilidade e qualidade dos dados.

### Etapa 3 — Entregar as vagas ao candidato
- Mostrar as oportunidades na área pessoal do usuário.
- Exibir motivo da recomendação, data da última verificação, localidade, modalidade, requisitos e link direto para a vaga individual.
- Permitir salvar, dispensar e acompanhar vagas.
- Notificar o usuário conforme preferências e consentimentos configurados.
- Permitir que o candidato decida se quer se candidatar.
- Oferecer, quando útil, uma versão do currículo adaptada à vaga específica, sem alterar fatos nem criar competências.
- Registrar histórico e status de candidatura quando o usuário informar.

**Resultado:** vagas entregues de forma organizada, com controle da decisão nas mãos do candidato.

## 4. Público-alvo
- Pessoas em busca do primeiro emprego, incluindo estágio e jovem aprendiz.
- Profissionais em recolocação.
- Pessoas em transição de carreira.
- Trabalhadores experientes que precisam melhorar a apresentação do currículo.
- Usuários com pouca familiaridade digital, que precisam de linguagem simples e passos guiados.

## 5. Princípios de produto
1. Currículo primeiro; curadoria de vagas depois; entrega personalizada por último.
2. Toda alteração sugerida deve ser explicável e revisável.
3. Não inventar experiência, diploma, datas, resultados, certificações ou competências.
4. Mostrar fontes e links individuais para os anúncios; não apresentar links genéricos como se fossem anúncios específicos.
5. Distinguir dados simulados, dados reais e dados desatualizados.
6. Nenhuma candidatura, publicação ou mensagem externa deve ser enviada sem autorização adequada.
7. Privacidade e segurança desde o desenho.
8. Interfaces de integração devem permitir substituir adaptadores simulados por adaptadores reais sem reescrever as regras de negócio.

## 6. Módulos e requisitos funcionais

### 6.1 Landing page pública
- Apresentar o problema e a proposta de valor com estrutura StoryBrand.
- Destacar a melhoria do currículo como serviço principal.
- Explicar o fluxo de três etapas.
- Ter CTA claro para começar.
- Mostrar marcas de plataformas de recrutamento somente para fins informativos, sem sugerir parceria ou endosso.
- Mostrar vagas apenas com URL individual e status/data verificáveis quando forem apresentadas como reais.
- Exibir aviso de independência e ausência de garantia de contratação.
- Ser responsiva, acessível e otimizada para carregamento.

### 6.2 Cadastro, autenticação e perfil
- Cadastro, login, logout, recuperação de senha e edição de perfil.
- Campos: nome, cidade/UF, cargos-alvo, experiências, formação, competências, modalidade, preferências e salário opcional.
- Consentimentos separados para comunicações opcionais.
- No modo local, usar perfis de demonstração claramente identificados.

### 6.3 Gestão e análise de currículo
- Upload planejado de PDF/DOCX/TXT e opção de preenchimento manual.
- Validação de formato e tamanho.
- Representação interna estruturada do currículo.
- Análise de seções, clareza, consistência, palavras-chave, competências e lacunas.
- Recomendações com explicação antes/depois.
- Edição e versões com histórico.
- Exportação inicial para HTML/TXT e, conforme a implementação, PDF/DOCX.
- Separar fatos declarados pelo candidato de sugestões editoriais.

### 6.4 Motor de palavras-chave e flexibilidade
- Extrair termos do currículo e de descrições de vagas.
- Agrupar palavras-chave por competências, ferramentas, tarefas, área e cargo.
- Marcar cada termo como sustentado, precisa de confirmação ou ausente.
- Só incluir termos sustentados por informações do candidato; termos ausentes podem aparecer como lacunas de desenvolvimento, não como qualificações declaradas.
- Recomendar famílias de cargos compatíveis com evidências do currículo.
- Evitar excesso de palavras-chave e repetição artificial.
- Produzir uma versão-base ampla, mas coerente, e permitir versões específicas por oportunidade.

### 6.5 Motor de curadoria e aderência
- Filtrar por cargo, competências, nível, localização, modalidade e preferências.
- Calcular score explicável por dimensões configuráveis.
- Mostrar pontos correspondentes e lacunas; não apresentar score como probabilidade de contratação.
- Dar prioridade a anúncios com fonte e URL individual, data de publicação e verificação recente.
- Deduplicar por URL canônica, identificador da fonte e similaridade.
- Desativar ou sinalizar oportunidades vencidas, removidas ou sem validação recente.
- No modo de demonstração, usar conjunto sintético claramente rotulado.

### 6.6 Área do candidato
- Resumo do currículo e estado de conclusão.
- Vagas recomendadas e justificativa de compatibilidade.
- Vagas salvas, dispensadas e candidaturas acompanhadas.
- Versões de currículo por vaga.
- Histórico de atividade e consumo do plano.
- Preferências de notificação e privacidade.

### 6.7 Candidaturas
Estados iniciais: salva, preparando candidatura, candidatura realizada pelo usuário, aguardando resposta, entrevista, encerrada/recusada e vaga indisponível.
- Permitir atualização manual de status e notas.
- Abrir o anúncio original em nova aba.
- Não automatizar candidaturas no MVP.

### 6.8 Painel administrativo
- Dashboard com usuários totais, novos usuários, usuários ativos, conversão e uso.
- Distribuição agregada por cidade/UF, faixa etária quando legitimamente fornecida, área profissional e origem de aquisição.
- Exibir também dados ausentes; não inferir idade ou características sensíveis.
- Busca e gestão de usuários com controles de acesso.
- Gestão de empresas/fontes, vagas, status, datas de checagem e URLs individuais.
- Área editorial para selecionar vagas verificadas, criar pautas, carrosséis e rascunhos; revisão humana antes de publicação.
- Gestão de planos, limites, eventos de uso e solicitações de privacidade.
- Dados simulados devem estar marcados como demonstração e nunca misturados silenciosamente aos dados reais.

### 6.9 Planos e limites
Planos propostos já discutidos:
- Inicial: R$ 19,90/mês — até 100 oportunidades únicas/mês.
- Plus: R$ 29,90/mês — até 200 oportunidades únicas/mês.
- Max: R$ 39,90/mês — até 500 oportunidades únicas/mês.

A unidade de consumo e a definição de oportunidade única precisam ser aplicadas consistentemente. Não contar duplicatas como novas oportunidades. No modo local, simular mudança de plano, limites e consumo; pagamentos reais só após selecionar e integrar um provedor.

### 6.10 Conteúdo editorial (somente administração)
- Ferramenta interna para transformar vagas selecionadas em pautas e rascunhos de conteúdo.
- Não mostrar ferramentas editoriais no painel do candidato.
- Guardar a fonte, URL individual, data de verificação e notas de revisão.
- Não copiar integralmente anúncios protegidos; resumir com atribuição e link.
- Exigir revisão humana antes de publicar.

## 7. Arquitetura de desenvolvimento local-first

### Camadas
- **Interface:** componentes e páginas sem regras de negócio críticas embutidas.
- **Domínio:** regras de currículo, palavras-chave, aderência, curadoria, limites e estados.
- **Repositórios de dados:** contratos estáveis para perfis, currículos, vagas, candidaturas e planos.
- **Adaptadores:** armazenamento local simulado, futuro Supabase, futuro provedor de IA, fontes de vagas, notificações e pagamentos.
- **Testes:** unitários para regras, testes de fluxo e testes de interface.

### Regra de substituição
Criar contratos/interfaces antes de integrar serviços. A implementação de demonstração deve respeitar os mesmos contratos do serviço futuro. A substituição real deve exigir configuração e adaptadores, não reescrever telas e regras centrais.

### Stack proposta
Frontend React + TypeScript + Vite para a aplicação modular. HTML estático pode ser mantido para protótipos e landing page, mas não deve virar a arquitetura inteira do produto sem avaliação. Futuro backend/banco pode usar Supabase; hospedagem Vercel ou Hostinger conforme requisitos finais. Segredos só no servidor.

## 8. Modo de demonstração
- Usar dados sintéticos, com rótulos visíveis como “Dados demonstrativos”.
- Simular cadastro, persistência local, análise, curadoria, candidaturas e planos.
- Fornecer perfis e currículos de teste diversos, sem usar dados pessoais reais.
- Criar cenários positivos, negativos, incompletos, duplicados e expirados.
- Permitir reset de dados de demonstração.
- Não afirmar que uma vaga fictícia está aberta ou que uma IA externa foi executada.
- Exibir mensagens de indisponibilidade quando uma operação exigir integração ainda não conectada.

## 9. Modelo de dados conceitual
- `profiles`: usuário, localização, cargos-alvo, preferências e consentimentos.
- `resumes`: currículo original, texto extraído, estado e metadados.
- `resume_versions`: conteúdo estruturado, tipo de versão, vaga-alvo opcional, alterações e data.
- `resume_keyword_evidence`: termo, origem, evidência do currículo e estado de confirmação.
- `job_sources`: nome, tipo, URL, autorização/termos, limites e última sincronização.
- `jobs`: fonte, identificador externo, URL canônica individual, empresa, cargo, local, modalidade, requisitos, datas e status.
- `job_matches`: usuário, vaga, score, dimensões e explicação.
- `saved_jobs`: usuário, vaga e estado.
- `applications`: usuário, vaga, estado, datas e notas.
- `subscriptions`: plano, provedor, estado e período.
- `usage_events`: tipo de uso, vaga, data e chave de idempotência.
- `content_drafts`: vagas de origem, canal, texto, slides, fontes, estado de revisão e responsável.
- `notification_preferences`: canais habilitados e consentimento.
- `audit_events` e `privacy_requests`: auditoria e direitos do titular.

## 10. Privacidade e segurança
- Currículos e dados de candidaturas são privados por padrão.
- Usuários só acessam seus próprios registros; administradores têm permissões restritas e auditáveis.
- No futuro, aplicar RLS, bucket privado, URLs assinadas, validação de arquivo e segredos no servidor.
- Coletar idade somente se necessária e informada legitimamente; preferir faixas agregadas para análises.
- Permitir acesso, correção, exportação e exclusão conforme política aplicável.
- Informar quando dados de currículo forem enviados a um provedor externo de IA.
- Não usar dados reais em testes locais sem necessidade e autorização.

## 11. Testes e critérios de aceite
### Currículo
- Pode ser criado manualmente e editado.
- Toda sugestão é rastreável e revisável.
- Palavras-chave sem evidência não são declaradas como competência do candidato.
- Comparação antes/depois mostra alterações e motivos.
- Exportação mantém conteúdo e ordem das seções.

### Curadoria
- Score é determinístico para entradas iguais no modo de regras.
- Explicação do score identifica correspondências e lacunas.
- Vaga sem URL individual válida não pode ser apresentada como anúncio específico verificado.
- Duplicatas não contam como novas oportunidades.
- Vagas expiradas ou não verificadas são claramente sinalizadas.

### Fluxos e permissões
- Perfil, currículo, vaga salva e candidatura mantêm consistência entre telas.
- Área editorial não aparece na área do candidato.
- Usuário não pode acessar dados de outro usuário.
- Dados demonstrativos são identificados e podem ser restaurados.
- A interface funciona em telas móveis e desktop e inclui estados vazios, carregamento e erro.

## 12. Fases de execução antes das integrações externas
1. Consolidar repositório e documento mestre.
2. Definir arquitetura de componentes, domínio, dados e adaptadores.
3. Construir área do candidato com dados locais.
4. Implementar motor de currículo e palavras-chave.
5. Implementar motor de curadoria com catálogo sintético.
6. Implementar entrega personalizada, vagas salvas e candidaturas.
7. Construir painel administrativo e métricas demonstrativas.
8. Implementar planos e limites em modo simulado.
9. Implementar exportação, acessibilidade, responsividade e testes.
10. Fazer revisão de segurança, fluxos e erros; produzir checklist de integração.
11. Somente depois conectar serviços reais e validar em ambiente de teste.

## 13. Integrações futuras — fora da fase atual
- Banco remoto e autenticação (ex.: Supabase).
- Provedor de IA server-side.
- Fontes autorizadas de vagas e agendamento de sincronização.
- E-mail/WhatsApp com consentimento.
- Provedor de pagamentos e webhooks.
- Hospedagem, domínio, logs e monitoramento.

## 14. Definição de pronto
Um módulo só é considerado pronto nesta fase quando: funciona no modo de demonstração, usa dados claramente identificados, cobre estados de sucesso/erro/vazio, respeita os contratos de domínio e dados, possui testes para regras centrais e não exige uma integração externa para completar o fluxo demonstrado.
