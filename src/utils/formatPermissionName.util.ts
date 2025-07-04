/**
 * Um mapa que associa as chaves de permissão do backend
 * com suas representações amigáveis para o usuário.
 *
 * Use este mapa para adicionar e gerenciar todas as suas traduções de permissão.
 */
const permissionMap: { [key: string]: string } = {
  // DASHBOARD
  'dashboard_read': 'Dashboard - Visualizar',
  'dashboard_billings_total_read': 'Dashboard - Faturamento Total',
  'dashboard_billings_chart_read': 'Dashboard - Gráfico de Faturamento',

  // ASSINATURAS (SUBSCRIPTIONS)
  'subscription_settings_read': 'Assinatura - Visualizar Configurações',
  'subscription_settings_pay': 'Assinatura - Pagar',
  'subscriptions_settings_cancel': 'Assinatura - Cancelar',
  'subscriptions_settings_upgrade': 'Assinatura - Fazer Upgrade',

  // INTEGRAÇÕES
  'integrations_settings_read': 'Integrações - Visualizar Configurações',
  'integrations_settings_update': 'Integrações - Editar Configurações',
  'integrations_settings_create': 'Integrações - Criar Configurações',
  'integrations_settings_delete': 'Integrações - Excluir Configurações',

  // USUÁRIOS
  'users_settings_read': 'Usuários - Visualizar',
  'users_settings_update': 'Usuários - Editar',
  'users_settings_deactive': 'Usuários - Desativar',
  'users_settings_create': 'Usuários - Criar',

  // PERMISSÕES (ROLES/PERMISSIONS)
  'permissions_settings_read': 'Permissões - Visualizar',
  'permissions_settings_create': 'Permissões - Criar',
  'permissions_settings_update': 'Permissões - Editar',
  'permissions_settings_delete': 'Permissões - Excluir',

  // SERVIÇOS
  'services_settings_read': 'Serviços - Visualizar',
  'services_settings_create': 'Serviços - Criar',
  'services_settings_update': 'Serviços - Editar',
  'services_settings_delete': 'Serviços - Excluir',

  // ODONTOGRAMA (CATEGORIES)
  'odontograma_categories_settings_read': 'Odontograma (Categorias) - Visualizar',
  'odontograma_categories_settings_create': 'Odontograma (Categorias) - Criar',
  'odontograma_categories_settings_update': 'Odontograma (Categorias) - Editar',
  'odontograma_categories_settings_delete': 'Odontograma (Categorias) - Excluir',

  // PACIENTES (GERAL)
  'patients_read': 'Pacientes - Visualizar',
  'patients_create': 'Pacientes - Criar',
  'patients_update': 'Pacientes - Editar',
  'patients_delete': 'Pacientes - Excluir',

  // PRONTUÁRIOS (PATIENTS RECORD)
  'patients_record_read': 'Prontuário - Visualizar',
  'patients_record_profile_read': 'Prontuário (Perfil) - Visualizar',
  'patients_record_profile_update': 'Prontuário (Perfil) - Editar',
  'patients_record_anamnesis_read': 'Prontuário (Anamnese) - Visualizar',
  'patients_record_anamnesis_update': 'Prontuário (Anamnese) - Editar',
  'patients_record_odontograma_read': 'Prontuário (Odontograma) - Visualizar',
  'patients_record_odontograma_create': 'Prontuário (Odontograma) - Criar',
  'patients_record_odontograma_update': 'Prontuário (Odontograma) - Editar',
  'patients_record_odontograma_delete': 'Prontuário (Odontograma) - Excluir',
  'patients_record_recipes_read': 'Prontuário (Receitas) - Visualizar',
  'patients_record_recipes_create': 'Prontuário (Receitas) - Criar',
  'patients_record_recipes_update': 'Prontuário (Receitas) - Editar',
  'patients_record_recipes_delete': 'Prontuário (Receitas) - Excluir',
  'patients_record_attests_read': 'Prontuário (Atestados) - Visualizar',
  'patients_record_attests_create': 'Prontuário (Atestados) - Criar',
  'patients_record_attests_update': 'Prontuário (Atestados) - Editar',
  'patients_record_attests_delete': 'Prontuário (Atestados) - Excluir',
  'patients_record_contracts_read': 'Prontuário (Contratos) - Visualizar',
  'patients_record_contracts_create': 'Prontuário (Contratos) - Criar',
  'patients_record_contracts_update': 'Prontuário (Contratos) - Editar',
  'patients_record_contracts_delete': 'Prontuário (Contratos) - Excluir',
  'patients_record_files_read': 'Prontuário (Anexos) - Visualizar',
  'patients_record_files_create': 'Prontuário (Anexos) - Criar',
  'patients_record_files_update': 'Prontuário (Anexos) - Editar',
  'patients_record_files_delete': 'Prontuário (Anexos) - Excluir',

  // ORÇAMENTOS (BUDGETS)
  'budgets_read': 'Orçamentos - Visualizar',
  'budgets_create': 'Orçamentos - Criar',
  'budgets_update_status': 'Orçamentos - Atualizar Status',
  'budgets_update': 'Orçamentos - Editar',
  'budgets_view': 'Orçamentos - Ver Detalhes',
  'budgets_send_whatsapp': 'Orçamentos - Enviar por WhatsApp',
  'budgets_schedule': 'Orçamentos - Agendar',
  'budgets_start_appointment': 'Orçamentos - Iniciar Atendimento',

  // AGENDAMENTOS (APPOINTMENTS)
  'appointments_read': 'Atendimentos - Visualizar',
  'appointments_create': 'Atendimentos - Criar',
  'appointments_update': 'Atendimentos - Editar',
  'appointments_delete': 'Atendimentos - Excluir',

  // CALENDÁRIO (SCHEDULES)
  'schedules_read': 'Agendamentos - Visualizar',
  'schedules_create': 'Agendamentos - Criar',
  'schedules_update': 'Agendamentos - Editar',
  'schedules_delete': 'Agendamentos - Excluir',

  // MODELOS
  'models_read': 'Modelos - Visualizar',

  // MODELOS DE RECEITAS
  'recipes_models_read': 'Modelos de Receitas - Visualizar',
  'recipes_models_create': 'Modelos de Receitas - Criar',
  'recipes_models_update': 'Modelos de Receitas - Editar',
  'recipes_models_delete': 'Modelos de Receitas - Excluir',

  // MODELOS DE ATESTADOS
  'attests_models_read': 'Modelos de Atestados - Visualizar',
  'attests_models_create': 'Modelos de Atestados - Criar',
  'attests_models_update': 'Modelos de Atestados - Editar',
  'attests_models_delete': 'Modelos de Atestados - Excluir',

  // MODELOS DE CONTRATOS
  'contracts_models_read': 'Modelos de Contratos - Visualizar',
  'contracts_models_create': 'Modelos de Contratos - Criar',
  'contracts_models_update': 'Modelos de Contratos - Editar',
  'contracts_models_delete': 'Modelos de Contratos - Excluir',
};

/**
 * Formata uma chave de permissão para uma string mais amigável para o usuário.
 * Se a permissão não for encontrada no mapa, tenta uma formatação genérica.
 *
 * @param permissionKey A chave da permissão (ex: 'dashboard_read').
 * @returns A string formatada para exibição.
 */
export default function formatPermissionName(permissionKey: string): string {
  // Tenta encontrar a permissão no mapa
  if (permissionMap[permissionKey]) {
    return permissionMap[permissionKey];
  }

  const parts = permissionKey.replace(/_/g, ' ').split(' ');
  const formattedParts = parts.map(part => {
    // Capitaliza a primeira letra de cada palavra
    return part.charAt(0).toUpperCase() + part.slice(1);
  });

  return formattedParts.join(' ');
}
