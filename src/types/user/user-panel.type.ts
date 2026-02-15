/** Níveis do DRD no painel do usuário */
export interface UserPanelDrdLevel {
  uuid: string;
  name: string;
  order: number;
}

/** Tópicos do DRD no painel do usuário */
export interface UserPanelDrdTopic {
  uuid: string;
  name: string;
  order: number;
  drdTopicItems: unknown[];
}

/** Métricas do DRD no painel do usuário */
export interface UserPanelDrdMetric {
  uuid: string;
  name: string;
  type: string;
  prefix: string;
  classification: string;
  scoresByLevel: unknown[];
}

/** DRD aninhado no job position do painel */
export interface UserPanelDrd {
  uuid: string;
  rate: number;
  topics: UserPanelDrdTopic[];
  levels: UserPanelDrdLevel[];
  metrics: UserPanelDrdMetric[];
}

/** Grupo de níveis no painel (resumido) */
export interface UserPanelLevelsGroup {
  uuid: string;
  name: string;
}

/** Cargo no painel do usuário */
export interface UserPanelJobPosition {
  uuid: string;
  title: string;
  levelsGroup: UserPanelLevelsGroup;
  drd: UserPanelDrd;
}

/** Usuário submetente (avaliador) no painel */
export interface UserPanelSubmittingUser {
  uuid: string;
  name: string;
  email: string;
  profile_img_url: string | null;
  jobPosition: UserPanelJobPosition | null;
}

/** Opção de pergunta (vazia no retorno) */
export interface UserPanelQuestionOption {
  uuid?: string;
  value?: string;
  [key: string]: unknown;
}

/** Pergunta na resposta da avaliação */
export interface UserPanelApplicationQuestion {
  uuid: string;
  base_question_id: number;
  title: string;
  description: string;
  type: string;
  is_required: boolean;
  order: number;
  options: UserPanelQuestionOption[];
  applicationTopic: unknown | null;
}

/** Resposta (answer) de uma pergunta */
export interface UserPanelAnswer {
  uuid: string;
  created_at: string;
  text_value: string | null;
  number_value: string | null;
  application_question_uuid: string;
  application_option_uuid: string | null;
  question: UserPanelApplicationQuestion;
}

/** Resposta (response) de uma avaliação recebida */
export interface UserPanelEvaluationResponse {
  uuid: string;
  is_completed: boolean;
  submitted_at: string;
  form_application_uuid: string;
  evaluation_application_uuid: string | null;
  answers: UserPanelAnswer[];
}

/** Avaliação recebida no painel do usuário */
export interface UserPanelEvaluationReceived {
  uuid: string;
  name: string;
  description: string;
  rate: number;
  type: string;
  status: string;
  started_date: string;
  expiration_date: string;
  finished_at: string | null;
  submittingUser: UserPanelSubmittingUser;
  responses: UserPanelEvaluationResponse[];
}

/** Retorno da API GET /users/:uuid/user-panel */
export interface UserPanel {
  uuid: string;
  name: string;
  profile_img_url: string | null;
  jobPosition: UserPanelJobPosition;
  evaluationsReceived: UserPanelEvaluationReceived[];
}
