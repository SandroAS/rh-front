import type { QuestionType } from '../evaluation/evaluation-question.type';
import type FormApplicationQuestionOption from './form-application-question-option.type';

export default interface FormApplicationQuestion {
  uuid?: string;
  drd_topic_item_uuid?: string;
  title: string;
  description: string;
  type: QuestionType;
  is_required: boolean;
  order: number;
  options?: FormApplicationQuestionOption[];
}
