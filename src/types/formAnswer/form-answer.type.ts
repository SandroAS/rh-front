import type FormAnswerMultiOption from './form-answer-multi-option.type';

export default interface FormAnswer {
  application_question_uuid: string;
  text_value?: string | null;
  number_value?: number | null;
  application_option_uuid?: string | null;
  multiOptions?: FormAnswerMultiOption[] | null;
}
