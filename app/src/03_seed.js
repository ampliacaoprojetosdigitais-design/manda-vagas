/* =====================================================================
   DADOS DEMONSTRATIVOS — sintéticos e rotulados. Nenhuma pessoa real.
   Empresas fictícias, sem link de anúncio: não podem ser apresentadas
   como vagas abertas.
   ===================================================================== */
const DEMO_PASSWORD = "demo1234";

const DEMO_JOBS = [
  // título, empresa, cidade, uf, modalidade, nível, família, dias desde publicação, requisitos, desejáveis, extras
  ["Estágio em Direito Trabalhista", "Andrade & Lemos Advogados", "São Paulo", "SP", "Híbrido", "Estágio", "juridico", 2, ["Cursando Direito", "Pacote Office, especialmente Excel", "Organização de prazos"], ["Interesse em Direito do Trabalho", "Pesquisa de jurisprudência"], { minSemester: 1, description: "Apoio à equipe trabalhista: análise de reclamações trabalhistas, pauta de audiências, relatórios e pesquisa de jurisprudência." }],
  ["Estágio Jurídico — Contencioso Cível", "Ribeiro Fontes Sociedade de Advogados", "São Paulo", "SP", "Presencial", "Estágio", "juridico", 5, ["Cursando Direito a partir do 4º semestre", "Word e Excel"], ["Experiência com petições"], { minSemester: 4, description: "Elaboração de minutas, acompanhamento processual e protocolo em tribunais." }],
  ["Auxiliar de Controladoria Jurídica", "Grupo Vértice Serviços Jurídicos", "São Paulo", "SP", "Presencial", "Assistente/Auxiliar", "processual", 3, ["Controle de prazos", "Excel intermediário", "Organização"], ["Software jurídico (CPJ ou Projuris)", "Publicações e intimações"], { description: "Cadastro de processos, captura de publicações, controle de prazos e relatórios para os advogados." }],
  ["Assistente de Acompanhamento Processual", "Moraes Prado Advocacia", "Guarulhos", "SP", "Presencial", "Assistente/Auxiliar", "processual", 6, ["Acompanhamento processual", "Atendimento a clientes", "Excel"], ["PJe e e-SAJ"], { description: "Consulta de andamentos processuais, atualização de planilhas e retorno a clientes." }],
  ["Estágio em Cartório de Registro Civil", "Cartório do 9º Subdistrito (fictício)", "São Paulo", "SP", "Presencial", "Estágio", "cartorio", 9, ["Cursando Direito", "Atendimento ao público"], ["Protocolo de documentos"], { minSemester: 1, description: "Atendimento ao público, conferência de documentos, protocolo e apoio em registro civil." }],
  ["Auxiliar de Cartório — Notas", "Tabelionato Horizonte (fictício)", "Guarulhos", "SP", "Presencial", "Assistente/Auxiliar", "cartorio", 12, ["Atendimento ao público", "Organização de documentos"], ["Escrituras", "Cadastros"], { description: "Recepção de clientes, conferência e arquivamento de documentos de notas." }],
  ["Assistente Administrativo Jurídico", "Lume Legal Operations", "São Paulo", "SP", "Híbrido", "Assistente/Auxiliar", "adm", 1, ["Gestão documental", "Contratos", "Planilhas e controles"], ["Legal Ops", "Google Workspace"], { description: "Organização de contratos, gestão documental, controle de assinaturas e relatórios de indicadores." }],
  ["Analista Júnior de Legal Operations", "Lume Legal Operations", "São Paulo", "SP", "Remoto", "Júnior", "adm", 4, ["Gestão de projetos", "Excel", "Indicadores"], ["Scrum", "Software jurídico"], { description: "Mapeamento de processos do jurídico, indicadores, implantação de ferramentas." }],
  ["Assistente de Marketing Jurídico", "Castro & Viana Advogados", "São Paulo", "SP", "Híbrido", "Assistente/Auxiliar", "mkt", 2, ["Redação e comunicação", "Redes sociais", "Conhecimento do Provimento 205 da OAB"], ["Canva ou Photoshop", "Google Analytics"], { description: "Produção de conteúdo jurídico, calendário editorial, newsletter e relatórios de desempenho." }],
  ["Analista de Comunicação Jurídica", "Instituto Paulista de Advocacia (fictício)", "São Paulo", "SP", "Presencial", "Júnior", "mkt", 18, ["Comunicação e conteúdo", "Relacionamento com associados", "Eventos"], ["CRM", "Meta Ads"], { description: "Comunicação com associados, eventos e conteúdo institucional." }],
  ["Assistente de CRM e Relacionamento", "Nexo Jurídico Digital", "São Paulo", "SP", "Remoto", "Assistente/Auxiliar", "mkt", 7, ["CRM", "Relacionamento com clientes", "Atendimento"], ["Funil de vendas"], { description: "Gestão da base de clientes, réguas de relacionamento e atendimento consultivo." }],
  ["Analista de Produtos Digitais — LegalTech", "Nexo Jurídico Digital", "São Paulo", "SP", "Remoto", "Júnior", "digital", 3, ["Produtos digitais", "Gestão de projetos", "Métodos ágeis (Scrum)"], ["Ferramentas de IA", "Prototipagem"], { description: "Discovery com escritórios clientes, prototipagem e acompanhamento de entregas." }],
  ["Assistente de Implantação de Sistemas Jurídicos", "Juris Fácil Software (fictício)", "Guarulhos", "SP", "Híbrido", "Assistente/Auxiliar", "digital", 10, ["Atendimento a clientes", "Treinamentos", "Software jurídico"], ["Excel"], { description: "Implantação do software em escritórios, treinamento de usuários e suporte." }],
  ["Estágio em Tecnologia Jurídica", "Oliveira Tech Law (fictício)", "São Paulo", "SP", "Híbrido", "Estágio", "digital", 6, ["Cursando Direito", "Interesse em tecnologia"], ["Automação", "LGPD"], { minSemester: 2, description: "Mapeamento de fluxos, automações simples e documentação de processos." }],
  ["Jovem Aprendiz Administrativo — Jurídico", "Seguradora Atlântico (fictício)", "São Paulo", "SP", "Presencial", "Jovem aprendiz", "adm", 8, ["Ensino médio em curso ou concluído", "Pacote Office básico"], [], { description: "Apoio administrativo ao departamento jurídico: arquivos, cadastros e protocolo." }],
  ["Recepcionista de Escritório de Advocacia", "Barros Leme Advogados", "São Paulo", "SP", "Presencial", "Assistente/Auxiliar", "atendimento", 11, ["Atendimento ao público", "Agenda", "Cadastros"], ["Inglês básico"], { description: "Recepção de clientes, agenda dos advogados e controle de correspondências." }],
  ["Assistente Jurídico Pleno — Contratos", "Ribeiro Fontes Sociedade de Advogados", "São Paulo", "SP", "Híbrido", "Pleno", "adm", 14, ["Experiência mínima de 3 anos em contratos", "Inglês avançado"], ["Legal Ops"], { description: "Gestão do ciclo de contratos e interface com áreas de negócio." }],
  ["Estágio em Direito Tributário", "Fisco Consultoria (fictício)", "Osasco", "SP", "Presencial", "Estágio", "juridico", 20, ["Cursando Direito a partir do 5º semestre", "Excel"], [], { minSemester: 5, description: "Pesquisa de legislação tributária e acompanhamento de processos administrativos." }],
  ["Assistente de Atendimento Jurídico", "Defenda Já Serviços (fictício)", "Campinas", "SP", "Presencial", "Assistente/Auxiliar", "atendimento", 4, ["Atendimento a clientes", "Cadastros"], [], { description: "Triagem de casos, atendimento telefônico e cadastro de clientes." }],
  ["Analista de Marketing — Escritório Boutique", "Castro & Viana Advogados", "Rio de Janeiro", "RJ", "Presencial", "Júnior", "mkt", 5, ["Comunicação", "Redes sociais"], [], { description: "Conteúdo e eventos para o escritório no Rio." }],
  // cenários: expirada, não verificada, duplicata, antiga
  ["Estágio em Direito Trabalhista", "Andrade & Lemos Advogados", "São Paulo", "SP", "Híbrido", "Estágio", "juridico", 2, ["Cursando Direito"], [], { scenario: "duplicata", description: "Mesmo anúncio publicado de novo pela empresa." }],
  ["Auxiliar de Protocolo Judicial", "Grupo Vértice Serviços Jurídicos", "São Paulo", "SP", "Presencial", "Assistente/Auxiliar", "processual", 45, ["Protocolo", "Tribunais e fóruns"], [], { scenario: "expirada", deadlineDaysAgo: 5, description: "Prazo de inscrição encerrado." }],
  ["Assistente de Gestão Documental", "Arquivo Seguro (fictício)", "Guarulhos", "SP", "Presencial", "Assistente/Auxiliar", "adm", 3, ["Gestão documental", "Organização"], ["Cadastros"], { scenario: "nao_verificada", description: "Anúncio ainda não conferido pela equipe." }],
  ["Assistente de Conteúdo Jurídico", "Pauta Legal Mídia (fictício)", "São Paulo", "SP", "Remoto", "Assistente/Auxiliar", "mkt", 38, ["Redação", "Conteúdo"], ["WordPress"], { scenario: "antiga", checkedDaysAgo: 30, description: "Verificação desatualizada." }],
];

