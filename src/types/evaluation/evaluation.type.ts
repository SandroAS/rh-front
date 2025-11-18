import type DRD from '../drd/drd.type';
import type Form from '../form/form.type';
import type { UserAvatar } from '../user/user-avatar.type';

export default interface Evaluation {
  uuid: string;
  name: string;
  description: string;
  created_by_user_uuid: string;
  createdBy: UserAvatar;
  rate: number;
  drd_uuid?: string;
  drd?: DRD;
  form: Form;
}
