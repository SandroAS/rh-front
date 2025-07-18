import type User from '../user/user.type';

export default interface Team {
  uuid: string;
  name: string;
  users: User[];
}
