import type Sector from '../sector/sector.type';
import type TeamMember from '../teamMember/teamMember.type';
import type { UserAvatar } from '../user/user-avatar.type';

export default interface Team {
  uuid: string;
  name: string;
  lead: UserAvatar;
  sector?: Sector;
  teamMembers: TeamMember[];
}