const PILOT_REAL_JOBS = [
  { title: "Estágio Jurídico Trabalhista", company: "SulAmérica", city: "São Paulo", uf: "SP", modality: "Híbrido", level: "Estágio", family: "juridico", url: "https://www.vagas.com.br/vagas/v2836402/estagio-juridico-trabalhista", publishedAt: "2026-09-23", requirements: ["Cursando Direito", "Excel intermediário"], niceToHave: [], description: "Análise de novas ações, pauta de audiências, relatórios de sistema e de escritórios externos, pesquisa de jurisprudência trabalhista. Av. Paulista, 3 dias presencial e 2 remoto.", source: "Vagas.com", companySize: "Grande (250+)" },
  { title: "Estágio Jurídico – Contencioso e Regulatório", company: "SulAmérica", city: "São Paulo", uf: "SP", modality: "Híbrido", level: "Estágio", family: "processual", url: "https://www.vagas.com.br/vagas/v2835862/estagio-juridico-contencioso-e-regulatorio", publishedAt: "2026-09-21", requirements: ["Cursando Direito"], niceToHave: ["Pacote Office"], description: "Planilhas de controle de prazos, monitoramento de ofícios no site da ANS, relatórios de processos, apoio em seguro garantia.", source: "Vagas.com", companySize: "Grande (250+)" },
  { title: "Assistente de Marketing", company: "CAASP", city: "São Paulo", uf: "SP", modality: "Não informada", level: "Assistente/Auxiliar", family: "mkt", url: "https://caasp.gupy.io/jobs/12492390", publishedAt: "", requirements: ["Superior completo em Marketing, Publicidade ou Comunicação", "Experiência em planejamento de marketing", "Google Analytics e Meta Ads"], niceToHave: ["Canva, Photoshop ou Illustrator"], description: "Campanhas, conteúdo para redes sociais e site, eventos, pesquisa, indicadores e relatórios.", source: "Gupy" },
  { title: "Estágio Tributário", company: "Confidencial (via Vagas.com)", city: "São Paulo", uf: "SP", modality: "Não informada", level: "Estágio", family: "juridico", url: "https://www.vagas.com.br/vagas/v2838700/estagio-tributario", publishedAt: "2026-10-08", requirements: ["Cursando Direito, Administração, Economia ou Contabilidade", "Word e Excel"], niceToHave: ["Inglês intermediário"], description: "Regimes especiais, pesquisa de legislação e jurisprudência, organização de documentos, acompanhamento de processos.", source: "Vagas.com" },
  { title: "Auxiliar de Controladoria Jurídica", company: "Escritório (via Radar da Gestão)", city: "São Paulo", uf: "SP", modality: "Presencial", level: "Assistente/Auxiliar", family: "processual", url: "https://radardagestao.com.br/vaga/auxiliar-de-controladoria-jurdica/1301/2026", publishedAt: "", requirements: ["Direito em curso ou completo", "Experiência em controladoria jurídica", "Excel intermediário"], niceToHave: ["Processo Civil", "Software CPJ"], description: "Seg. a sex., 9h às 18h, região da Av. Paulista. R$ 3.000 PJ + plano de saúde.", source: "Outro portal", salaryMin: 3000, salaryMax: 3000 },
];

