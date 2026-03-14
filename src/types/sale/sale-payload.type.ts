/** Códigos dos módulos do sistema (alinhado ao Register e futuro catálogo da API) */
export enum SystemModuleCode {
  EMPLOYEE_MANAGEMENT = 'EMPLOYEE_MANAGEMENT',
  RECRUITMENT = 'RECRUITMENT',
  PERFORMANCE_MANAGEMENT = 'PERFORMANCE_MANAGEMENT',
  CAREER_DEVELOPMENT = 'CAREER_DEVELOPMENT',
  TRAINING_DEVELOPMENT = 'TRAINING_DEVELOPMENT',
  PAYROLL = 'PAYROLL',
  TIME_ATTENDANCE = 'TIME_ATTENDANCE',
  BENEFITS_COMPENSATION = 'BENEFITS_COMPENSATION',
  ONBOARDING_OFFBOARDING = 'ONBOARDING_OFFBOARDING',
}

/** Rótulos para exibição dos módulos (checkout, registro, etc.) */
export const SYSTEM_MODULE_LABELS: Record<SystemModuleCode, string> = {
  [SystemModuleCode.EMPLOYEE_MANAGEMENT]: 'Gestão de Colaboradores',
  [SystemModuleCode.RECRUITMENT]: 'Recrutamento e Seleção',
  [SystemModuleCode.PERFORMANCE_MANAGEMENT]: 'Gestão de Desempenho',
  [SystemModuleCode.CAREER_DEVELOPMENT]: 'Desenvolvimento de Carreira',
  [SystemModuleCode.TRAINING_DEVELOPMENT]: 'Desenvolvimento de Treinamentos',
  [SystemModuleCode.PAYROLL]: 'Folha de Pagamento',
  [SystemModuleCode.TIME_ATTENDANCE]: 'Controle de Ponto e Acesso',
  [SystemModuleCode.BENEFITS_COMPENSATION]: 'Benefícios e Compensação',
  [SystemModuleCode.ONBOARDING_OFFBOARDING]: 'Onboarding e Offboarding',
};

export interface SaleAddressPayload {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface SalePayload {
  name: string;
  email: string;
  phone: string;
  document: string;
  address: SaleAddressPayload;
  plan_uuid: string;
  billing_interval: 'monthly' | 'yearly';
  payment_method: 'pix' | 'card' | 'boleto';
  /** Códigos dos módulos adquiridos (futuro: API pode retornar module_uuids) */
  module_codes: SystemModuleCode[];
}
