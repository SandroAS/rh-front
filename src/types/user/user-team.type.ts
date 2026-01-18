import type TeamResponse from '../team/team-response.type';
import type { JobPositionPartial } from './user-avatar.type';

export interface UserTeam {
  uuid: string;
  name: string;
  email: string;
  profile_img_url?: string | null;
  jobPosition?: JobPositionPartial;
  teams: TeamResponse[]
}