import type JobPositionSimple from '../jobPosition/job-position-simple.type';
import type { UserAvatar } from '../user/user-avatar.type';

export default interface DRDSimple {
  uuid: string;
  rate: number;
  jobPosition: JobPositionSimple
  createdByUser: UserAvatar;
}
