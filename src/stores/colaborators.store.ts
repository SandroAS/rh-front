import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Colaborador {
  id: string;
  name: string;
  role: string;
  email: string;
  admissionDate: string;
  gestorId: string;
  status: 'ativo' | 'inativo';
  engagementLevel: 'alto' | 'medio' | 'baixo';
  lastFeedback?: string; // Data do último feedback
  avatar?: string; // URL do avatar
}

export interface CheckIn {
  id: string;
  colaboradorId: string;
  type: 'feedback' | 'reconhecimento' | 'alerta' | 'desenvolvimento';
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  gestorId: string;
}

export interface Marco {
  id: string;
  colaboradorId: string;
  type: 'admissao' | 'onboarding' | 'treinamento' | 'meta' | 'promocao' | 'feedback';
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  icon: string; // Emoji ou URL de ícone
}

export const useColaboradoresStore = defineStore('colaboradores', () => {
  // --- STATE ---
  // Use ref() para definir os estados reativos
  const colaboradores = ref<Colaborador[]>([
    {
      id: '1',
      name: 'João Silva',
      role: 'Desenvolvedor Frontend',
      email: 'joao@empresa.com',
      admissionDate: '2023-01-15',
      gestorId: '2',
      status: 'ativo',
      engagementLevel: 'alto',
      lastFeedback: '2024-01-10',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '2',
      name: 'Maria Santos',
      role: 'Designer UX/UI',
      email: 'maria.santos@empresa.com',
      admissionDate: '2023-03-20',
      gestorId: '2',
      status: 'ativo',
      engagementLevel: 'alto',
      lastFeedback: '2024-01-05',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      role: 'Analista de Sistemas',
      email: 'pedro@empresa.com',
      admissionDate: '2023-06-10',
      gestorId: '2',
      status: 'ativo',
      engagementLevel: 'medio',
      lastFeedback: '2023-12-20',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '4',
      name: 'Ana Costa',
      role: 'Gerente de Vendas',
      email: 'ana.costa@empresa.com',
      admissionDate: '2022-09-05',
      gestorId: '3',
      status: 'ativo',
      engagementLevel: 'alto',
      lastFeedback: '2024-01-08',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '5',
      name: 'Lucas Ferreira',
      role: 'Consultor Comercial',
      email: 'lucas@empresa.com',
      admissionDate: '2023-11-01',
      gestorId: '3',
      status: 'ativo',
      engagementLevel: 'baixo',
      lastFeedback: '2023-11-15',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ]);

  const checkIns = ref<CheckIn[]>([
    {
      id: '1',
      colaboradorId: '1',
      type: 'feedback',
      title: 'Feedback Mensal',
      description: 'Excelente evolução no projeto React. Continue assim!',
      date: '2024-01-10',
      gestorId: '2'
    },
    {
      id: '2',
      colaboradorId: '2',
      type: 'reconhecimento',
      title: 'Reconhecimento',
      description: 'Parabéns pelo design do novo produto!',
      date: '2024-01-05',
      gestorId: '2'
    },
    {
      id: '3',
      colaboradorId: '5',
      type: 'alerta',
      title: 'Atenção necessária',
      description: 'Precisa melhorar performance em vendas',
      date: '2023-12-01',
      gestorId: '3'
    }
  ]);

  const marcos = ref<Marco[]>([
    {
      id: '1',
      colaboradorId: 'mock-2',
      type: 'admissao',
      title: 'Início na empresa',
      description: 'Bem-vindo à equipe!',
      date: '2023-01-15',
      icon: '🎯'
    },
    {
      id: '2',
      colaboradorId: 'mock-2',
      type: 'onboarding',
      title: 'Onboarding',
      description: 'Processo de integração finalizado com sucesso',
      date: '2023-01-30',
      icon: '✅'
    },
    {
      id: '3',
      colaboradorId: 'mock-2',
      type: 'treinamento',
      title: 'Certificação React',
      description: 'Concluiu curso avançado de React',
      date: '2023-06-10',
      icon: '🎖️'
    },
    {
      id: '4',
      colaboradorId: 'mock-2',
      type: 'treinamento',
      title: 'Certificação Vue',
      description: 'Concluiu curso avançado de React',
      date: '2023-06-10',
      icon: '🎖️'
    },
    {
      id: '4',
      colaboradorId: 'mock-2',
      type: 'treinamento',
      title: 'Certificação Vue',
      description: 'Concluiu curso avançado de React',
      date: '2023-06-10',
      icon: '🎖️'
    },
    {
      id: '4',
      colaboradorId: 'mock-2',
      type: 'treinamento',
      title: 'Certificação Vue',
      description: 'Concluiu curso avançado de React',
      date: '2023-06-10',
      icon: '🎖️'
    },
    {
      id: '4',
      colaboradorId: 'mock-2',
      type: 'treinamento',
      title: 'Certificação Vue',
      description: 'Concluiu curso avançado de React',
      date: '2023-06-10',
      icon: '🎖️'
    },
    {
      id: '4',
      colaboradorId: 'mock-2',
      type: 'treinamento',
      title: 'Certificação Vue',
      description: 'Concluiu curso avançado de React',
      date: '2023-06-10',
      icon: '🎖️'
    },
    {
      id: '4',
      colaboradorId: 'mock-2',
      type: 'treinamento',
      title: 'Certificação Vue',
      description: 'Concluiu curso avançado de React',
      date: '2023-06-10',
      icon: '🎖️'
    },
    {
      id: '4',
      colaboradorId: 'mock-2',
      type: 'treinamento',
      title: 'Certificação Vue',
      description: 'Concluiu curso avançado de React',
      date: '2023-06-10',
      icon: '🎖️'
    },
    {
      id: '5',
      colaboradorId: '2',
      type: 'promocao',
      title: 'Promoção para Senior',
      description: 'Promovida para Designer Senior',
      date: '2023-12-01',
      icon: '⭐'
    }
  ]);

  // --- GETTERS (com computed) ---
  // Não eram solicitados explicitamente, mas aqui está como você faria se precisasse de getters
  // const totalColaboradoresAtivos = computed(() => colaboradores.value.filter(c => c.status === 'ativo').length);

  // --- ACTIONS ---
  function getColaboradoresByGestor(gestorId: string): Colaborador[] {
    return colaboradores.value.filter(c => c.gestorId === gestorId);
  }

  function getColaboradorById(id: string): Colaborador | undefined {
    return colaboradores.value.find(c => c.id === id);
  }

  function getCheckInsByColaborador(colaboradorId: string): CheckIn[] {
    return checkIns.value
      .filter(c => c.colaboradorId === colaboradorId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  function getMarcosByColaborador(colaboradorId: string): Marco[] {
    return marcos.value
      .filter(m => m.colaboradorId === colaboradorId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  function addCheckIn(checkIn: Omit<CheckIn, 'id'>) {
    const newCheckIn: CheckIn = {
      ...checkIn,
      id: Date.now().toString()
    };
    checkIns.value.push(newCheckIn);

    // Atualizar data do último feedback se for do tipo feedback
    if (checkIn.type === 'feedback') {
      const colaborador = colaboradores.value.find(c => c.id === checkIn.colaboradorId);
      if (colaborador) {
        colaborador.lastFeedback = checkIn.date;
      }
    }
  }

  function getAlertas(gestorId: string) {
    const alertas = [] as any[];
    // Você precisa chamar getColaboradoresByGestor como uma função diretamente aqui,
    // ou passá-lo como argumento se a store não estiver inicializada globalmente.
    // Em Pinia Setup Stores, as ações se chamam diretamente sem `this.` para outras ações.
    const colaboradoresDoGestor = getColaboradoresByGestor(gestorId);

    colaboradoresDoGestor.forEach(colaborador => {
      // Alerta para colaboradores sem feedback há mais de 60 dias
      if (colaborador.lastFeedback) {
        const diasSemFeedback = Math.floor(
          (new Date().getTime() - new Date(colaborador.lastFeedback).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diasSemFeedback > 60) {
          alertas.push({
            type: 'feedback_pendente',
            colaborador: colaborador.name,
            message: `${colaborador.name} está há ${diasSemFeedback} dias sem receber feedback.`,
            priority: 'alta'
          });
        }
      }

      // Alerta para colaboradores com baixo engajamento
      if (colaborador.engagementLevel === 'baixo') {
        alertas.push({
          type: 'engajamento_baixo',
          colaborador: colaborador.name,
          message: `${colaborador.name} apresenta baixo nível de engajamento.`,
          priority: 'media'
        });
      }
    });

    return alertas;
  }

  // Retorne tudo o que você quer expor da store
  return {
    colaboradores,
    checkIns,
    marcos,
    getColaboradoresByGestor,
    getColaboradorById,
    getCheckInsByColaborador,
    getMarcosByColaborador,
    addCheckIn,
    getAlertas
  };
});