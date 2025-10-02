import type Sector from '../sector/sector.type';
import type TeamMember from '../teamMember/teamMember.type';
import type { UserAvatar } from '../user/user-avatar.type';

export default interface Team {
  uuid: string;
  createdBy: UserAvatar;
  name: string;
  leader: UserAvatar;
  sector?: Sector;
  teamMembers: TeamMember[];
}
