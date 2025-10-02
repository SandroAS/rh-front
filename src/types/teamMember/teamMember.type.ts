import type { UserAvatar } from '../user/user-avatar.type';

export default interface TeamMember {
  uuid: string;
  user: UserAvatar;
}
