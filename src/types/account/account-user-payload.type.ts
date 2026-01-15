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
}
