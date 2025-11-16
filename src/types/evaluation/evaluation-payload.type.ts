import type FormPayload from '../form/form-payload.type';

export default interface EvaluationPayload {
  uuid?: string;
  name: string;
  description?: string;
  created_by_user_uuid: string;
  rate: number;
  drd_uuid?: string;
  form: FormPayload;
}
