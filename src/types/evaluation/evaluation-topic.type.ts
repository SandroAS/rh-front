import { type EvaluationQuestion } from './evaluation-question.type';

export default interface EvaluationTopic {
  uuid?: string;
  drd_topic_uuid?: string;
  title: string;
  description: string;
  order: number;
  evaluation_questions: EvaluationQuestion[];
}
