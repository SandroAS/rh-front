import type Evaluation from '../evaluation/evaluation.type';
import type { UserAvatar } from '../user/user-avatar.type';
import type { EvaluationApplicationStatus, EvaluationType } from './evaluation-application.type';

export interface CreateEvaluationApplication {
  uuid?: string;
  type: EvaluationType;
  evaluated_user_uuid: string;
  evaluated_user: UserAvatar | null;
  submitting_user_uuid: string;
  submitting_user: UserAvatar | null;
}

export interface EvaluationApplicationPayload {
  uuid?: string;
  evaluation_uuid: string;
  evaluation?: Evaluation;
  started_date?: Date | string;
  expiration_date?: Date | string;
  status: EvaluationApplicationStatus;
  applications?: CreateEvaluationApplication[];
  type?: EvaluationType;
  evaluated_user_uuid?: string;
  evaluated_user?: UserAvatar | null;
  submitting_user_uuid?: string;
  submitting_user?: UserAvatar | null;
}
