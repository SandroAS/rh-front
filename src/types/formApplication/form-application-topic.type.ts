import type FormApplicationQuestion from './form-application-question.type';

export default interface FormApplicationTopic {
  uuid?: string;
  title: string;
  description: string;
  questions: FormApplicationQuestion[];
}
