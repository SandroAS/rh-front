import type { EvaluationApplicationQuestion } from './evaluation-application-question.type';

export interface EvaluationApplicationTopic {
  uuid?: string;
  title: string;
  description: string;
  evaluation_application_questions: EvaluationApplicationQuestion[];
}