function buildSeed(hashes) {
  const now = Date.now();
  const iso = d => new Date(now - d * 864e5).toISOString();
  const data = { schema: 1, demo: true };
  COLLECTIONS.forEach(c => data[c] = []);

  // fontes
  data.job_sources.push(
    { id: "src_demo", name: "Catálogo demonstrativo", type: "Sintético", url: "", authorized: true, terms: "Dados fictícios para teste", limits: "—", lastSync: iso(0), createdAt: iso(60) },
    { id: "src_manual", name: "Cadastro manual da equipe", type: "Manual", url: "", authorized: true, terms: "Somente anúncios públicos, com link individual e resumo próprio", limits: "—", lastSync: null, createdAt: iso(60) },
    { id: "src_gupy", name: "Gupy (páginas públicas)", type: "ATS (sistema de recrutamento)", url: "https://www.gupy.io", authorized: false, terms: "Integração via API exige autorização. Hoje: só cadastro manual de anúncios públicos.", limits: "—", lastSync: null, planned: true, createdAt: iso(60) },
    { id: "src_adzuna", name: "Adzuna (API de vagas)", type: "Agregador / API de vagas", url: "https://developer.adzuna.com", authorized: false, terms: "API pública com chave de desenvolvedor. Avaliar termos de uso e limites antes de conectar.", limits: "Conforme plano da API", lastSync: null, planned: true, createdAt: iso(60) },
    { id: "src_ats", name: "Quadros públicos de ATS (Greenhouse, Lever, Ashby)", type: "ATS (sistema de recrutamento)", url: "", authorized: false, terms: "Leitura de vagas públicas por empresa. Envio de candidatura exige credencial da empresa.", limits: "Por empresa monitorada", lastSync: null, planned: true, createdAt: iso(60) },
    { id: "src_careers", name: "Páginas “Trabalhe Conosco”", type: "Site oficial (Trabalhe Conosco)", url: "", authorized: false, terms: "Monitorar só páginas que permitem acesso automatizado (robots.txt e termos).", limits: "Verificação diária por página", lastSync: null, planned: true, createdAt: iso(60) },
    { id: "src_ciee", name: "CIEE / Nube / IEL (estágio)", type: "Canal público (CIEE, SINE, PAT)", url: "https://portal.ciee.org.br", authorized: false, terms: "Parceria ou cadastro manual de anúncios públicos.", limits: "—", lastSync: null, planned: true, createdAt: iso(60) },
  );

  // vagas demonstrativas
  DEMO_JOBS.forEach(([title, company, city, uf, modality, level, family, age, requirements, niceToHave, x], i) => {
    const SAL = { "Jovem aprendiz": [900, 1150], "Estágio": [1300, 1900], "Assistente/Auxiliar": [2000, 2800], "Júnior": [3000, 4200], "Pleno": [5200, 7000] }[level];
    const salaryMin = i % 4 === 3 ? null : SAL[0] + (i % 3) * 100, salaryMax = i % 4 === 3 ? null : SAL[1] + (i % 3) * 100;
    const companySize = COMPANY_SIZES[(i * 3) % 4];
    const j = { salaryMin, salaryMax, companySize, id: "job_d" + String(i + 1).padStart(2, "0"), title, company, city, uf, modality, level, family, requirements, niceToHave, description: x.description, minSemester: x.minSemester || null, maxSemester: x.maxSemester || null, sourceId: "src_demo", source: "Catálogo demonstrativo", externalId: "D-" + (1000 + i), url: "", isDemo: true, publishedAt: iso(age).slice(0, 10), deadline: x.deadlineDaysAgo ? iso(x.deadlineDaysAgo).slice(0, 10) : iso(-30).slice(0, 10), status: x.scenario === "expirada" ? "expired" : "active", lastCheckedAt: x.scenario === "nao_verificada" ? null : iso(x.checkedDaysAgo || Math.min(age, 3)), duplicateOf: null, createdAt: iso(age + (x.scenario === "duplicata" ? 0 : 1)), scenario: x.scenario || null };
    data.jobs.push(j);
  });

  // usuários sintéticos para métricas
  const cities = [["São Paulo", "SP", 26], ["Guarulhos", "SP", 9], ["Osasco", "SP", 4], ["Campinas", "SP", 4], ["Santo André", "SP", 3], ["Rio de Janeiro", "RJ", 4], ["Belo Horizonte", "MG", 3], ["Curitiba", "PR", 2], ["Recife", "PE", 2], [null, null, 3]];
  const areas = ["Jurídico", "Jurídico", "Jurídico", "Administrativo", "Administrativo", "Marketing", "Atendimento", "Tecnologia", null];
  const origins = ["Instagram", "Indicação", "Google", "LinkedIn", "WhatsApp", "Instagram", null];
  const ages = ["16–17", "18–24", "18–24", "18–24", "25–34", "25–34", "35–44", "45+", null, null];
  const first = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Heitor", "Isabela", "João", "Karina", "Lucas", "Mariana", "Nicolas", "Olívia", "Paulo", "Queila", "Renan", "Sabrina", "Tiago", "Úrsula", "Vinícius", "Wesley", "Yasmin"];
  const last = ["Almeida", "Barbosa", "Cardoso", "Dias", "Esteves", "Ferraz", "Gomes", "Henriques", "Igarashi", "Jardim", "Lopes", "Macedo", "Nogueira", "Pires", "Queiroz", "Rocha", "Siqueira", "Teles", "Vasconcelos"];
  let ci = 0; const pool = []; cities.forEach(([c, u, n]) => { for (let k = 0; k < n; k++) pool.push([c, u]); });
  for (let i = 0; i < pool.length; i++) {
    const [city, uf] = pool[i]; const created = (i * 7919) % 120; const active = Math.min(created, (i * 31) % 40);
    const name = `${first[i % first.length]} ${last[(i * 7) % last.length]}`;
    const u = { id: "usr_s" + i, name, email: `demo${i}@exemplo.invalid`, role: "candidate", status: "ativo", city, uf, area: areas[i % areas.length], origin: origins[i % origins.length], ageRange: ages[i % ages.length], synthetic: true, createdAt: iso(created), lastActiveAt: iso(active), resumeComplete: i % 3 !== 0, appsCount: i % 3 !== 0 ? (i * 3) % 7 : 0 };
    data.users.push(u);
    data.subscriptions.push({ id: "sub_s" + i, userId: u.id, plan: ["inicial", "inicial", "plus", "max"][i % 4], status: "ativa", startedAt: u.createdAt, simulated: true, createdAt: u.createdAt });
  }

  // contas de demonstração para entrar
  const cam = { id: "usr_camila", name: "Camila Duarte", email: "camila@demo.mandavaga", passwordHash: hashes.demo, role: "candidate", status: "ativo", city: "São Paulo", uf: "SP", area: "Jurídico", origin: "Indicação", ageRange: "25–34", demoAccount: true, createdAt: iso(20), lastActiveAt: iso(0), consents: { terms: true, marketing: false, whatsapp: false } };
  const raf = { id: "usr_rafael", name: "Rafael Moreira", email: "rafael@demo.mandavaga", passwordHash: hashes.demo, role: "candidate", status: "ativo", city: "Guarulhos", uf: "SP", area: null, origin: "Instagram", ageRange: null, demoAccount: true, createdAt: iso(1), lastActiveAt: iso(1), consents: { terms: true, marketing: false, whatsapp: false } };
  const adm = { id: "usr_admin", name: "Equipe Manda Vaga", email: "admin@demo.mandavaga", passwordHash: hashes.demo, role: "admin", status: "ativo", city: "São Paulo", uf: "SP", demoAccount: true, createdAt: iso(90), lastActiveAt: iso(0) };
  data.users.push(cam, raf, adm);
  data.subscriptions.push({ id: "sub_cam", userId: cam.id, plan: "inicial", status: "ativa", startedAt: iso(20), simulated: true, createdAt: iso(20) }, { id: "sub_raf", userId: raf.id, plan: "inicial", status: "ativa", startedAt: iso(1), simulated: true, createdAt: iso(1) });

  data.profiles.push(
    { id: "pro_cam", userId: cam.id, city: "São Paulo", uf: "SP", city2: "Guarulhos", targetRoles: ["Estágio em Direito", "Assistente jurídico", "Controladoria jurídica"], families: ["juridico", "processual", "adm"], modalities: ["Presencial", "Híbrido", "Remoto"], levels: ["Estágio", "Assistente/Auxiliar", "Júnior"], semester: 3, course: "Direito", availability: "Manhã e tarde", careerStage: "Transição de carreira", salaryMin: null, minScore: 45, createdAt: iso(20) },
    { id: "pro_raf", userId: raf.id, city: "Guarulhos", uf: "SP", city2: "", targetRoles: [], families: [], modalities: ["Presencial", "Híbrido"], levels: ["Jovem aprendiz", "Assistente/Auxiliar"], semester: null, course: "", availability: "", salaryMin: null, minScore: 40, createdAt: iso(1) },
  );
  const camResume = {
    headline: "Estudante de Direito | Rotinas administrativas e atendimento",
    summary: "Estudante do 3º semestre de Direito com mais de 8 anos de experiência em atendimento ao público, organização de documentos e rotinas administrativas. Busco estágio ou posição de apoio jurídico para aplicar  a organização e o cuidado com prazos que desenvolvi no varejo e em escritório de contabilidade .",
    experiences: [
      { id: "exp_c1", org: "Contábil Bela Vista", role: "Assistente Administrativa", start: "2022", end: "atual", activities: ["Responsável por organizar documentos de clientes e manter o arquivo digital", "Controle de prazos de entrega de obrigações em planilhas Excel", "Atendimento a clientes por telefone e e-mail", "Elaboração de relatórios mensais para os sócios."] },
      { id: "exp_c2", org: "Lojas Primavera", role: "Atendente e Caixa", start: "2019", end: "2021", activities: ["Atendimento ao público e fechamento de caixa", "Responsável pelo cadastro de clientes no sistema"] },
    ],
    education: [{ id: "edu_c1", course: "Direito", institution: "Universidade Demonstrativa (fictícia)", status: "em andamento", end: "" }, { id: "edu_c2", course: "Técnico em Administração", institution: "Escola Técnica Demonstrativa (fictícia)", status: "concluído", end: "2018" }],
    skills: ["Atendimento ao público", "Organização de documentos", "Excel", "Pacote Office", "Cadastros", "Controle de prazos", "Excel", "Relatórios"],
    certifications: ["Excel Intermediário — curso livre (fictício), 2023"],
    languages: [{ lang: "Inglês", level: "Básico" }],
    extra: "Disponibilidade de manhã e à tarde. Mora na zona leste de São Paulo.",
  };
  data.resumes.push({ id: "res_cam", userId: cam.id, sourceType: "manual", status: "rascunho", data: camResume, createdAt: iso(19), updatedAt: iso(2) });
  data.resume_versions.push({ id: "ver_cam1", userId: cam.id, type: "base", label: "Versão inicial (preenchimento manual)", jobId: null, data: JSON.parse(JSON.stringify(camResume)), changes: [], createdAt: iso(19) });
  data.keyword_claims.push({ id: "kc_cam1", userId: cam.id, term: "Software jurídico (CPJ, Projuris, Astrea)", evidence: "", confirmed: false, createdAt: iso(3) });

  // feedback e candidatura de exemplo
  data.job_feedback.push({ id: "fb1", userId: cam.id, jobId: "job_d07", state: "salva", reason: "", createdAt: iso(1) });
  data.applications.push({ id: "app_cam1", userId: cam.id, jobId: "job_d03", status: "Aguardando ação do candidato", confirmed: false, evidence: "", next: "Concluir o teste online pedido pelo portal", notes: "", resumeVersionId: null, interview: null, history: [{ status: "Selecionada", at: iso(4), note: "" }, { status: "Aguardando ação do candidato", at: iso(2), note: "Portal pediu teste de Excel" }], createdAt: iso(4) });

  // consumo do mês (sintético) para um usuário próximo do limite
  for (let k = 0; k < 97; k++) data.usage_events.push({ id: "use_s" + k, userId: "usr_s2", jobId: "hist_" + k, type: "oportunidade_entregue", month: U.month(), key: `usr_s2|hist_${k}|${U.month()}`, createdAt: iso(k % 15) });

  data.notification_preferences.push({ id: "np_cam", userId: cam.id, inApp: true, email: false, whatsapp: false, frequency: "diária", createdAt: iso(20) });
  data.notifications.push({ id: "nt1", userId: cam.id, title: "Ação pendente", body: "A candidatura para Auxiliar de Controladoria Jurídica espera um teste no portal.", kind: "warn", link: "apps", read: false, createdAt: iso(2) });
  data.privacy_requests.push({ id: "pr1", userId: "usr_s5", userName: "Fábio Lopes", type: "Exportação de dados", status: "concluída", note: "Arquivo entregue na área do usuário", createdAt: iso(9), resolvedAt: iso(8) }, { id: "pr2", userId: "usr_s11", userName: "Lucas Esteves", type: "Correção de dados", status: "aberta", note: "Pediu para corrigir cidade", createdAt: iso(2) });
  data.audit_events.push({ id: "au1", actorId: "usr_admin", actorName: "Equipe Manda Vaga", role: "admin", action: "Vaga verificada", target: "job_d07", detail: "Anúncio conferido", createdAt: iso(1) });
  data.settings.push({ id: "set1", key: "weights", value: DEFAULT_WEIGHTS }, { id: "set2", key: "plans", value: PLANS_DEFAULT });
  return data;
}
