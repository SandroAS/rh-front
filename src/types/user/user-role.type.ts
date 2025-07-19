export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  LEADER = 'LEADER',
  MEMBER = 'MEMBER'
}
export interface UserRole {
  uuid: string;
  name: RoleType;
  permissions: string[];
}
