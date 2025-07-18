import type AccountUser from '../account/account-user.type';

export default interface TeamPayload {
  uuid?: string;
  name: string;
  users?: AccountUser[];
}
