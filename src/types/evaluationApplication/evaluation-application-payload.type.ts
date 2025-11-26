import type User from '../user/user.type';
import type { EvaluationApplicationStatus, EvaluationType } from './evaluation-application.type';

export default interface EvaluationApplicationPayload {
  uuid?: string;
  evaluation_model_uuid: string;
  type: EvaluationType;
  evaluated_user_uuid: string;
  submitting_user_uuid: string;
  started_date?: Date;
  expiration_date?: Date;
  status: EvaluationApplicationStatus;
}
