import type { RoleType } from '../user/user-role.type';

export interface Role {
  uuid: string;
  name: RoleType;
  created_at: string;
  permissions: string[];
}
