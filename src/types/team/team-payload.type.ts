import type User from '../user/user.type';

export default interface TeamPayload {
  uuid?: string;
  name: string;
  users: User[];
}
