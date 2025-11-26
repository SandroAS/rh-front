import type Evaluation from '../evaluation/evaluation.type';
import type User from '../user/user.type';
import type { EvaluationApplicationTopic } from './evaluation-application-topic.type';

export enum EvaluationType {
  SELF = 'SELF',
  PEER = 'PEER',
  LEADER = 'LEADER',
  SUBORDINATE = 'SUBORDINATE',
  CLIENT = 'CLIENT',
  OTHER = 'OTHER',
}

export enum EvaluationApplicationStatus {
  CREATED = 'CREATED',
  SENDED = 'SENDED',
  ACCESSED = 'ACCESSED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

export interface EvaluationApplication {
  uuid: string;
  evaluation_model_uuid: string;
  evaluation_model?: Evaluation;
  type: EvaluationType;
  evaluated_user_uuid: string;
  evaluated_user: User;
  submitting_user_uuid: string;
  submitting_user: User;
  started_date: Date;
  expiration_date: Date;
  status: EvaluationApplicationStatus;
  evaluation_application_topics?: EvaluationApplicationTopic[];
}
