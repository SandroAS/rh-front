import type FormApplicationTopic from './form-application-topic.type';

export default interface FormApplicationPayload {
  uuid?: string;
  name: string;
  topics: FormApplicationTopic[];
}
