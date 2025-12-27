import type FormAnswer from '../formAnswer/form-answer.type';

export default interface FormResponse {
  uuid: string;
  is_completed?: boolean;
  answers: FormAnswer[];
}
