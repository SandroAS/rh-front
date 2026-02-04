import type { UserAvatar } from '../user/user-avatar.type';

export default interface SectorPayload {
  uuid?: string;
  name: string;
  createdBy: UserAvatar;
  user_uuids?: string[];
}
