import type EvaluationQuestionOption from './evaluation-question-option.type';

export enum QuestionType {
  RATE = 'RATE',
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTI_CHOICE = 'MULTI_CHOICE',
  DROPDOWN = 'DROPDOWN',
}

export interface EvaluationQuestion {
  uuid?: string;
  title: string;
  description: string;
  type: QuestionType;
  order: number;
  options?: EvaluationQuestionOption[];
}
