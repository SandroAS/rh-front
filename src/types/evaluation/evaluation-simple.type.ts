import type DRD from '../drd/drd.type';
import type { UserAvatar } from '../user/user-avatar.type';

export default interface EvaluationSimple {
  uuid: string;
  name: string;
  description: string;
  created_by_user_uuid: string;
  createdBy: UserAvatar;
  rate: number;
  drd_uuid?: string;
  drd?: DRD;
}
