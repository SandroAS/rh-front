import type Evaluation from '../evaluation/evaluation.type';
import type FormApplication from '../formApplication/form-application.type';
import type { UserAvatar } from '../user/user-avatar.type';
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
  evaluation_uuid: string;
  evaluation?: Evaluation;
  type: EvaluationType;
  evaluated_user_uuid: string;
  evaluated_user: UserAvatar;
  submitting_user_uuid: string;
  submitting_user: UserAvatar;
  started_date: Date | string;
  expiration_date: Date | string;
  status: EvaluationApplicationStatus;
  evaluation_application_topics?: EvaluationApplicationTopic[];
}

export interface EvaluationApplicationForm {
  uuid: string;
  evaluation_uuid: string;
  evaluation?: Evaluation;
  type: EvaluationType;
  evaluated_user_uuid: string;
  evaluated_user: UserAvatar;
  submitting_user_uuid: string;
  submitting_user: UserAvatar;
  started_date: Date | string;
  expiration_date: Date | string;
  status: EvaluationApplicationStatus;
  formApplication: FormApplication;
}
