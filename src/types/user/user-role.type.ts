export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ASSISTANT = 'ASSISTANT',
  HEALTHCARE_PROFESSIONAL = 'HEALTHCARE_PROFESSIONAL',
  PATIENT = 'PATIENT'
}
export interface UserRole {
  uuid: string;
  name: RoleType;
  permissions: string[];
}
