import type JobPositionsLevel from '../jobPositionsLevel/job-positions-level.type';
import type { UserAvatar } from '../user/user-avatar.type';

export default interface JobPositionsLevelsGroup {
  uuid: string;
  createdBy: UserAvatar;
  name: string;
  jobPositionsLevels: JobPositionsLevel[];
}
