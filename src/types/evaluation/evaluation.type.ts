import type Form from '../form/form.type';
import type User from '../user/user.type';
import type EvaluationTopic from './evaluation-topic.type';

export default interface Evaluation {
  uuid: string;
  name: string;
  description: string;
  created_by_user_uuid: string;
  rate: number;
  drd_uuid?: string;
  form: Form;
}
