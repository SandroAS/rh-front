export enum QuestionType {
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
  options?: string[];
}
