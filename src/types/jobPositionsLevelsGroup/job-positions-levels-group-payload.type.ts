import type JobPositionsLevel from '../jobPositionsLevel/job-positions-level.type';
import type { UserAvatar } from '../user/user-avatar.type';

export default interface JobPositionsLevelsGroupPayload {
  uuid?: string;
  name: string;
  createdBy: UserAvatar;
  jobPositionsLevels?: JobPositionsLevel[];
}
