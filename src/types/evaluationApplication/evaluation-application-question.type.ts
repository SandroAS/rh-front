import type { EvaluationAnswer } from './evaluation-answer.type';

export interface EvaluationApplicationQuestion {
  uuid?: string;
  title: string;
  description: string;
  type: 'text' | 'select' | 'number' | 'options';
  options?: string[];
  evaluation_answers?: EvaluationAnswer[];
}