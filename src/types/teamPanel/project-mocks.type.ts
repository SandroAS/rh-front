export interface Project {
  id: number;
  name: string;
  status: 'concluido' | 'em_andamento' | 'pausado' | 'bloqueado';
  plannedCompletionDate?: string; // Formato 'YYYY-MM-DD'
  actualCompletionDate?: string;  // Formato 'YYYY-MM-DD'
  reason?: string; // Motivo para pausado/bloqueado
  sprint?: string; // Sprint em que foi planejado/concluído
}

export const mockProjects: Project[] = [
  // Projetos Concluídos (para ProjectDeliveriesList)
  { id: 1, name: 'Implantação de Módulo Financeiro', status: 'concluido', actualCompletionDate: '2025-05-20', sprint: 'Spint 1 (12/05 - 25/05)' },
  { id: 2, name: 'Refatoração de API de Usuários', status: 'concluido', actualCompletionDate: '2025-06-05', sprint: 'Spint 2 (26/05 - 08/06)' },
  { id: 3, name: 'Nova Funcionalidade de Login', status: 'concluido', actualCompletionDate: '2025-06-20', sprint: 'Spint 3 (09/06 - 22/06)' },
  { id: 4, name: 'Otimização de Banco de Dados', status: 'concluido', actualCompletionDate: '2025-07-01', sprint: 'Spint 4 (23/06 - 06/07)' },
  { id: 5, name: 'Integração com Sistema Externo X', status: 'concluido', actualCompletionDate: '2025-07-15', sprint: 'Spint 5 (07/07 - 20/07)' },
  { id: 6, name: 'Relatório de Vendas Mensais', status: 'concluido', actualCompletionDate: '2025-07-28', sprint: 'Spint 6 (21/07 - 03/08)' },
  { id: 7, name: 'Dashboard de Performance', status: 'concluido', actualCompletionDate: '2025-08-10', sprint: 'Spint 7 (04/08 - 17/08)' },
  { id: 8, name: 'Feature de Notificações Push', status: 'concluido', actualCompletionDate: '2025-08-15', sprint: 'Spint 7 (04/08 - 17/08)' },


  // Projetos Em Andamento (para ProjectsInProgressList)
  { id: 9, name: 'Desenvolvimento do Módulo de Contratos', status: 'em_andamento', plannedCompletionDate: '2025-09-10', sprint: 'Sprint Atual (18/07 - 31/07)' },
  { id: 10, name: 'Revisão de UX/UI do Portal Cliente', status: 'em_andamento', plannedCompletionDate: '2025-09-25', sprint: 'Sprint Atual (18/07 - 31/07)' },
  { id: 11, name: 'Automação de Testes End-to-End', status: 'em_andamento', plannedCompletionDate: '2025-08-30', sprint: 'Sprint Atual (18/07 - 31/07)' },
  { id: 12, name: 'Melhoria de Performance do Backend', status: 'em_andamento', plannedCompletionDate: '2025-10-05', sprint: 'Sprint Atual (18/07 - 31/07)' },
  { id: 13, name: 'Implementação de Novo Gateway de Pagamentos', status: 'em_andamento', plannedCompletionDate: '2025-09-15', sprint: 'Sprint Atual (18/07 - 31/07)' },
  { id: 14, name: 'Refatoração do Módulo de Relatórios', status: 'em_andamento', plannedCompletionDate: '2025-09-20', sprint: 'Sprint Atual (18/07 - 31/07)' },
  { id: 15, name: 'Criação de Componente de Gráfico Customizado', status: 'em_andamento', plannedCompletionDate: '2025-08-25', sprint: 'Sprint Atual (18/07 - 31/07)' },

  // Projetos Pausados/Bloqueados (para BlockedPausedProjectsList)
  { id: 16, name: 'Pesquisa de Mercado para Novo Produto', status: 'pausado', plannedCompletionDate: '2025-11-30', reason: 'Dependência de decisão estratégica da diretoria.', sprint: 'Sprint Atual (18/07 - 31/07)' },
  { id: 17, name: 'Atualização de Versão do Framework X', status: 'bloqueado', plannedCompletionDate: '2025-10-15', reason: 'Bug crítico na nova versão, aguardando patch do fornecedor.', sprint: 'Sprint Atual (18/07 - 31/07)' },
  { id: 18, name: 'Migração de Dados Legados', status: 'pausado', plannedCompletionDate: '2025-12-01', reason: 'Recursos dedicados alocados para projeto de alta prioridade.', sprint: 'Sprint Atual (18/07 - 31/07)' },
];

