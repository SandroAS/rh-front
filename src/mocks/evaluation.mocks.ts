import type Evaluation from '@/types/evaluation/evaluation.type';
import type AccountUser from '@/types/account/account-user.type';
import type EvaluationApplication from '@/types/evaluationApplication/evaluation-application.type';
import { RoleType } from '@/types/user/user-role.type';

// Mock de Usuários
export const mockUsers: AccountUser[] = [
  { uuid: 'user-001', name: 'João Silva', email: 'joao.silva@empresa.com', is_active: true, role: RoleType.MEMBER },
  { uuid: 'user-002', name: 'Maria Santos', email: 'maria.santos@empresa.com', is_active: true, role: RoleType.MEMBER },
  { uuid: 'user-003', name: 'Pedro Souza', email: 'pedro.souza@empresa.com', is_active: true, role: RoleType.MEMBER },
  { uuid: 'user-004', name: 'Ana Oliveira', email: 'ana.oliveira@empresa.com', is_active: true, role: RoleType.MEMBER },
];

// Mock de Modelos de Avaliação
export const mockEvaluationModels: Evaluation[] = [
  {
    uuid: 'model-001',
    title: 'Avaliação de Desempenho Trimestral',
    rate: 3,
    drd_uuid: 'drd-001',
    created_by_user_uuid: 'user-001',
    evaluation_topics: [
      {
        uuid: 'topic-a1',
        title: 'Competências Técnicas',
        description: 'Habilidades relacionadas ao cargo.',
        evaluation_questions: [
          {
            uuid: 'quest-a1-1',
            title: 'Qualidade do código.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3'],
          },
          {
            uuid: 'quest-a1-2',
            title: 'Conhecimento da tecnologia.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3'],
          },
        ],
      },
      {
        uuid: 'topic-a2',
        title: 'Habilidades Comportamentais',
        description: 'Colaboração e comunicação.',
        evaluation_questions: [
          {
            uuid: 'quest-a2-1',
            title: 'Trabalho em equipe.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3'],
          },
        ],
      },
    ],
  },
  {
    uuid: 'model-002',
    title: 'Avaliação de Liderança Anual',
    rate: 5,
    drd_uuid: 'drd-002',
    created_by_user_uuid: 'user-002',
    evaluation_topics: [
      {
        uuid: 'topic-b1',
        title: 'Visão Estratégica',
        description: 'Capacidade de definir objetivos.',
        evaluation_questions: [
          {
            uuid: 'quest-b1-1',
            title: 'Planejamento e execução.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
          {
            uuid: 'quest-b1-2',
            title: 'Inovação e criatividade.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
        ],
      },
      {
        uuid: 'topic-b2',
        title: 'Gestão de Pessoas',
        description: 'Capacidade de liderar e motivar.',
        evaluation_questions: [
          {
            uuid: 'quest-b2-1',
            title: 'Comunicação e feedback.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
        ],
      },
    ],
  },
];

// Função para gerar aplicações de avaliação mockadas
function generateMockApplications(): EvaluationApplication[] {
  const applications: EvaluationApplication[] = [];
  const today = new Date();

  for (let i = 0; i < 15; i++) {
    const appDate = new Date();
    appDate.setMonth(today.getMonth() - Math.floor(Math.random() * 12));
    appDate.setDate(Math.floor(Math.random() * 28));

    const status = i % 5 === 0 ? 'canceled' : (i % 3 === 0 ? 'completed' : 'pending');
    
    // Simula algumas aplicações expiradas
    if (status === 'pending' && i > 10) {
      const expirationDate = new Date(appDate);
      expirationDate.setDate(expirationDate.getDate() + 30);
      if (today > expirationDate) {
        // Na prática, a API retornaria 'expired', mas vamos simular a lógica no frontend
        // para manter o exemplo simples.
      }
    }

    const model = i % 2 === 0 ? mockEvaluationModels[0] : mockEvaluationModels[1];

    applications.push({
      uuid: i + '12323',
      evaluation_model_uuid: model.uuid,
      type: i % 4 === 0 ? 'peer' : (i % 3 === 0 ? 'leader' : 'self'),
      requested_by_user_uuid: mockUsers[i % 4].uuid!,
      evaluated_collaborator_uuid: mockUsers[(i + 1) % 4].uuid!,
      evaluator_collaborator_uuid: i % 3 === 0 ? mockUsers[(i + 2) % 4].uuid! : mockUsers[(i + 1) % 4].uuid!, // Avaliador diferente para tipo 'leader'
      application_date: appDate.toISOString().substring(0, 10),
      status: status,
    });
  }

  return applications;
}

export const mockEvaluationApplications = generateMockApplications();