import type { UserAvatar } from '../user/user-avatar.type';

export default interface TeamPayload {
  uuid?: string;
  createdBy: UserAvatar;
  name: string;
  leader: string;
  sector_uuid?: string;
  member_uuids: string[];
}