// src/data/mockUsers.ts

export interface User {
  uuid: string;
  name: string;
  email: string;
  role: string;
  engagement: 'Alto Engajamento' | 'Engajamento Moderado' | 'Baixo Engajamento';
  admissionDate: string; // YYYY-MM-DD
  lastFeedbackDate: string; // YYYY-MM-DD
  profilePicture: string; // URL da imagem
  timeline: TimelineEvent[];
  careerPlan: CareerPlan;
}

export interface TimelineEvent {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  type: 'feedback' | 'projeto' | 'capacitacao' | 'promocao'; // Adicione outros tipos se quiser
}

export interface CareerPlan {
  currentPosition: string;
  currentLevel: number;
  levels: CareerLevel[];
}

export interface CareerLevel {
  level: number;
  position: string;
  description: string;
  skillsRequired: string[];
  achievementsRequired: string[];
}

export const mockUsers: User[] = [
  {
    uuid: 'mock-1',
    name: 'Alice Santos',
    email: 'alice.santos@example.com',
    role: 'Desenvolvedora Backend Sênior',
    engagement: 'Alto Engajamento',
    admissionDate: '2020-03-15',
    lastFeedbackDate: '2025-06-20',
    profilePicture: 'https://cdn.vuetifyjs.com/images/john-smirk.png', // Exemplo de imagem
    timeline: [
      { id: 1, date: '2025-06-20', title: 'Feedback Mensal', description: 'Excelente evolução no projeto Alpha. Continue assim!', type: 'feedback' },
      { id: 2, date: '2025-05-10', title: 'Conclusão Projeto X', description: 'Liderou com sucesso a implementação do módulo de pagamentos.', type: 'projeto' },
      { id: 3, date: '2025-04-01', title: 'Treinamento de GraphQL', description: 'Participou do curso avançado de GraphQL e implementou no projeto Y.', type: 'capacitacao' },
    ],
    careerPlan: {
      currentPosition: 'Desenvolvedora Backend Sênior',
      currentLevel: 3,
      levels: [
        { level: 1, position: 'Desenvolvedor Backend Júnior', description: 'Foco em aprendizado e execução de tarefas básicas.', skillsRequired: ['Python Básico', 'SQL Básico'], achievementsRequired: ['Concluir 2 projetos de baixa complexidade'] },
        { level: 2, position: 'Desenvolvedor Backend Pleno', description: 'Executa tarefas de média complexidade, contribui com decisões técnicas.', skillsRequired: ['Python Intermediário', 'SQL Avançado', 'APIs REST'], achievementsRequired: ['Contribuir para refatoração', 'Mentorar júnior'] },
        { level: 3, position: 'Desenvolvedora Backend Sênior', description: 'Lidera projetos, define arquiteturas, mentor de outros desenvolvedores.', skillsRequired: ['Arquitetura de Sistemas', 'Otimização de Banco de Dados', 'Microservices'], achievementsRequired: ['Liderar projeto de alta complexidade', 'Publicar artigo técnico'] },
        { level: 4, position: 'Arquiteto de Soluções Backend', description: 'Define a visão técnica de grandes sistemas, pesquisa novas tecnologias.', skillsRequired: ['Cloud Computing', 'Containers', 'DevOps'], achievementsRequired: ['Definir arquitetura para novo produto', 'Apresentar em conferência'] },
      ]
    }
  },
  {
    uuid: 'mock-2',
    name: 'Bruno Mendes',
    email: 'bruno.mendes@example.com',
    role: 'Analista de Dados',
    engagement: 'Engajamento Moderado',
    admissionDate: '2022-01-10',
    lastFeedbackDate: '2025-07-01',
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    timeline: [
      { id: 1, date: '2025-07-01', title: 'Feedback de Desempenho', description: 'Bom trabalho na análise do volume de vendas. Necessário focar mais na comunicação dos insights.', type: 'feedback' },
      { id: 2, date: '2025-06-15', title: 'Relatório Anual de BI', description: 'Preparação e apresentação do relatório de inteligência de negócios.', type: 'projeto' },
    ],
    careerPlan: {
      currentPosition: 'Analista de Dados',
      currentLevel: 2,
      levels: [
        { level: 1, position: 'Analista de Dados Júnior', description: 'Coleta e organização básica de dados.', skillsRequired: ['Excel', 'SQL Básico'], achievementsRequired: ['Criar 3 relatórios básicos'] },
        { level: 2, position: 'Analista de Dados Pleno', description: 'Análise de dados complexos e criação de dashboards.', skillsRequired: ['Python para Dados', 'Power BI/Tableau'], achievementsRequired: ['Otimizar query de dados', 'Apresentar resultado de análise'] },
        { level: 3, position: 'Cientista de Dados', description: 'Modelagem preditiva e machine learning.', skillsRequired: ['Machine Learning', 'Estatística Avançada'], achievementsRequired: ['Desenvolver modelo preditivo', 'Publicar pesquisa'] },
      ]
    }
  },
  {
    uuid: 'mock-3',
    name: 'Carla Dias',
    email: 'carla.dias@example.com',
    role: 'Designer UX/UI',
    engagement: 'Alto Engajamento',
    admissionDate: '2023-08-01',
    lastFeedbackDate: '2025-05-25',
    profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
    timeline: [
      { id: 1, date: '2025-05-25', title: 'Revisão de Portfólio', description: 'Portfólio excelente, demonstra boa evolução.', type: 'feedback' },
      { id: 2, date: '2025-04-05', title: 'Workshop de Figma', description: 'Conduziu um workshop interno sobre as melhores práticas do Figma.', type: 'capacitacao' },
    ],
    careerPlan: {
      currentPosition: 'Designer UX/UI Júnior',
      currentLevel: 1,
      levels: [
        { level: 1, position: 'Designer UX/UI Júnior', description: 'Foco em aprendizado das ferramentas e princípios de design.', skillsRequired: ['Figma Básico', 'Princípios de UX'], achievementsRequired: ['Participar de 3 projetos de interface'] },
        { level: 2, position: 'Designer UX/UI Pleno', description: 'Criação de designs complexos e pesquisa de usuário.', skillsRequired: ['Prototipagem Avançada', 'Testes de Usabilidade'], achievementsRequired: ['Liderar 1 fase de pesquisa de usuário', 'Melhorar métrica de usabilidade'] },
      ]
    }
  },
   {
    uuid: 'mock-4',
    name: 'Daniel Rocha',
    email: 'daniel.rocha@example.com',
    role: 'Gerente de Projetos',
    engagement: 'Alto Engajamento',
    admissionDate: '2019-11-01',
    lastFeedbackDate: '2025-07-10',
    profilePicture: 'https://randomuser.me/api/portraits/men/50.jpg',
    timeline: [
      { id: 1, date: '2025-07-10', title: 'Reunião de Alinhamento Estratégico', description: 'Excelente condução na reunião de alinhamento com a diretoria.', type: 'feedback' },
      { id: 2, date: '2025-06-01', title: 'Conclusão Projeto Zeus', description: 'Projeto entregue dentro do prazo e orçamento, com alta satisfação do cliente.', type: 'projeto' },
    ],
    careerPlan: {
      currentPosition: 'Gerente de Projetos Sênior',
      currentLevel: 3,
      levels: [
        { level: 1, position: 'Analista de Projetos', description: 'Apoio na documentação e acompanhamento de projetos.', skillsRequired: ['Pacote Office', 'Noções de PMBOK'], achievementsRequired: ['Auxiliar em 5 projetos'] },
        { level: 2, position: 'Gerente de Projetos Pleno', description: 'Gestão de projetos de média complexidade, comunicação com stakeholders.', skillsRequired: ['Scrum', 'Ferramentas de Gestão (Jira)'], achievementsRequired: ['Gerenciar 3 projetos completos'] },
        { level: 3, position: 'Gerente de Projetos Sênior', description: 'Gestão de portfólio de projetos, mentoria e estratégia.', skillsRequired: ['Certificação PMP', 'Gestão de Riscos'], achievementsRequired: ['Gerenciar portfólio de projetos', 'Melhorar KPIs de entrega em 10%'] },
        { level: 4, position: 'Diretor de Operações', description: 'Supervisiona todas as operações de projetos da empresa.', skillsRequired: ['Liderança Estratégica', 'Gestão de Equipes Grandes'], achievementsRequired: ['Expandir operações para novo mercado', 'Aumentar a eficiência da equipe em 20%'] },
      ]
    }
  },
  // Adicione outros usuários mockados aqui, se necessário, para os UUIDs que você usou no menu
  {
    uuid: 'mock-5',
    name: 'Eliana Lima',
    email: 'eliana.lima@example.com',
    role: 'QA Tester',
    engagement: 'Engajamento Moderado',
    admissionDate: '2024-01-01',
    lastFeedbackDate: '2025-06-05',
    profilePicture: 'https://randomuser.me/api/portraits/women/60.jpg',
    timeline: [
      { id: 1, date: '2025-06-05', title: 'Review de Testes', description: 'Revisão dos casos de teste para o novo módulo de RH.', type: 'feedback' },
      { id: 2, date: '2025-05-15', title: 'Automação de Testes', description: 'Implementação de testes automatizados com Cypress.', type: 'projeto' },
    ],
    careerPlan: {
      currentPosition: 'QA Tester Júnior',
      currentLevel: 1,
      levels: [
        { level: 1, position: 'QA Tester Júnior', description: 'Execução de testes manuais e documentação de bugs.', skillsRequired: ['Testes Manuais', 'Jira'], achievementsRequired: ['Encontrar 20 bugs críticos'] },
        { level: 2, position: 'QA Tester Pleno', description: 'Criação de planos de teste e automação básica.', skillsRequired: ['Testes de Regressão', 'Selenium'], achievementsRequired: ['Automatizar 50% dos testes de um projeto'] },
        { level: 3, position: 'Engenheiro de Qualidade', description: 'Estratégia de qualidade e liderança de equipe de QA.', skillsRequired: ['Testes de Performance', 'Integração Contínua'], achievementsRequired: ['Reduzir taxa de bugs pós-produção em 15%'] },
      ]
    }
  },
  {
    uuid: 'mock-6',
    name: 'Fábio Costa',
    email: 'fabio.costa@example.com',
    role: 'Analista de Marketing',
    engagement: 'Alto Engajamento',
    admissionDate: '2021-09-01',
    lastFeedbackDate: '2025-07-01',
    profilePicture: 'https://randomuser.me/api/portraits/men/20.jpg',
    timeline: [
      { id: 1, date: '2025-07-01', title: 'Campanha de Lançamento', description: 'Sucesso na campanha de lançamento do produto X, superando as metas de leads.', type: 'projeto' },
      { id: 2, date: '2025-06-10', title: 'Feedback Semestral', description: 'Reconhecimento pelo bom desempenho na gestão de mídias sociais.', type: 'feedback' },
    ],
    careerPlan: {
      currentPosition: 'Analista de Marketing Pleno',
      currentLevel: 2,
      levels: [
        { level: 1, position: 'Analista de Marketing Júnior', description: 'Apoio na criação de conteúdo e análise de métricas básicas.', skillsRequired: ['Redes Sociais', 'Google Analytics'], achievementsRequired: ['Criar 10 peças de conteúdo'] },
        { level: 2, position: 'Analista de Marketing Pleno', description: 'Gestão de campanhas e estratégias de SEO/SEM.', skillsRequired: ['SEO', 'SEM', 'Email Marketing'], achievementsRequired: ['Aumentar tráfego orgânico em 20%', 'Liderar 2 campanhas'] },
        { level: 3, position: 'Especialista em Marketing Digital', description: 'Definição de estratégias de marketing abrangentes.', skillsRequired: ['Growth Hacking', 'Análise de Mercado'], achievementsRequired: ['Lançar novo canal de aquisição de clientes'] },
      ]
    }
  },
  // Adicione mock-7 e mock-8 se quiser
];


export const getUserById = (uuid: string): User | undefined => {
  return mockUsers.find(user => user.uuid === uuid);
};
