import type { UserAvatar } from '../user/user-avatar.type';

export default interface Sector {
  uuid: string,
  name: string,
  createdBy?: UserAvatar,
  users?: UserAvatar[]
}
