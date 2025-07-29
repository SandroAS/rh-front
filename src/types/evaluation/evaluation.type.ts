import type User from '../user/user.type';
import type EvaluationTopic from './evaluation-topic.type';

export default interface Evaluation {
  uuid: string;
  title: string;
  description: string;
  created_by_user_uuid: string;
  rate: number;
  drd_uuid?: string;
  evaluation_topics: EvaluationTopic[];
}
