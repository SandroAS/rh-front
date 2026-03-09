/** Níveis do DRD no painel do usuário */
export interface UserPanelDrdLevel {
  uuid: string;
  name: string;
  order: number;
}

/** Score por nível em um item de tópico do DRD */
export interface UserPanelDrdTopicItemScore {
  uuid: string;
  drd_level_uuid: string;
  min_score: string;
  drd_level_order: number;
}

/** Item de tópico do DRD no painel */
export interface UserPanelDrdTopicItem {
  uuid: string;
  name: string;
  order: number;
  scoresByLevel: UserPanelDrdTopicItemScore[];
}

/** Tópicos do DRD no painel do usuário */
export interface UserPanelDrdTopic {
  uuid: string;
  name: string;
  order: number;
  drdTopicItems: UserPanelDrdTopicItem[];
}

/** Score por nível em uma métrica do DRD no painel */
export interface UserPanelDrdMetricScoreByLevel {
  uuid: string;
  min_score: string;
}

/** Métricas do DRD no painel do usuário */
export interface UserPanelDrdMetric {
  uuid: string;
  name: string;
  type: string;
  prefix: string;
  classification: string;
  scoresByLevel: UserPanelDrdMetricScoreByLevel[];
}

/** DRD aninhado no job position do painel */
export interface UserPanelDrd {
  uuid: string;
  rate: number;
  drdTopics: UserPanelDrdTopic[];
  drdLevels: UserPanelDrdLevel[];
  drdMetrics: UserPanelDrdMetric[];
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
  cbo_code?: string;
  base_salary?: number;
  description?: string;
  levelsGroup?: UserPanelLevelsGroup;
  drd?: UserPanelDrd;
}

/** Nível atual do cargo no painel do usuário */
export interface UserPanelJobPositionCurrentLevel {
  uuid: string;
  name: string;
  salary?: string;
  order: number;
}

/** Plano de carreira Y (resumido) no painel */
export interface UserPanelCareerPlanY {
  uuid: string;
  name: string;
  [key: string]: unknown;
}

/** Cargo (resumido) em um item do plano de carreira no painel */
export interface UserPanelCareerPlanJobPositionRef {
  uuid: string;
  title?: string;
  [key: string]: unknown;
}

/** Item do plano de carreira no painel do usuário */
export interface UserPanelCareerPlanJobPosition {
  uuid: string;
  job_position_uuid: string;
  order: number;
  career_plan_y_uuid: string | null;
  jobPosition: UserPanelJobPosition;
  careerPlanY: UserPanelCareerPlanY | null;
}

/** Plano de carreira no painel do usuário */
export interface UserPanelCareerPlan {
  uuid: string;
  name: string;
  careerPlanJobPositions: UserPanelCareerPlanJobPosition[];
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

/** Tópico da aplicação (vinculado ao DRD) */
export interface UserPanelApplicationTopic {
  uuid?: string;
  title?: string;
  base_form_topic_uuid?: string;
  drd_topic_item_uuid?: string;
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
  applicationTopic: UserPanelApplicationTopic | null;
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
  jobPosition?: UserPanelCareerPlanJobPositionRef;
  jobPositionCurrentLevel?: UserPanelJobPositionCurrentLevel;
  careerPlan?: UserPanelCareerPlan;
  evaluationsReceived: UserPanelEvaluationReceived[];
}
