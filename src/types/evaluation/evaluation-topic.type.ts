import type EvaluationQuestion from './evaluation-question.type';

export default interface EvaluationTopic {
  uuid?: string;
  title: string;
  description: string;
  evaluation_questions: EvaluationQuestion[];
}
