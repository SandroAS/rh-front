import type { RoleType } from '../user/user-role.type';

export default interface AccountUserPayload {
  name: string;
  email: string;
  cellphone?: string;
  cpf?: string;
  password: string;
  confirmPassword: string;
  role: RoleType;
  job_position_uuid?: string;
  job_position_level_uuid?: string;
  sector_uuid?: string;
  sector_uuids?: string[];
}
