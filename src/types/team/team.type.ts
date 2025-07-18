import type AccountUser from '../account/account-user.type';

export default interface Team {
  uuid: string;
  name: string;
  users: AccountUser[];
}
