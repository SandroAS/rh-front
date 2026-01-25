import { QuestionType } from '@/types/evaluation/evaluation-question.type';

export interface QuestionTypeOption {
  value: QuestionType;
  text: string;
  icon: string;
}

export const questionTypesOptions: QuestionTypeOption[] = [
  { value: QuestionType.RATE, text: 'Classificação', icon: 'mdi-star-outline' },
  { value: QuestionType.SHORT_TEXT, text: 'Resposta curta', icon: 'mdi-text-short' },
  { value: QuestionType.LONG_TEXT, text: 'Parágrafo', icon: 'mdi-text' },
  { value: QuestionType.SINGLE_CHOICE, text: 'Múltipla escolha', icon: 'mdi-radiobox-marked' },
  { value: QuestionType.MULTI_CHOICE, text: 'Caixas de seleção', icon: 'mdi-checkbox-marked-outline' },
  { value: QuestionType.DROPDOWN, text: 'Lista suspensa', icon: 'mdi-arrow-down-drop-circle-outline' },
];

export const getQuestionTypeLabel = (type: string | QuestionType): string => {
  const option = questionTypesOptions.find(opt => opt.value === type);
  return option?.text || type;
};

export const getQuestionTypeIcon = (type: string | QuestionType): string => {
  const option = questionTypesOptions.find(opt => opt.value === type);
  return option?.icon || 'mdi-help-circle-outline';
};
