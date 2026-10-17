# Manda Vaga — testes ponta a ponta

**Resultado:** 63 de 63 critérios aprovados (Chromium; desktop, celular 390 px, tema escuro, armazenamento bloqueado).

Rodar: `cd app && python3 build.py && python3 ../tests/e2e.py`

| ID | Critério | OK |
|---|---|---|
| AUTH-1 | Cadastro sem aceitar termos é bloqueado | ✅ |
| AUTH-2 | Cadastro com termos cria conta, plano Inicial e entra | ✅ |
| FLOW-1 | Vagas bloqueadas antes do currículo (currículo primeiro) | ✅ |
| RES-1 | Importação mostra prévia para conferência antes de aplicar | ✅ |
| RES-2 | Texto importado vira currículo estruturado | ✅ |
| RES-3 | Versão criada no histórico | ✅ |
| RES-4 | Editar manualmente e salvar cria nova versão | ✅ |
| RES-5 | Diagnóstico detecta “mais de 15 anos” sem datas que sustentem | ✅ |
| RES-6 | Não deixa marcar revisado com afirmação sem evidência | ✅ |
| RES-7 | Aceitar sugestão aplica antes/depois e registra versão | ✅ |
| RES-8 | Marca revisado depois da correção | ✅ |
| KW-1 | Termo presente em experiência = sustentado | ✅ |
| KW-2 | Termo sem evidência = ausente (não vira competência) | ✅ |
| KW-3 | Declarar sem descrever onde usou = precisa de confirmação | ✅ |
| KW-4 | Com evidência e confirmação = sustentado e entra no currículo | ✅ |
| RES-9 | Exportação mantém conteúdo e ordem das seções | ✅ |
| RES-10 | Comparar versão mostra diferenças | ✅ |
| CUR-1 | Pontuação determinística para entradas iguais | ✅ |
| CUR-2 | Recomendadas excluem expiradas, não verificadas e duplicatas | ✅ |
| CUR-3 | Duplicata do catálogo foi detectada | ✅ |
| CUR-4 | Explicação mostra combinações, lacunas e bloqueio por semestre | ✅ |
| PLAN-1 | Rever as mesmas vagas não consome o plano de novo (idempotente) | ✅ |
| CUR-5 | Dispensar remove das recomendadas e aparece em Dispensadas | ✅ |
| CUR-6 | Salvar vaga | ✅ |
| FILT-1 | Filtro por salário funciona | ✅ |
| FILT-2 | Filtro por momento de carreira mostra só estágios | ✅ |
| TAIL-1 | Currículo para a vaga não cria competência nem experiência | ✅ |
| TAIL-2 | Alterações do currículo direcionado são explicadas | ✅ |
| APP-1 | Registrar candidatura não marca como enviada | ✅ |
| APP-2 | Marcar enviada sem confirmação e evidência é bloqueado | ✅ |
| APP-3 | Com confirmação + evidência vira enviada confirmada | ✅ |
| APP-4 | Avançar o status mantém a contagem de enviadas | ✅ |
| DASH-1 | Dashboard abre com o assistente e a pergunta do próximo passo | ✅ |
| DASH-2 | “Ampliar a lista” reduz a aderência mínima e explica | ✅ |
| DASH-3 | Desfazer restaura a aderência mínima | ✅ |
| DASH-4 | Pergunta livre mostra vagas dentro da conversa | ✅ |
| APP-5 | Entrevista exige data | ✅ |
| APP-6 | Entrevista registrada com data, hora e local; histórico guardado | ✅ |
| PLAN-2 | Troca de plano simulada | ✅ |
| PERM-1 | Candidato não acessa área administrativa | ✅ |
| PERM-2 | Candidato só vê as próprias candidaturas | ✅ |
| PRIV-1 | Exportação de dados do titular sem hash de senha | ✅ |
| ADM-1 | Abrir usuário gera auditoria e não mostra currículo | ✅ |
| ADM-2 | Importa lote-piloto real e não duplica na segunda vez | ✅ |
| ADM-3 | Vagas reais têm link individual e data de verificação | ✅ |
| ADM-4 | Link de página de busca não é aceito como anúncio individual | ✅ |
| ADM-5 | Mesmo anúncio com parâmetros diferentes é recusado como duplicata | ✅ |
| ADM-6 | Vaga nova válida é cadastrada | ✅ |
| ADM-7 | Expirar vaga marca candidatura não enviada como expirada e notifica | ✅ |
| ED-1 | Rejeitar exige nota de revisão | ✅ |
| ED-2 | Fluxo editorial: revisão humana → aprovado → publicado manualmente, com fonte e data | ✅ |
| ADM-8 | Pesos configuráveis alteram a pontuação | ✅ |
| INT-1 | Integração não conectada aparece como indisponível, nunca como sucesso | ✅ |
| PLAN-3 | Limite do plano bloqueia entregas além do contratado | ✅ |
| PRIV-2 | Excluir conta exige digitar EXCLUIR | ✅ |
| PRIV-3 | Conta e dados do titular apagados; pedido registrado | ✅ |
| ERR-0 | Nenhum erro de JavaScript no fluxo todo | ✅ |
| DB-1 | Dados persistem após recarregar | ✅ |
| MOB-1 | Celular 390px: nenhuma página com rolagem horizontal | ✅ |
| MOB-2 | Celular: menu abre e fecha | ✅ |
| MOB-3 | Celular: sem erros | ✅ |
| THEME-1 | Tema escuro aplica fundo escuro | ✅ |
| STO-1 | Armazenamento bloqueado: app funciona e avisa | ✅ |
