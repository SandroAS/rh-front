import type TeamMember from '../teamMember/teamMember.type';
import type { UserAvatar } from '../user/user-avatar.type';

export default interface TeamResponse {
  uuid: string;
  name: string;
  leader: UserAvatar;
  teamMembers: TeamMember[];
}
