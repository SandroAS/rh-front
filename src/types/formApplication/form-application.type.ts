import type FormApplicationTopic from './form-application-topic.type';

export default interface FormApplication {
  uuid: string,
  accessed_from: string,
  base_form_uuid: string,
  name: string,
  description?: string,
  topics: FormApplicationTopic[];
}
