import type Evaluation from '../evaluation/evaluation.type';
import type { EvaluationApplicationTopic } from './evaluation-application-topic.type';

export default interface EvaluationApplication {
  uuid: string;
  evaluation_model_uuid: string;
  evaluation_model?: Evaluation;
  type: 'peer' | 'self' | 'leader';
  requested_by_user_uuid: string;
  evaluated_collaborator_uuid: string;
  evaluator_collaborator_uuid: string;
  application_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  evaluation_application_topics?: EvaluationApplicationTopic[];
}
